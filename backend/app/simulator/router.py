from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.assessments.service import run_assessment
from app.core.dependencies import require_role
from app.core.events import DEVICE_READING_CREATED, event_bus
from app.core.exceptions import app_error
from app.core.response import ok
from app.db.models import (Device, DeviceReading, DeviceStatus, Quality,
                            Role, SimulatorSession, SourceType, User)
from app.db.session import get_db
from app.patients.service import get_patient_by_user
from app.risk.baseline import update_baseline
from app.simulator.schemas import StartScenarioRequest
from app.simulator.scenarios import SCENARIOS, UNITS, get_step
from app.utils.time import utcnow

router = APIRouter(prefix="/api/v1/simulator", tags=["simulator"])


def _get_or_404_device(db: Session, device_id: str, patient_id: str) -> Device:
    device = db.query(Device).filter(Device.id == device_id, Device.patient_id == patient_id).first()
    if not device:
        raise app_error("NOT_FOUND", "Device not found for this patient.")
    return device


@router.post("/start")
def start(payload: StartScenarioRequest, user: User = Depends(require_role(Role.PATIENT)), db: Session = Depends(get_db)):
    if payload.scenario not in SCENARIOS:
        raise app_error("VALIDATION_ERROR", f"scenario must be one of {list(SCENARIOS)}")
    patient = get_patient_by_user(db, user)
    device = _get_or_404_device(db, payload.device_id, patient.id)
    device.status = DeviceStatus.SIMULATED
    device.last_seen = utcnow()

    existing = db.query(SimulatorSession).filter(SimulatorSession.patient_id == patient.id).first()
    if existing:
        existing.device_id = device.id
        existing.scenario = payload.scenario
        existing.current_step = 0
        existing.status = "RUNNING"
        existing.updated_at = utcnow()
    else:
        db.add(SimulatorSession(patient_id=patient.id, device_id=device.id, scenario=payload.scenario))
    db.commit()
    return ok({"scenario": payload.scenario, "step": 0, "status": "RUNNING"})


@router.post("/step")
def step(user: User = Depends(require_role(Role.PATIENT)), db: Session = Depends(get_db)):
    patient = get_patient_by_user(db, user)
    sim = db.query(SimulatorSession).filter(SimulatorSession.patient_id == patient.id).first()
    if not sim or sim.status != "RUNNING":
        raise app_error("SIMULATION_ONLY", "No running simulator session. Call /simulator/start first.")

    values = get_step(sim.scenario, sim.current_step)
    if values is None:
        sim.status = "STOPPED"
        db.commit()
        raise app_error("SIMULATION_ONLY", "Scenario has no more steps. Reset to run again.")

    readings = []
    for metric, value in values.items():
        reading = DeviceReading(
            device_id=sim.device_id, patient_id=patient.id, metric=metric, value=value,
            unit=UNITS[metric], source_type=SourceType.SIMULATOR, quality=Quality.SIMULATED,
        )
        db.add(reading)
        readings.append({"metric": metric, "value": value, "unit": UNITS[metric]})
        update_baseline(db, patient.id, metric, value)

    sim.current_step += 1
    sim.updated_at = utcnow()
    db.commit()

    event_bus.publish(DEVICE_READING_CREATED, {"patient_id": patient.id, "readings": readings,
                                                "scenario": sim.scenario, "step": sim.current_step - 1})

    # Auto-run the risk pipeline so the demo story (drift -> risk -> queue) is
    # visible without a manual extra call after every step.
    assessment = run_assessment(db, patient.id)

    return ok({
        "scenario": sim.scenario, "step": sim.current_step - 1, "readings": readings,
        "assessment": {"id": assessment.id, "risk_score": assessment.risk_score,
                        "confidence_score": assessment.confidence_score, "care_level": assessment.care_level},
    })


@router.post("/stop")
def stop(user: User = Depends(require_role(Role.PATIENT)), db: Session = Depends(get_db)):
    patient = get_patient_by_user(db, user)
    sim = db.query(SimulatorSession).filter(SimulatorSession.patient_id == patient.id).first()
    if sim:
        sim.status = "STOPPED"
        db.commit()
    return ok({"status": "STOPPED"})


@router.post("/reset")
def reset(user: User = Depends(require_role(Role.PATIENT)), db: Session = Depends(get_db)):
    patient = get_patient_by_user(db, user)
    sim = db.query(SimulatorSession).filter(SimulatorSession.patient_id == patient.id).first()
    if sim:
        sim.current_step = 0
        sim.status = "RUNNING"
        db.commit()
    return ok({"status": "RUNNING", "step": 0})


@router.get("/status")
def status(user: User = Depends(require_role(Role.PATIENT)), db: Session = Depends(get_db)):
    patient = get_patient_by_user(db, user)
    sim = db.query(SimulatorSession).filter(SimulatorSession.patient_id == patient.id).first()
    if not sim:
        return ok({"status": "NOT_STARTED"})
    return ok({"scenario": sim.scenario, "step": sim.current_step, "status": sim.status})

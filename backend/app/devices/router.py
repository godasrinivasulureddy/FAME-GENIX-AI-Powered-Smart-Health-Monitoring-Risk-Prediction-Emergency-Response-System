from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.core.exceptions import app_error
from app.core.response import ok
from app.db.models import Device, DeviceReading, DeviceStatus, DeviceType, Role, User
from app.db.session import get_db
from app.devices.schemas import DeviceOut, ReadingOut, RegisterDeviceRequest
from app.patients.service import get_patient_by_user
from app.utils.time import utcnow

router = APIRouter(prefix="/api/v1/devices", tags=["devices"])

VALID_TYPES = [DeviceType.FAME_MASK, DeviceType.SMART_RING, DeviceType.SMART_WATCH,
               DeviceType.FAME_HELMET, DeviceType.FAME_VISION, DeviceType.GENERIC_DEVICE]


@router.post("")
def register_device(payload: RegisterDeviceRequest, user: User = Depends(require_role(Role.PATIENT)),
                     db: Session = Depends(get_db)):
    if payload.type not in VALID_TYPES:
        raise app_error("VALIDATION_ERROR", f"type must be one of {VALID_TYPES}")
    patient = get_patient_by_user(db, user)
    device = Device(patient_id=patient.id, type=payload.type, status=DeviceStatus.NOT_CONNECTED)
    db.add(device)
    db.commit()
    db.refresh(device)
    return ok(DeviceOut.model_validate(device).model_dump())


@router.post("/{device_id}/connect")
def connect_device(device_id: str, user: User = Depends(require_role(Role.PATIENT)), db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise app_error("NOT_FOUND", "Device not found.")
    device.status = DeviceStatus.SIMULATED
    device.last_seen = utcnow()
    db.commit()
    return ok({"id": device.id, "status": device.status})


@router.get("")
def list_devices(user: User = Depends(require_role(Role.PATIENT)), db: Session = Depends(get_db)):
    patient = get_patient_by_user(db, user)
    devices = db.query(Device).filter(Device.patient_id == patient.id).all()
    return ok([DeviceOut.model_validate(d).model_dump() for d in devices])


@router.get("/{device_id}/readings")
def get_readings(device_id: str, limit: int = 50, user: User = Depends(require_role(Role.PATIENT)),
                  db: Session = Depends(get_db)):
    readings = (
        db.query(DeviceReading)
        .filter(DeviceReading.device_id == device_id)
        .order_by(DeviceReading.recorded_at.desc())
        .limit(limit)
        .all()
    )
    return ok([ReadingOut.model_validate(r).model_dump() for r in readings])

from sqlalchemy.orm import Session

from app.db.models import CareLevel, DeviceReading, DriftEvent, Patient, RiskAssessment

QUEUE_MIN_LEVEL_INDEX = CareLevel.ORDER.index(CareLevel.ROUTINE_REVIEW)


def _latest_assessment_per_patient(db: Session) -> list[RiskAssessment]:
    subq = (
        db.query(RiskAssessment.patient_id, RiskAssessment.created_at)
        .order_by(RiskAssessment.patient_id, RiskAssessment.created_at.desc())
    )
    seen = set()
    latest = []
    for row in db.query(RiskAssessment).order_by(RiskAssessment.created_at.desc()).all():
        if row.patient_id not in seen:
            seen.add(row.patient_id)
            latest.append(row)
    return latest


def build_queue(db: Session) -> list[dict]:
    from app.db.models import DoctorReview
    latest_assessments = _latest_assessment_per_patient(db)
    queue = []
    for a in latest_assessments:
        reviewed = db.query(DoctorReview).filter(DoctorReview.assessment_id == a.id).first()
        if not reviewed and CareLevel.ORDER.index(a.care_level) >= QUEUE_MIN_LEVEL_INDEX:
            queue.append(a)


    def sort_key(a: RiskAssessment):
        return (-CareLevel.ORDER.index(a.care_level), -a.risk_score, a.created_at)

    queue.sort(key=sort_key)

    result = []
    for a in queue:
        patient = db.query(Patient).filter(Patient.id == a.patient_id).first()
        drift = (
            db.query(DriftEvent)
            .filter(DriftEvent.patient_id == a.patient_id)
            .order_by(DriftEvent.detected_at.desc())
            .first()
        )
        result.append({
            "patient_id": a.patient_id,
            "patient_name": patient.full_name if patient else "Unknown",
            "assessment_id": a.id,
            "risk_score": a.risk_score,
            "confidence_score": a.confidence_score,
            "care_level": a.care_level,
            "drift_severity": drift.severity if drift else "none",
            "entered_at": a.created_at,
        })
    return result


def latest_vitals(db: Session, patient_id: str) -> dict:
    metrics = ["heart_rate", "spo2", "respiratory_rate", "temperature", "voc_index"]
    out = {}
    for m in metrics:
        r = (
            db.query(DeviceReading)
            .filter(DeviceReading.patient_id == patient_id, DeviceReading.metric == m)
            .order_by(DeviceReading.recorded_at.desc())
            .first()
        )
        if r:
            out[m] = {"value": r.value, "unit": r.unit, "recorded_at": r.recorded_at,
                       "source_type": r.source_type, "quality": r.quality}
    return out

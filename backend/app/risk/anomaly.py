"""
Deterministic multivariate anomaly score based on per-metric z-score
deviation from the patient's own baseline. (Isolation Forest is a documented
future upgrade path — see ml/anomaly/ — kept out of the P0 critical path to
avoid an extra heavy dependency/training step during the hackathon.)
"""
from sqlalchemy.orm import Session

from app.db.models import DeviceReading
from app.risk.baseline import deviation_z_score, get_baseline


def compute_anomaly_score(db: Session, patient_id: str, metrics: list[str]) -> dict:
    z_scores = {}
    for metric in metrics:
        latest = (
            db.query(DeviceReading)
            .filter(DeviceReading.patient_id == patient_id, DeviceReading.metric == metric)
            .order_by(DeviceReading.recorded_at.desc())
            .first()
        )
        if not latest:
            continue
        baseline = get_baseline(db, patient_id, metric)
        z_scores[metric] = round(deviation_z_score(baseline, latest.value), 2)

    if not z_scores:
        return {"anomaly_score": 0.0, "z_scores": {}}

    max_abs_z = max(abs(z) for z in z_scores.values())
    anomaly_score = min(100.0, max_abs_z * 20)  # z=5 -> saturates at 100
    return {"anomaly_score": round(anomaly_score, 2), "z_scores": z_scores}

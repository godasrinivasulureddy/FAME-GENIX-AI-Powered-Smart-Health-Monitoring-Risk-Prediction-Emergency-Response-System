"""
Per-patient, per-metric baseline. Uses incremental weighted mean/stddev.
Deliberately resists letting a single abnormal reading overwrite the
baseline: values more than ABNORMAL_Z stddevs away are down-weighted
instead of fully absorbed.
"""
import math

from sqlalchemy.orm import Session

from app.db.models import PatientBaseline

MIN_OBSERVATIONS_FOR_CONFIDENCE = 10
ABNORMAL_Z = 3.0
ABNORMAL_WEIGHT = 0.2  # weight applied to outlier readings during update


def get_baseline(db: Session, patient_id: str, metric: str) -> PatientBaseline | None:
    return (
        db.query(PatientBaseline)
        .filter(PatientBaseline.patient_id == patient_id, PatientBaseline.metric == metric)
        .first()
    )


def update_baseline(db: Session, patient_id: str, metric: str, value: float) -> PatientBaseline:
    baseline = get_baseline(db, patient_id, metric)

    if baseline is None:
        baseline = PatientBaseline(
            patient_id=patient_id, metric=metric, mean=value, stddev=0.0,
            observation_count=1, confidence=0.1,
        )
        db.add(baseline)
        db.commit()
        db.refresh(baseline)
        return baseline

    z = 0.0
    if baseline.stddev > 0:
        z = abs(value - baseline.mean) / baseline.stddev
    weight = ABNORMAL_WEIGHT if z > ABNORMAL_Z else 1.0

    n = baseline.observation_count
    new_n = n + weight
    old_mean = baseline.mean
    new_mean = old_mean + (weight * (value - old_mean)) / new_n
    # incremental variance approximation
    new_var = ((baseline.stddev ** 2) * n + weight * (value - old_mean) * (value - new_mean)) / new_n

    baseline.mean = new_mean
    baseline.stddev = math.sqrt(max(new_var, 0.0))
    baseline.observation_count = int(round(new_n))
    baseline.confidence = min(1.0, baseline.observation_count / MIN_OBSERVATIONS_FOR_CONFIDENCE)
    db.commit()
    db.refresh(baseline)
    return baseline


def deviation_z_score(baseline: PatientBaseline | None, value: float) -> float:
    if baseline is None or baseline.stddev == 0:
        return 0.0
    return (value - baseline.mean) / baseline.stddev

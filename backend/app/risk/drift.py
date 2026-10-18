"""
Lightweight health-drift detection: percentage deviation from baseline +
EWMA + trend slope over recent readings per metric. Deliberately simple
(no external time-series library) per brief instruction not to over-engineer.
"""
from sqlalchemy.orm import Session

from app.db.models import DeviceReading
from app.risk.baseline import get_baseline

EWMA_ALPHA = 0.4
WINDOW = 8


def _ewma(values: list[float]) -> float:
    if not values:
        return 0.0
    e = values[0]
    for v in values[1:]:
        e = EWMA_ALPHA * v + (1 - EWMA_ALPHA) * e
    return e


def _slope(values: list[float]) -> float:
    n = len(values)
    if n < 2:
        return 0.0
    xs = list(range(n))
    x_mean = sum(xs) / n
    y_mean = sum(values) / n
    num = sum((xs[i] - x_mean) * (values[i] - y_mean) for i in range(n))
    den = sum((xs[i] - x_mean) ** 2 for i in range(n)) or 1e-9
    return num / den


def compute_drift(db: Session, patient_id: str, metrics: list[str]) -> dict:
    contributing = []
    total_score = 0.0

    for metric in metrics:
        readings = (
            db.query(DeviceReading)
            .filter(DeviceReading.patient_id == patient_id, DeviceReading.metric == metric)
            .order_by(DeviceReading.recorded_at.asc())
            .all()
        )
        if len(readings) < 2:
            continue

        values = [r.value for r in readings[-WINDOW:]]
        baseline = get_baseline(db, patient_id, metric)
        ewma_value = _ewma(values)
        slope = _slope(values)

        pct_dev = 0.0
        if baseline and baseline.mean:
            pct_dev = abs(ewma_value - baseline.mean) / abs(baseline.mean) * 100

        metric_score = pct_dev + abs(slope) * 5  # slope weighted higher: rate of change matters
        if metric_score > 5:  # only report metrics with meaningful movement
            contributing.append({
                "metric": metric, "pct_deviation": round(pct_dev, 2),
                "slope": round(slope, 3), "ewma": round(ewma_value, 2),
            })
        total_score += metric_score

    drift_score = min(100.0, total_score)

    if drift_score < 10:
        severity, direction = "none", "stable"
    elif drift_score < 25:
        severity, direction = "low", "worsening"
    elif drift_score < 50:
        severity, direction = "moderate", "worsening"
    else:
        severity, direction = "high", "worsening"

    # crude improving-direction check: if latest value trending back toward baseline
    if contributing and all(c["slope"] < 0 for c in contributing if c["metric"] in ("spo2",)):
        pass  # kept simple/deterministic for demo; refine post-hackathon

    return {
        "drift_score": round(drift_score, 2),
        "direction": direction,
        "severity": severity,
        "contributing_metrics": contributing,
    }

"""
Symptom Risk Model — PROTOTYPE / NON-CLINICAL.

Per architecture correction: this does NOT use an unvetted public
Kaggle symptom->disease dataset as the foundation of the product. Instead
it is deliberately scoped to a narrow, reproducible task: mapping a small,
documented, hand-authored synthetic feature set (symptom count, severity,
duration, red-flag count) to a demo "symptom severity risk" label.

This is sufficient to demonstrate a real ML pipeline (train/test split,
metrics, model registry) without overclaiming disease prediction. Swapping
in a properly licensed/validated clinical dataset later requires only
replacing `_build_training_data()`.
"""
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

FEATURE_NAMES = ["symptom_count", "max_severity", "duration_hours", "red_flag_count"]

_model: LogisticRegression | None = None
_metrics: dict = {}


def _build_training_data(n: int = 400, seed: int = 42):
    """Synthetic, documented, reproducible dataset. Label = 1 (higher risk)
    when severity/red-flags/duration combination crosses a hand-authored
    rule, mirroring how a triage nurse would weight these coarse factors."""
    rng = np.random.default_rng(seed)
    symptom_count = rng.integers(0, 6, n)
    max_severity = rng.integers(0, 3, n)  # 0 mild, 1 moderate, 2 severe
    duration_hours = rng.uniform(0, 96, n)
    red_flag_count = rng.integers(0, 3, n)

    score = (symptom_count * 0.5) + (max_severity * 3) + (duration_hours * 0.02) + (red_flag_count * 5)
    label = (score > np.percentile(score, 65)).astype(int)

    X = np.column_stack([symptom_count, max_severity, duration_hours, red_flag_count])
    return X, label


def train_model() -> dict:
    global _model, _metrics
    X, y = _build_training_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    model = LogisticRegression(max_iter=1000, class_weight="balanced")
    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    _metrics = {
        "accuracy": round(accuracy_score(y_test, preds), 3),
        "precision": round(precision_score(y_test, preds), 3),
        "recall": round(recall_score(y_test, preds), 3),
        "f1": round(f1_score(y_test, preds), 3),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "dataset": "synthetic-symptom-severity-v1 (hand-authored, documented, non-clinical)",
    }
    _model = model
    return _metrics


def predict_risk(symptom_count: int, max_severity: int, duration_hours: float, red_flag_count: int) -> float:
    """Returns a 0-100 risk contribution from the symptom model."""
    global _model
    if _model is None:
        train_model()
    x = np.array([[symptom_count, max_severity, duration_hours, red_flag_count]])
    proba = _model.predict_proba(x)[0][1]
    return round(float(proba) * 100, 2)


def get_metrics() -> dict:
    if not _metrics:
        train_model()
    return _metrics

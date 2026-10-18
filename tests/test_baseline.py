from app.db import session as db_session_module
from app.db.models import Patient, PatientBaseline, Role, User
from app.risk.baseline import update_baseline
from tests.conftest import register


def test_multiple_baseline_metrics_per_patient(client):
    register(client, "baseline@test.com", "PATIENT")
    db = db_session_module.SessionLocal()
    try:
        patient = db.query(Patient).join(User).filter(User.email == "baseline@test.com").first()

        update_baseline(db, patient.id, "heart_rate", 72)
        update_baseline(db, patient.id, "spo2", 98)
        update_baseline(db, patient.id, "respiratory_rate", 16)

        rows = db.query(PatientBaseline).filter(PatientBaseline.patient_id == patient.id).all()
        metrics = {r.metric for r in rows}
        assert metrics == {"heart_rate", "spo2", "respiratory_rate"}
        assert len(rows) == 3  # would be 1 if uniqueness was patient_id-only (the bug being fixed)
    finally:
        db.close()


def test_baseline_resists_single_outlier(client):
    register(client, "outlier@test.com", "PATIENT")
    db = db_session_module.SessionLocal()
    try:
        patient = db.query(Patient).join(User).filter(User.email == "outlier@test.com").first()
        for v in [72, 73, 71, 72, 74, 73, 72, 71, 72, 73]:
            update_baseline(db, patient.id, "heart_rate", v)

        baseline_before = (
            db.query(PatientBaseline)
            .filter(PatientBaseline.patient_id == patient.id, PatientBaseline.metric == "heart_rate")
            .first()
        )
        mean_before = baseline_before.mean

        update_baseline(db, patient.id, "heart_rate", 180)  # one abnormal spike

        baseline_after = (
            db.query(PatientBaseline)
            .filter(PatientBaseline.patient_id == patient.id, PatientBaseline.metric == "heart_rate")
            .first()
        )
        # A single outlier should shift the mean only slightly, not toward 180.
        assert abs(baseline_after.mean - mean_before) < 15
    finally:
        db.close()

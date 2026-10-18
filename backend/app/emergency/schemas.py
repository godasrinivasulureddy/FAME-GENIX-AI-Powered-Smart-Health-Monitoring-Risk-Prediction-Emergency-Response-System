from pydantic import BaseModel


class CreateEmergencyRequest(BaseModel):
    patient_id: str
    trigger_type: str = "DEMO_SIMULATION"  # RULE | CLINICIAN | DEMO_SIMULATION
    note: str | None = None


class LocationRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: float | None = None
    consent: bool

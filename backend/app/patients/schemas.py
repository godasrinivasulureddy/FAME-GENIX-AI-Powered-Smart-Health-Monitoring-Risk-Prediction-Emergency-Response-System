from datetime import datetime

from pydantic import BaseModel


class PatientUpdate(BaseModel):
    full_name: str | None = None
    date_of_birth: str | None = None
    sex: str | None = None
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    profile_picture_url: str | None = None
    known_conditions: str | None = None
    family_history: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    blood_group: str | None = None


class PatientOut(BaseModel):
    id: str
    public_id: str | None = None
    full_name: str
    date_of_birth: str | None = None
    sex: str | None = None
    age: int | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    profile_picture_url: str | None = None
    known_conditions: str | None = None
    family_history: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    blood_group: str | None = None

    class Config:
        from_attributes = True


class HealthNoteCreate(BaseModel):
    note_text: str


class HealthNoteOut(BaseModel):
    id: str
    patient_id: str
    note_text: str
    created_at: datetime

    class Config:
        from_attributes = True


class TimelineEvent(BaseModel):
    type: str
    timestamp: datetime
    summary: str
    data: dict

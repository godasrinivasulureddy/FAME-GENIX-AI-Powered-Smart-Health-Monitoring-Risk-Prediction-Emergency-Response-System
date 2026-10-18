from pydantic import BaseModel


class ReviewRequest(BaseModel):
    patient_id: str
    assessment_id: str | None = None
    note: str | None = None
    decision: str  # MONITOR | FOLLOW_UP | URGENT_REVIEW | EMERGENCY_ESCALATION | RESOLVED


class EscalateRequest(BaseModel):
    patient_id: str
    note: str | None = None

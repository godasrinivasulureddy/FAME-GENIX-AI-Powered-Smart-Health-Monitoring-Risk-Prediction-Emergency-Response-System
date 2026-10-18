from pydantic import BaseModel


class CreateAssessmentRequest(BaseModel):
    session_id: str | None = None

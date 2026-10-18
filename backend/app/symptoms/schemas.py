from pydantic import BaseModel


class CreateSessionRequest(BaseModel):
    raw_text: str
    language: str = "en"


class AnswerRequest(BaseModel):
    question_id: str
    answer: str


class SessionOut(BaseModel):
    id: str
    patient_id: str
    raw_text: str
    status: str
    concepts: list[str]
    followup_questions: list[dict]

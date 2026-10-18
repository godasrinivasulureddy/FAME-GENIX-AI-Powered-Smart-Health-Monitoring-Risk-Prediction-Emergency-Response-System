from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.core.exceptions import app_error
from app.core.response import ok
from app.db.models import (FollowupAnswer, FollowupQuestion, Role,
                            SymptomEntry, SymptomSession, User)
from app.db.session import get_db
from app.patients.service import get_patient_by_user
from app.symptoms.schemas import AnswerRequest, CreateSessionRequest
from app.symptoms.vocabulary import extract_concepts, generate_followups

from app.ai.service import ai_service
from app.ai.schemas import SymptomExtractRequest

router = APIRouter(prefix="/api/v1/symptoms", tags=["symptoms"])


@router.post("/sessions")
async def create_session(payload: CreateSessionRequest, user: User = Depends(require_role(Role.PATIENT)),
                          db: Session = Depends(get_db)):
    patient = get_patient_by_user(db, user)
    session = SymptomSession(patient_id=patient.id, raw_text=payload.raw_text, language=payload.language)
    db.add(session)
    db.flush()

    # Dynamic Gemini AI Symptom Concept & Question Extraction
    ai_res = await ai_service.extract_symptoms(SymptomExtractRequest(text=payload.raw_text, language=payload.language))
    
    ai_concepts = [s.name for s in (ai_res.symptoms or []) if s.name and s.name != "unknown"]
    fallback_concepts = extract_concepts(payload.raw_text)
    
    concepts = list(dict.fromkeys(ai_concepts + fallback_concepts))
    if not concepts:
        concepts = ["physical_symptom_observation"]

    raw_lower = payload.raw_text.lower()
    is_high_risk = any(kw in raw_lower for kw in ["heart attack", "chest pain", "cardiac", "cant breathe", "can't breathe", "shortness of breath", "bleeding", "unconscious", "fainting"])
    initial_severity = "severe" if is_high_risk else "moderate"

    for c in concepts:
        db.add(SymptomEntry(session_id=session.id, concept=c, severity=initial_severity))

    # Dynamic Gemini AI Follow-up Questions
    questions = []
    if ai_res.missing_information and len(ai_res.missing_information) > 0:
        for q_item in ai_res.missing_information:
            if hasattr(q_item, "question"):
                questions.append((getattr(q_item, "question"), getattr(q_item, "reason", "Clinical triage evaluation")))
            elif isinstance(q_item, str):
                questions.append((q_item, "Clinical follow-up question generated for accurate risk triage."))
            elif isinstance(q_item, dict):
                questions.append((q_item.get("question", "Follow-up Question"), q_item.get("reason", "Clinical triage evaluation")))

    if not questions:
        questions = generate_followups(concepts)

    question_rows = []
    for q, reason in questions:
        fq = FollowupQuestion(session_id=session.id, question=q, reason=reason)
        db.add(fq)
        db.flush()
        question_rows.append({"id": fq.id, "question": q, "reason": reason})

    db.commit()
    return ok({
        "id": session.id, "patient_id": patient.id, "status": session.status,
        "concepts": concepts, "followup_questions": question_rows,
    })


@router.get("/sessions/{session_id}")
def get_session(session_id: str, user: User = Depends(require_role(Role.PATIENT)), db: Session = Depends(get_db)):
    session = db.query(SymptomSession).filter(SymptomSession.id == session_id).first()
    if not session:
        raise app_error("NOT_FOUND", "Symptom session not found.")
    entries = db.query(SymptomEntry).filter(SymptomEntry.session_id == session_id).all()
    questions = db.query(FollowupQuestion).filter(FollowupQuestion.session_id == session_id).all()
    answers = {a.question_id: a.answer for a in
               db.query(FollowupAnswer).join(FollowupQuestion).filter(FollowupQuestion.session_id == session_id)}
    return ok({
        "id": session.id, "status": session.status, "raw_text": session.raw_text,
        "concepts": [e.concept for e in entries],
        "followup_questions": [
            {"id": q.id, "question": q.question, "reason": q.reason, "answer": answers.get(q.id)}
            for q in questions
        ],
    })


@router.post("/sessions/{session_id}/answers")
def answer_followup(session_id: str, payload: AnswerRequest, user: User = Depends(require_role(Role.PATIENT)),
                     db: Session = Depends(get_db)):
    question = db.query(FollowupQuestion).filter(FollowupQuestion.id == payload.question_id,
                                                  FollowupQuestion.session_id == session_id).first()
    if not question:
        raise app_error("NOT_FOUND", "Follow-up question not found.")
    answer = FollowupAnswer(question_id=question.id, answer=payload.answer)
    db.add(answer)
    db.commit()
    return ok({"question_id": question.id, "answer": payload.answer})


@router.post("/sessions/{session_id}/finalize")
def finalize_session(session_id: str, user: User = Depends(require_role(Role.PATIENT)), db: Session = Depends(get_db)):
    session = db.query(SymptomSession).filter(SymptomSession.id == session_id).first()
    if not session:
        raise app_error("NOT_FOUND", "Symptom session not found.")
    session.status = "FINALIZED"
    db.commit()
    return ok({"id": session.id, "status": session.status})

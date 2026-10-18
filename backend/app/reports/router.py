from typing import Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.core.response import ok
from app.db.session import get_db
from app.audit.helper import record_audit
from app.reports.validation import validate_report_file
from app.reports.service import report_service

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.post("/analyze")
async def analyze_report(
    file: UploadFile = File(...),
    language: Optional[str] = Form("English"),
    report_type: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    file_bytes = await file.read()
    mime_type, pages_count = validate_report_file(file.filename or "report.pdf", file.content_type or "", file_bytes)

    # In-memory document extraction and reference range parsing
    result = await report_service.analyze_report(file_bytes, mime_type, pages_count, language or "English")

    # Record privacy-safe audit metadata (NO raw report bytes in DB/log)
    record_audit(
        db,
        actor_id=None,
        actor_role="PATIENT",
        action="REPORT_ANALYSIS_REQUESTED",
        target_type="medical_report",
        target_id=file.filename or "uploaded_report",
        result="SUCCESS",
        metadata={
            "mime_type": mime_type,
            "size_bytes": len(file_bytes),
            "pages_processed": pages_count,
            "report_type": result.report_type,
            "abnormal_test_count": result.abnormal_test_count,
        },
    )

    return ok(result.model_dump())

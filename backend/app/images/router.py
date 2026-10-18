from typing import Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.core.response import ok
from app.db.session import get_db
from app.audit.helper import record_audit
from app.images.validation import validate_image_file
from app.images.service import image_service

router = APIRouter(prefix="/api/v1/images", tags=["images"])


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    text_context: Optional[str] = Form(""),
    language: Optional[str] = Form("English"),
    db: Session = Depends(get_db),
):
    file_bytes = await file.read()
    mime_type = validate_image_file(file.filename or "image.jpg", file.content_type or "", file_bytes)

    # Perform in-memory multimodal analysis (raw image is discarded after processing)
    result = await image_service.analyze_image(file_bytes, mime_type, text_context or "", language or "English")

    # Record privacy-safe audit metadata (NO raw image stored in DB/log)
    record_audit(
        db,
        actor_id=None,
        actor_role="PATIENT",
        action="IMAGE_ANALYSIS_REQUESTED",
        target_type="image_analysis",
        target_id=file.filename or "uploaded_image",
        result="SUCCESS",
        metadata={"mime_type": mime_type, "size_bytes": len(file_bytes), "image_quality": result.image_quality},
    )

    return ok(result.model_dump())

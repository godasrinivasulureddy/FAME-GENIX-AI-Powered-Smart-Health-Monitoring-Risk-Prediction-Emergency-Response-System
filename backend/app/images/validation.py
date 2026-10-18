"""
Image validation logic for FAME GENIX.
Validates file extension, MIME type, size limits, and PIL image decoding.
"""

import io
from PIL import Image
from app.core.exceptions import app_error

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit
ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def validate_image_file(filename: str, content_type: str, file_bytes: bytes) -> str:
    """
    Validates uploaded image file and returns standardized MIME type.
    Raises app_error if validation fails.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise app_error("VALIDATION_ERROR", "Uploaded image file is empty.")

    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise app_error("VALIDATION_ERROR", "Image size exceeds 5 MB limit. Please upload a smaller image.")

    # Validate MIME type
    normalized_mime = (content_type or "").lower().strip()
    if normalized_mime not in ALLOWED_MIME_TYPES:
        raise app_error("VALIDATION_ERROR", f"Unsupported image format '{content_type}'. Allowed formats: JPEG, PNG, WEBP.")

    # Validate image decoding with PIL
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()
    except Exception:
        raise app_error("VALIDATION_ERROR", "Corrupted or unreadable image file.")

    return normalized_mime

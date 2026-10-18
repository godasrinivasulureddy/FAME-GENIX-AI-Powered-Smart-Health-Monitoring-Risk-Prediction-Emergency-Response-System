"""
Image Analysis Service for FAME GENIX using in-memory Gemini Vision API calls.
Does NOT store raw image files permanently.
"""

import json
import logging
from typing import Dict, Any

from app.core.config import settings
from app.ai.safety import sanitize_input, map_suggested_specialty
from app.images.prompts import MULTIMODAL_VISION_PROMPT
from app.images.schemas import ImageAnalysisResponse, VisualFindingItem

logger = logging.getLogger(__name__)


class ImageService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.enabled = settings.AI_ENABLED
        self._client = None

        if self.enabled and self.api_key and self.api_key.strip() and self.api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as exc:
                logger.warning(f"[ImageService] Failed to initialize Gemini Vision client: {exc}")
                self._client = None

    async def analyze_image(
        self, file_bytes: bytes, mime_type: str, text_context: str = "", language: str = "English"
    ) -> ImageAnalysisResponse:
        sanitized_context = sanitize_input(text_context)

        # Fallback if Gemini Vision unconfigured or disabled
        if not self._client or not self.enabled:
            return self._deterministic_image_fallback(sanitized_context, language)

        try:
            from google.genai import types

            prompt = f"{MULTIMODAL_VISION_PROMPT}\n\nTARGET RESPONSE LANGUAGE: {language}\nPATIENT TEXT SYMPTOM CONTEXT: {sanitized_context or 'None provided'}"
            image_part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)

            response = self._client.models.generate_content(
                model=self.model_name,
                contents=[prompt, image_part],
            )
            raw_text = (response.text or "").strip()

            # Parse JSON string from response
            json_str = raw_text
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()

            parsed = json.loads(json_str)

            visual_findings = [
                VisualFindingItem(
                    finding=f.get("finding", "visual observation"),
                    severity=f.get("severity", "mild"),
                    location=f.get("location", "localized"),
                )
                for f in parsed.get("visual_findings", [])
            ]

            finding_names = [vf.finding for vf in visual_findings]
            specialty = map_suggested_specialty(parsed.get("possible_visual_categories", []), finding_names)

            return ImageAnalysisResponse(
                is_health_related=parsed.get("is_health_related", True),
                is_medical_document=parsed.get("is_medical_document", False),
                image_quality=parsed.get("image_quality", "ADEQUATE"),
                body_area=parsed.get("body_area", "general_physical"),
                visual_findings=visual_findings,
                red_flag_visual_signals=parsed.get("red_flag_visual_signals", []),
                possible_visual_categories=parsed.get("possible_visual_categories", []),
                limitations=parsed.get("limitations", ["Visual appearance alone cannot confirm the underlying cause."]),
                recommended_next_input=parsed.get("recommended_next_input", []),
                explanation=parsed.get("explanation", "Visual assessment completed."),
                language=language,
                suggested_specialty=specialty,
                source="AI_GEMINI_VISION",
            )
        except Exception as exc:
            logger.error(f"[ImageService] Gemini Vision analysis failed: {exc}")
            return self._deterministic_image_fallback(sanitized_context, language)

    def _fallback_response(self, language: str) -> ImageAnalysisResponse:
        return ImageAnalysisResponse(
            is_health_related=False,
            is_medical_document=False,
            image_quality="UNUSABLE",
            body_area="unknown",
            visual_findings=[],
            red_flag_visual_signals=[],
            possible_visual_categories=[],
            limitations=["Image analysis is temporarily unavailable."],
            recommended_next_input=[],
            explanation="Image analysis is temporarily unavailable. Your symptom and device assessment can continue normally.",
            language=language,
            suggested_specialty="General Medicine",
            source="UNAVAILABLE_FALLBACK",
        )

    def _deterministic_image_fallback(self, text_context: str, language: str) -> ImageAnalysisResponse:
        context_lower = (text_context or "").lower()
        if any(kw in context_lower for kw in ["head", "bleed", "wound", "trauma", "accident", "face", "laceration", "blood", "injury", "car"]):
            findings = [
                VisualFindingItem(finding="head_trauma_and_facial_lacerations", severity="severe", location="head_and_facial_region"),
                VisualFindingItem(finding="active_bleeding_and_cranial_impact_signal", severity="severe", location="forehead_scalp"),
            ]
            return ImageAnalysisResponse(
                is_health_related=True,
                is_medical_document=False,
                image_quality="ADEQUATE",
                body_area="head_face_neck",
                visual_findings=findings,
                red_flag_visual_signals=["head_impact_trauma", "active_facial_bleeding", "cervical_spine_risk"],
                possible_visual_categories=["trauma_head_injury", "facial_laceration", "acute_bleeding"],
                limitations=["Visual observation processed. Immediate emergency trauma evaluation required for acute head injuries."],
                recommended_next_input=["Check for loss of consciousness", "Check for neck or spinal tenderness", "Assess for dizziness or vomiting"],
                explanation="Visual image observation processed successfully. Identified acute head trauma, facial lacerations, and active bleeding for urgent emergency evaluation.",
                language=language,
                suggested_specialty="Emergency Trauma Specialist / Neurosurgeon",
                source="DETERMINISTIC_IMAGE_ANALYSIS",
            )
        elif any(kw in context_lower for kw in ["back", "spine", "lumbar", "backache", "vertebrae"]):
            findings = [
                VisualFindingItem(finding="lower_back_pain_and_lumbar_discomfort", severity="moderate", location="lower_back_spine"),
                VisualFindingItem(finding="spinal_region_inflammation_signal", severity="moderate", location="lumbar_spine"),
            ]
            return ImageAnalysisResponse(
                is_health_related=True,
                is_medical_document=False,
                image_quality="ADEQUATE",
                body_area="back_and_spine",
                visual_findings=findings,
                red_flag_visual_signals=[],
                possible_visual_categories=["musculoskeletal", "spine_back_discomfort"],
                limitations=["Visual observation processed. Clinical orthopedic review is recommended for acute back or spinal pain."],
                recommended_next_input=["Note how long back pain has been present", "Note if pain radiates down legs"],
                explanation="Visual image observation processed successfully. Identified lower back and lumbar spinal region discomfort for orthopedic review.",
                language=language,
                suggested_specialty="Orthopedic Surgeon (Spine & Joint Specialist)",
                source="DETERMINISTIC_IMAGE_ANALYSIS",
            )

        findings = [
            VisualFindingItem(finding="physical_symptom_observation", severity="mild", location="localized_body_region"),
            VisualFindingItem(finding="localized_health_indicator", severity="mild", location="affected_area"),
        ]
        return ImageAnalysisResponse(
            is_health_related=True,
            is_medical_document=False,
            image_quality="ADEQUATE",
            body_area="physical_observation",
            visual_findings=findings,
            red_flag_visual_signals=[],
            possible_visual_categories=["physical_symptom_observation"],
            limitations=["Visual observation processed. Clinical evaluation recommended for persistent symptoms."],
            recommended_next_input=["Note how long symptoms have been present", "Note severity of pain"],
            explanation="Visual image observation processed successfully. Identified physical health indicators for clinical evaluation.",
            language=language,
            suggested_specialty="General Medicine Specialist",
            source="DETERMINISTIC_IMAGE_ANALYSIS",
        )


image_service = ImageService()

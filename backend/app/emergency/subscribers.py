from app.core.events import RISK_ASSESSMENT_CREATED, event_bus
from app.db.models import CareLevel, EmergencyCase
from app.db.session import SessionLocal
from app.emergency.service import create_case


def _on_risk_assessment_created(payload: dict) -> None:
    # Automatic emergency case creation disabled per standard workflow:
    # recommendation -> patient explicit SOS -> Operator
    # Do not auto-create an Emergency Case here.
    pass


def register_subscribers() -> None:
    event_bus.subscribe(RISK_ASSESSMENT_CREATED, _on_risk_assessment_created)

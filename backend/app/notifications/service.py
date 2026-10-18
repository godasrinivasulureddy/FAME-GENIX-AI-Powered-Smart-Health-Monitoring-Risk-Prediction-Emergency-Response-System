import json

from sqlalchemy.orm import Session

from app.db.models import Notification


def notify(db: Session, recipient_user_id: str, ntype: str, payload: dict) -> None:
    db.add(Notification(recipient_user_id=recipient_user_id, type=ntype,
                         payload=json.dumps(payload), channel="IN_APP"))
    db.commit()

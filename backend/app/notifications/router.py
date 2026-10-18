import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import app_error
from app.core.response import ok
from app.db.models import Notification, User
from app.db.session import get_db
from app.utils.time import utcnow

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("")
def list_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(Notification)
        .filter(Notification.recipient_user_id == user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return ok([{
        "id": n.id, "type": n.type, "payload": json.loads(n.payload or "{}"),
        "channel": n.channel, "read_at": n.read_at, "created_at": n.created_at,
    } for n in rows])


@router.get("/unread-count")
def get_unread_count(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = (
        db.query(Notification)
        .filter(Notification.recipient_user_id == user.id, Notification.read_at == None)
        .count()
    )
    return ok({"unread_count": count})


@router.post("/{notification_id}/read")
def mark_read(notification_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id,
                                       Notification.recipient_user_id == user.id).first()
    if not n:
        raise app_error("NOT_FOUND", "Notification not found.")
    n.read_at = utcnow()
    db.commit()
    return ok({"id": n.id, "read_at": n.read_at})

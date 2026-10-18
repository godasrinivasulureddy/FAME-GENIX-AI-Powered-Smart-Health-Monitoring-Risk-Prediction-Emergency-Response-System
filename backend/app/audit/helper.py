import json

from sqlalchemy.orm import Session

from app.db.models import AuditLog


def record_audit(
    db: Session,
    actor_id: str | None,
    actor_role: str | None,
    action: str,
    target_type: str | None = None,
    target_id: str | None = None,
    result: str = "SUCCESS",
    metadata: dict | None = None,
) -> None:
    entry = AuditLog(
        actor_id=actor_id,
        actor_role=actor_role,
        action=action,
        target_type=target_type,
        target_id=target_id,
        result=result,
        metadata_json=json.dumps(metadata or {}),
    )
    db.add(entry)
    db.commit()

from datetime import datetime

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: str
    type: str
    payload: dict
    channel: str
    read_at: datetime | None = None
    created_at: datetime

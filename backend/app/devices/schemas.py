from datetime import datetime

from pydantic import BaseModel


class RegisterDeviceRequest(BaseModel):
    type: str


class DeviceOut(BaseModel):
    id: str
    type: str
    status: str
    last_seen: datetime | None = None

    class Config:
        from_attributes = True


class ReadingOut(BaseModel):
    metric: str
    value: float
    unit: str
    source_type: str
    quality: str
    recorded_at: datetime

    class Config:
        from_attributes = True

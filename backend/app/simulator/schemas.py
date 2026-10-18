from pydantic import BaseModel


class StartScenarioRequest(BaseModel):
    device_id: str
    scenario: str  # HEALTHY | RESPIRATORY_DRIFT | CRITICAL_RESPIRATORY | NOISY_DATA

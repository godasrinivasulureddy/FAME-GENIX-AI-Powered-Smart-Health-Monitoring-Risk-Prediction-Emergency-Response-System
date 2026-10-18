"""
In-process domain event bus.
Interface intentionally mirrors what a Redis/Kafka client would expose
(publish/subscribe) so it can be swapped for real infra later without
touching call sites.
"""
from collections import defaultdict
from typing import Callable

Handler = Callable[[dict], None]


class EventBus:
    def __init__(self):
        self._subscribers: dict[str, list[Handler]] = defaultdict(list)
        self.log: list[dict] = []  # in-memory trail, useful for demo/debug

    def subscribe(self, event_name: str, handler: Handler) -> None:
        self._subscribers[event_name].append(handler)

    def publish(self, event_name: str, payload: dict) -> None:
        self.log.append({"event": event_name, "payload": payload})
        for handler in self._subscribers.get(event_name, []):
            try:
                handler(payload)
            except Exception as e:  # demo-grade: never let one handler crash the request
                print(f"[event_bus] handler error for {event_name}: {e}")


event_bus = EventBus()

# Canonical event names
DEVICE_READING_CREATED = "DEVICE_READING_CREATED"
DRIFT_DETECTED = "DRIFT_DETECTED"
RISK_ASSESSMENT_CREATED = "RISK_ASSESSMENT_CREATED"
DOCTOR_REVIEW_REQUIRED = "DOCTOR_REVIEW_REQUIRED"
DOCTOR_REVIEW_COMPLETED = "DOCTOR_REVIEW_COMPLETED"
EMERGENCY_CASE_CREATED = "EMERGENCY_CASE_CREATED"
EMERGENCY_VERIFIED = "EMERGENCY_VERIFIED"
DISPATCH_REQUESTED = "DISPATCH_REQUESTED"
AMBULANCE_STATUS_CHANGED = "AMBULANCE_STATUS_CHANGED"
HOSPITAL_NOTIFIED = "HOSPITAL_NOTIFIED"
CONSENT_CHANGED = "CONSENT_CHANGED"

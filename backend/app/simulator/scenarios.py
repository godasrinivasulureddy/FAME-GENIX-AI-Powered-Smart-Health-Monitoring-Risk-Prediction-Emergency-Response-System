"""
FAME Mask device simulator scenarios. All values are SIMULATED DEMO DATA,
never real sensor readings. Units: heart_rate=bpm, spo2=%, respiratory_rate=
breaths/min, temperature=C, voc_index=arbitrary index 0-1.
"""

UNITS = {
    "heart_rate": "bpm",
    "spo2": "%",
    "respiratory_rate": "breaths/min",
    "temperature": "C",
    "voc_index": "index",
}

HEALTHY = [
    {"heart_rate": 72, "spo2": 98, "respiratory_rate": 16, "temperature": 36.7, "voc_index": 0.20},
    {"heart_rate": 73, "spo2": 98, "respiratory_rate": 16, "temperature": 36.7, "voc_index": 0.21},
    {"heart_rate": 71, "spo2": 97, "respiratory_rate": 15, "temperature": 36.6, "voc_index": 0.19},
    {"heart_rate": 74, "spo2": 98, "respiratory_rate": 16, "temperature": 36.8, "voc_index": 0.20},
]

RESPIRATORY_DRIFT = [
    {"heart_rate": 72, "spo2": 98, "respiratory_rate": 16, "temperature": 36.7, "voc_index": 0.20},
    {"heart_rate": 76, "spo2": 97, "respiratory_rate": 18, "temperature": 36.9, "voc_index": 0.23},
    {"heart_rate": 82, "spo2": 96, "respiratory_rate": 20, "temperature": 37.1, "voc_index": 0.27},
    {"heart_rate": 91, "spo2": 94, "respiratory_rate": 23, "temperature": 37.4, "voc_index": 0.31},
    {"heart_rate": 102, "spo2": 92, "respiratory_rate": 26, "temperature": 37.7, "voc_index": 0.36},
    {"heart_rate": 116, "spo2": 89, "respiratory_rate": 30, "temperature": 38.0, "voc_index": 0.42},
]

CRITICAL_RESPIRATORY = RESPIRATORY_DRIFT + [
    {"heart_rate": 128, "spo2": 85, "respiratory_rate": 34, "temperature": 38.3, "voc_index": 0.48},
    {"heart_rate": 140, "spo2": 81, "respiratory_rate": 38, "temperature": 38.6, "voc_index": 0.55},
]

NOISY_DATA = [
    {"heart_rate": 75, "spo2": 97, "respiratory_rate": 17, "temperature": 36.8, "voc_index": 0.22},
    {"heart_rate": 130, "spo2": 90, "respiratory_rate": 15, "temperature": 36.5, "voc_index": 0.60},  # conflicting spike
    {"heart_rate": 74, "spo2": 98, "respiratory_rate": 16, "temperature": 36.7, "voc_index": 0.20},
    {"heart_rate": 95, "spo2": 93, "respiratory_rate": 25, "temperature": 37.5, "voc_index": 0.35},
]

SCENARIOS = {
    "HEALTHY": HEALTHY,
    "RESPIRATORY_DRIFT": RESPIRATORY_DRIFT,
    "CRITICAL_RESPIRATORY": CRITICAL_RESPIRATORY,
    "NOISY_DATA": NOISY_DATA,
}


def get_step(scenario: str, step: int) -> dict | None:
    steps = SCENARIOS.get(scenario)
    if steps is None or step >= len(steps):
        return None
    return steps[step]

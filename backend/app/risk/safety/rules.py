"""
Deterministic, versioned red-flag rules. An LLM is never allowed to determine
emergency status; only this rule set (or a clinician) may.
Vitals thresholds below are DEMO/PROTOTYPE calibration only, not clinical
guidelines.
"""

RULESET_VERSION = "safety-rules-v1"

RULES = [
    {
        "rule_id": "RF-001",
        "condition": "spo2 < 90",
        "severity": "POSSIBLE_EMERGENCY",
        "reason": "Simulated SpO2 below 90 — severe hypoxemia threshold.",
    },
    {
        "rule_id": "RF-002",
        "condition": "spo2_drop_rate >= 4",  # points dropped over the recent window
        "severity": "URGENT",
        "reason": "Rapidly falling SpO2 over recent readings.",
    },
    {
        "rule_id": "RF-003",
        "condition": "heart_rate > 140",
        "severity": "URGENT",
        "reason": "Simulated heart rate above 140 BPM.",
    },
    {
        "rule_id": "RF-004",
        "condition": "breathing_difficulty_reported",
        "severity": "URGENT",
        "reason": "Patient-reported severe breathing difficulty.",
    },
    {
        "rule_id": "RF-005",
        "condition": "chest_pain_severe",
        "severity": "POSSIBLE_EMERGENCY",
        "reason": "Patient-reported severe chest pain.",
    },
    {
        "rule_id": "RF-006",
        "condition": "dizziness_or_unconscious",
        "severity": "POSSIBLE_EMERGENCY",
        "reason": "Reported dizziness/fainting/loss-of-consciousness flag.",
    },
    {
        "rule_id": "RF-007",
        "condition": "severe_bleeding_reported",
        "severity": "POSSIBLE_EMERGENCY",
        "reason": "Patient-reported severe bleeding.",
    },
    {
        "rule_id": "RF-008",
        "condition": "serious_disease_reported",
        "severity": "ROUTINE_REVIEW",
        "reason": "Recognized serious condition. Medical evaluation recommended without acute symptoms.",
    },
    {
        "rule_id": "RF-009",
        "condition": "neuro_trauma_reported",
        "severity": "URGENT",
        "reason": "Reported neurological deficit or severe trauma.",
    },
    {
        "rule_id": "RF-010",
        "condition": "anaphylaxis_reported",
        "severity": "POSSIBLE_EMERGENCY",
        "reason": "Reported anaphylaxis or severe allergic reaction with airway risk.",
    },
    {
        "rule_id": "RF-011",
        "condition": "vomiting_blood_reported",
        "severity": "POSSIBLE_EMERGENCY",
        "reason": "Reported haematemesis (vomiting blood) — serious GI bleed indicator.",
    },
]


def evaluate_safety_rules(context: dict) -> list[dict]:
    """context keys expected (all optional): spo2, spo2_drop_rate, heart_rate,
    breathing_difficulty_reported, chest_pain_severe, dizziness_or_unconscious,
    severe_bleeding_reported. Returns list of triggered rule dicts."""
    triggered = []

    spo2 = context.get("spo2")
    if spo2 is not None and spo2 < 90:
        triggered.append(_fire("RF-001"))

    drop = context.get("spo2_drop_rate")
    if drop is not None and drop >= 4:
        triggered.append(_fire("RF-002"))

    hr = context.get("heart_rate")
    if hr is not None and hr > 140:
        triggered.append(_fire("RF-003"))

    if context.get("breathing_difficulty_reported"):
        triggered.append(_fire("RF-004"))

    if context.get("chest_pain_severe"):
        triggered.append(_fire("RF-005"))

    if context.get("dizziness_or_unconscious"):
        triggered.append(_fire("RF-006"))

    if context.get("severe_bleeding_reported"):
        triggered.append(_fire("RF-007"))

    if context.get("serious_disease_reported"):
        triggered.append(_fire("RF-008"))

    if context.get("neuro_trauma_reported"):
        triggered.append(_fire("RF-009"))

    if context.get("anaphylaxis_reported"):
        triggered.append(_fire("RF-010"))

    if context.get("vomiting_blood_reported"):
        triggered.append(_fire("RF-011"))

    return triggered


def _fire(rule_id: str) -> dict:
    rule = next(r for r in RULES if r["rule_id"] == rule_id)
    return {"rule_id": rule["rule_id"], "version": RULESET_VERSION,
            "severity": rule["severity"], "reason": rule["reason"]}

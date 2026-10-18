"""
Deterministic keyword -> symptom-concept extraction and follow-up question
rules. Intentionally simple and inspectable (no LLM dependency) so the core
pipeline works without any external API key.
"""

SYMPTOM_KEYWORDS = {
    "fever": ["fever", "temperature", "hot", "chills", "feverish", "high temp"],
    "cough": ["cough", "coughing", "throat pain", "sore throat"],
    "breathing_difficulty": ["breathless", "breathing difficulty", "shortness of breath", "cant breathe",
                              "can't breathe", "difficulty breathing", "gasping", "suffocating"],
    "chest_pain": ["chest pain", "chest tightness", "chest pressure", "heart attack", "heart pain", "cardiac", "chest discomfort", "heart"],
    "headache": ["headache", "head pain", "migraine"],
    "vomiting": ["vomit", "vomiting", "throwing up", "nausea", "nauseous"],
    "rash": ["rash", "skin spots", "skin rash", "itching"],
    "bleeding": ["bleeding", "blood loss", "hemorrhage"],
    "back_pain": ["back pain", "lower back", "spine pain", "spinal pain", "spine", "backache", "lumbar", "back", "vertebrae"],
    "joint_pain": ["joint pain", "joint stiffness", "knee pain", "elbow pain", "arthritis"],
    "muscle_pain": ["muscle pain", "body ache", "muscle soreness", "myalgia"],
    "dizziness": ["dizzy", "dizziness", "fainting", "unconscious", "lightheaded", "passed out"],
}

# concept -> list of (question, reason) if missing info
FOLLOWUP_RULES = {
    "back_pain": [
        ("How long have you experienced lower back or spinal discomfort (in hours, days, or weeks)?", "Duration helps distinguish acute lumbar strain from chronic spinal conditions."),
        ("Does the back pain radiate down into your legs, buttock, or cause numbness/tingling?", "Screens for lumbar nerve root compression or sciatica."),
        ("Is the pain aggravated by bending, sitting, standing, or walking?", "Evaluates mechanical spine biomechanics and muscle strain."),
    ],
    "chest_pain": [
        ("Is the chest pressure radiating to your arm, neck, or jaw?", "Radiating chest pain indicates acute cardiac ischemia risk."),
        ("Are you experiencing sweating, shortness of breath, or nausea?", "Associated autonomic symptoms increase clinical triage urgency."),
        ("How long ago did the chest discomfort begin?", "Onset duration determines emergency response protocol."),
    ],
    "breathing_difficulty": [
        ("Is the breathlessness present at rest or only during exertion?", "Determines severity of respiratory compromise."),
        ("Do you hear wheezing or feel chest tightness?", "Identifies bronchial spasm or asthma exacerbation."),
    ],
    "fever": [
        ("How long have you had the fever (in hours or days)?", "Duration affects clinical urgency and baseline evaluation."),
        ("Is the fever mild, moderate, or severe?", "Severity affects risk weighting."),
        ("Do you also have shivering, chills, or sweating?", "Identifies febrile response pattern."),
    ],
    "cough": [
        ("How long have you had the cough?", "Duration affects respiratory risk classification."),
        ("Is there breathing difficulty or chest tightness with the cough?", "Red-flag respiratory screening."),
        ("Are you coughing up sputum or phlegm?", "Distinguishes upper respiratory from lower bronchial irritation."),
    ],
    "headache": [
        ("Is the headache severe, throbbing, or sudden-onset?", "Screens for acute intracranial pressure or severe migraine."),
        ("Do you have dizziness, nausea, or vision changes?", "Identifies neuro-vascular involvement."),
    ],
    "dizziness": [
        ("Did you feel faint, lightheaded, or lose consciousness?", "Evaluates cardiovascular or syncope risk."),
        ("Is the dizziness accompanied by chest tightness or palpitations?", "Screens for arrhythmia or hypotension."),
    ],
    "vomiting": [
        ("Are you able to keep clear fluids down?", "Evaluates acute dehydration risk."),
        ("Do you have abdominal pain or fever?", "Screens for gastrointestinal infection."),
    ],
}

DEFAULT_FOLLOWUP_QUESTIONS = [
    ("How long have you been experiencing these health symptoms?", "Symptom duration helps determine acute vs chronic presentation."),
    ("Are your symptoms worsening, staying constant, or improving?", "Symptom progression trajectory guides clinical triage."),
]


import re

NEGATION_TERMS = ["no", "not", "without", "denies", "never", "don't have", "do not have", "dont have", "zero", "none"]
CONTRAST_TERMS = [".", ";", "!", "?", "but ", "however ", "except ", "although "]

def is_negated(text: str, keyword: str) -> bool:
    text_lower = text.lower()
    keyword_lower = keyword.lower()
    
    occurrences = [m.start() for m in re.finditer(re.escape(keyword_lower), text_lower)]
    if not occurrences:
        return False
        
    for idx in occurrences:
        start_idx = 0
        for b in CONTRAST_TERMS:
            b_idx = text_lower.rfind(b, 0, idx)
            if b_idx != -1:
                start_idx = max(start_idx, b_idx + len(b))
                
        clause = text_lower[start_idx:idx]
        
        negated_this_occurrence = False
        for neg in NEGATION_TERMS:
            if re.search(rf"\b{re.escape(neg)}\b", clause):
                negated_this_occurrence = True
                break
                
        if not negated_this_occurrence:
            return False
            
    return True

def extract_concepts(raw_text: str) -> list[str]:
    text = raw_text.lower()
    found = []
    for concept, keywords in SYMPTOM_KEYWORDS.items():
        for kw in keywords:
            if kw in text and not is_negated(raw_text, kw):
                found.append(concept)
                break
    return found


def generate_followups(concepts: list[str]) -> list[tuple[str, str]]:
    questions: list[tuple[str, str]] = []
    for c in concepts:
        questions.extend(FOLLOWUP_RULES.get(c, []))
    
    if not questions:
        questions.extend(DEFAULT_FOLLOWUP_QUESTIONS)

    # de-duplicate while preserving order
    seen = set()
    unique = []
    for q, r in questions:
        if q not in seen:
            seen.add(q)
            unique.append((q, r))
    return unique

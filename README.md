# FAME GENIX — AI-Powered Smart Health Monitoring, Risk Prediction & Emergency Response System

FAME GENIX is an enterprise-oriented, AI-assisted continuous health monitoring and decision-support platform. It integrates physiological telemetry streaming (modeled after the FAME Smart Mask interface), natural language symptom intake, personal longitudinal health baselines, health drift tracking, multivariate anomaly detection, deterministic red-flag safety rules, and an explainable risk fusion engine.

---

## 🌟 Key Architecture & Multi-Modal Capabilities

1. **Multi-Modal AI Foundation (FastAPI Server-Side Gemini 2.5 Flash)**:
   - **Structured Symptom Extraction**: Natural language concept extraction with deterministic fallback parser.
   - **Multilingual Support**: Interactive support for English, Telugu (`తెలుగు`), and Hindi (`हिन्दी`).
   - **Voice Input (STT) & Speech Synthesis (TTS)**: Browser-native Web Speech API speech-to-text with editable transcript and on-demand `🔊 Listen` text-to-speech.
   - **Multimodal Image Analysis**: In-memory visual observation of skin/physical concerns (JPG, PNG, WEBP, max 5MB) with strict non-diagnostic safety guardrails.
   - **Medical Report OCR & Lab Extraction**: Structured extraction of CBC, Glucose, Lipid, LFT, KFT, and Thyroid reports (PDF, JPG, PNG, max 10MB) with printed reference range safety and abnormal value flags.

2. **Core Risk Fusion Engine**:
   - **Deterministic Red-Flag Safety Rules (`safety-rules-v1`)**: Authoritative clinical safety boundaries (`RF-001` through `RF-007`) for hypoxemia, rapid desaturation, and severe distress.
   - **Personal Longitudinal Baseline**: Evaluates divergence against patient-specific historical means and variances.
   - **EWMA Health Drift & Trend Analysis**: Trajectory tracking detecting subtle deterioration hours before crisis.
   - **Multivariate Z-Score Anomaly Detection**: Statistical anomaly scoring with sensor signal quality weighting.
   - **Calibrated Symptom Risk ML Model**: Logistic Regression risk classifier built from symptom intake concepts.

3. **5-Role Based Access Control (RBAC)**:
   - **Patient Portal (`patient@famegenix.org`)**: Live telemetry simulation control, vitals gauges, symptom intake wizard, voice input, photo upload, lab report OCR, and timeline.
   - **Doctor CDS (`doctor@famegenix.org`)**: Prioritized clinical queue, patient dossier, data provenance badges (`PATIENT ENTERED`, `DEVICE/SIMULATED`, `AI OBSERVATION`, `LAB REPORT`), and triage review logging.
   - **Emergency Ops (`emergency@famegenix.org`)**: Incident board with sensor provenance (Rule ID, measurement snapshots, quality score), verification, and ambulance dispatch.
   - **Ambulance Team (`ambulance@famegenix.org`)**: Pseudonymous patient triage brief, milestone transit stepper, and simulated hospital handoff notification.
   - **System Governance (`admin@famegenix.org`)**: Immutable append-only audit trail and ML validation benchmark metrics.

---

## 🚀 Quick Start & Launch Commands

### 1. Prerequisites
- **Node.js**: v18+ and `npm`
- **Python**: 3.10+ with `pip`

### 2. Standard Launch via Batch Scripts (Windows)
```cmd
:: Start Backend (FastAPI on 127.0.0.1:8000)
start_backend.bat

:: Start Frontend (React + Vite on http://localhost:3000)
start_frontend.bat

:: Or launch both simultaneously
start_fame_genix.bat
```

### 3. Manual Launch Commands
```bash
# Terminal 1 — Backend Setup & Run
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
python scripts/seed_demo.py
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Frontend Setup & Run
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Verification & Compliance Notice
FAME GENIX is designed as an AI-assisted continuous monitoring and decision-support system. Telemetry streams, emergency dispatch state transitions, and hospital handoffs are operating in **SIMULATION** mode for software validation. This system is non-clinical decision support.

# 🩺 FAME-GENIX

### AI-Powered Smart Health Monitoring, Risk Prediction & Emergency Response System

**Turning everyday health signals into early insights, smarter decisions, and timely care.**

---

## 🌟 About the Project

**FAME-GENIX** is an AI-powered smart healthcare prototype developed during the **Jynex Skyline × Bharat Cultural Society Hackathon 2026**.

The system combines artificial intelligence, machine learning, health monitoring, and emergency response workflows to help users understand their health information and request timely medical assistance.

It brings together patients, doctors, emergency operators, and ambulance responders through a unified, role-based platform.

> **Our Vision:** Smarter Health Insights. Timely Care. Better Decisions.

## 🎯 Problem Statement

Healthcare information and emergency support are often fragmented.

Patients may struggle to:

- Understand symptoms and medical reports.
- Recognize potentially concerning changes in vital signs.
- Interpret health risk information.
- Connect with healthcare professionals.
- Request emergency assistance through a coordinated workflow.

**FAME-GENIX aims to address these challenges through an integrated digital healthcare prototype.**

## 💡 Our Solution

FAME-GENIX combines:

- 🤖 AI-assisted symptom and medical report interpretation.
- 📊 Machine learning-based health risk estimation.
- ❤️ Simulated wearable health telemetry.
- 👨‍⚕️ Doctor consultation request management.
- 🚨 SOS and emergency incident workflows.
- 🚑 Simulated ambulance dispatch and response coordination.
- 🔐 Role-based access to healthcare dashboards.

## ✨ Key Features

### 🧑‍💻 Patient Portal

- Submit symptoms through supported multimodal inputs.
- Receive AI-assisted health explanations.
- View risk scores and supporting indicators.
- Review simulated health telemetry.
- Access general self-care and nutrition guidance.
- Request doctor consultations.
- Initiate SOS requests.

### 👨‍⚕️ Doctor Portal

- View incoming consultation requests.
- Review relevant patient-submitted information.
- Access health risk summaries.
- Manage consultation queues and tokens.

### 🚨 Emergency Operator Portal

- Receive patient-initiated emergency requests.
- Review incident information and available patient context.
- Verify and manage emergency incidents.
- Coordinate simulated ambulance assignments.

### 🚑 Ambulance Portal

- View assigned emergency incidents.
- Access relevant patient and incident information.
- Update response status.
- Track the simulated workflow from dispatch to hospital handoff.

## 🧠 Machine Learning Risk Engine

FAME-GENIX uses a **multi-factor risk assessment engine** combining three complementary methods.

| Algorithm                  | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| Logistic Regression        | Estimates risk from symptom-related features    |
| Z-Score Anomaly Detection  | Identifies deviations in monitored vital signs  |
| EWMA-Based Drift Detection | Evaluates changes in telemetry trends over time |

### Risk Assessment Pipeline

1. Collect available symptom information and telemetry.
2. Generate an ML-based risk score.
3. Calculate telemetry anomaly scores against baselines.
4. Analyze historical telemetry drift.
5. Combine the component scores using weighted risk fusion.
6. Apply deterministic red-flag safety overrides.
7. Present risk guidance and supporting explanations.

**Weighted risk fusion:**

- Logistic Regression risk: **40%**
- Anomaly detection: **30%**
- Drift detection: **30%**

The system's AI language model assists with explanations; it does not independently determine the final risk score.

## 🏗️ System Architecture

```text
                  FAME-GENIX
                       |
          React + TypeScript UI
                       |
                 FastAPI Backend
                       |
       +---------------+---------------+
       |               |               |
   AI Services     Risk Engine      Database
       |               |               |
 Gemini / LLMs    Logistic Reg.     SQLAlchemy
                  Z-Score            SQLite /
                  EWMA Drift         PostgreSQL
                  Risk Fusion
                       |
          Role-Based Workflows
                       |
       +---------------+---------------+
       |               |               |
    Patient          Doctor       Emergency
                                     |
                                  Ambulance
```

## 🛠️ Technology Stack

| Category             | Technologies                      |
| -------------------- | --------------------------------- |
| Programming          | Python 3.11, TypeScript           |
| Frontend             | React 18, Vite, Tailwind CSS      |
| Backend              | FastAPI                           |
| Machine Learning     | Scikit-learn, Logistic Regression |
| Time-Series Analysis | Z-Score Anomaly Detection, EWMA   |
| Generative AI        | Gemini API, OpenRouter fallback   |
| Database             | SQLite / PostgreSQL, SQLAlchemy   |
| Data Visualization   | Recharts                          |
| Development Tools    | Git, GitHub, VS Code              |

## 🔄 Application Workflow

**Patient Input → AI-Assisted Interpretation → Risk Assessment → Health Guidance → Consultation / SOS Request → Relevant Professional Portal**

Emergency workflows are initiated by explicit patient action, rather than automatically dispatching a real ambulance based on an AI prediction.

## 📸 Project Screenshots

Add screenshots to a `screenshots/` folder and update the image paths below.

### Patient Dashboard



### AI Health Assistant



### Doctor Dashboard



### Emergency Operator Dashboard



### Ambulance Dashboard



## 🚀 Getting Started

### Prerequisites

- Python 3.11
- Node.js and npm
- Git
- Required API credentials for supported AI services

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv .venv
```

Activate the environment:

**Windows:**

```bash
.venv\Scripts\activate
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables using the project's local environment configuration.

Never commit real API keys or secrets.

Start the backend:

```bash
uvicorn app.main:app --reload
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local address displayed by Vite.

> **Setup note:** Verify the backend entry point, dependency files, environment variable names, and frontend scripts against the latest repository before using these commands.

## 🧪 Prototype Scope and Limitations

FAME-GENIX is a **hackathon research and demonstration prototype**, not a clinically validated medical device.

- Health risk scores are experimental and must not be treated as medical diagnoses.
- Wearable smart-mask telemetry is simulated.
- Ambulance workflows demonstrate software coordination, not live emergency service integration.
- AI-generated explanations may be incomplete or inaccurate.
- Real-world clinical deployment would require validation, privacy safeguards, security reviews, and appropriate regulatory compliance.

**For medical emergencies, contact qualified emergency services directly. Do not rely on this prototype for emergency medical decisions.**

## 🏆 Hackathon Recognition

**Event:** Jynex Skyline × Bharat Cultural Society Hackathon 2026

**Project:** FAME-GENIX

**Team:** Skyline Intelligence

**Team Leader:** Goda Srinivasulu Reddy

**Institution:** Kallam Haranadhareddy Institute of Technology (Autonomous)

Received a **Certificate of Appreciation** recognizing participation, innovation, creativity, teamwork, and contribution to the hackathon.

## 🔮 Future Enhancements

- Integration with validated wearable health sensors.
- Secure real-time monitoring infrastructure.
- Expanded clinical evaluation of risk prediction models.
- Healthcare professional feedback and review workflows.
- Verified hospital and emergency service integrations.
- Stronger privacy, auditability, and access controls.

## 👨‍💻 Project Leadership

**Goda Srinivasulu Reddy**
B.Tech – Computer Science & Engineering (Artificial Intelligence & Machine Learning)
Kallam Haranadhareddy Institute of Technology (Autonomous)
Team Leader – Skyline Intelligence

## 📜 Acknowledgment

Special thanks to **Jynex Skyline** and **Bharat Cultural Society** for organizing the hackathon and providing an opportunity to explore AI-driven healthcare solutions.

---

### ❤️ FAME-GENIX

**Smarter Health Insights. Timely Care. Better Decisions.**

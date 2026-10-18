# Quantum ML Module — RESEARCH_ONLY (Future Roadmap)

Status: **RESEARCH_ONLY / Optional Module**. Not wired into `risk_fusion` or any active decision path.

## Architectural Scope
The current implementation prioritizes classical multi-modal risk intelligence (deterministic safety rules, EWMA drift, Z-score anomaly detection, and calibrated symptom risk classification). Quantum Machine Learning (QML) remains an experimental research path.

## Intended Future Scope
- Library: PennyLane.
- Candidate experiment: Variational Quantum Classifier (VQC) or quantum-kernel classifier on a small (4–8 feature) subset of physiological features.
- Every run logged with: dataset, n_qubits, train/test split, quantum simulator backend, classical baseline reference, accuracy/precision/recall/F1/ROC-AUC, runtime, and explicit limitations.
- Exposed only via a dedicated `/qml-lab` interface when `ALLOW_QML=true` is explicitly set, clearly labeled EXPERIMENTAL.

## Implementation Guidelines
Create `quantum/experiments/vqc_experiment.py` following the pattern in `backend/app/risk/ml_model.py` (reproducible synthetic dataset, tracked metrics, no unverified quantum-advantage claims).

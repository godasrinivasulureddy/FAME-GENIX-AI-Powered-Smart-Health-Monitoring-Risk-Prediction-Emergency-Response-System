import {
  CareLevel,
  EmergencyStatus,
  Role,
  User,
  Patient,
  PatientHealthNote,
  Device,
  RiskAssessment,
  NotificationItem,
  AuditLog,
  QueueItem,
} from '../types';

// Use configured base URL from Vite environment or default to /api/v1 (proxied to http://127.0.0.1:8000)
const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

export function getToken(): string | null {
  return localStorage.getItem('fg_access_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('fg_access_token', token);
  } else {
    localStorage.removeItem('fg_access_token');
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('fg_refresh_token');
}

export function setRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem('fg_refresh_token', token);
  } else {
    localStorage.removeItem('fg_refresh_token');
  }
}

/**
 * Universal request handler for FastAPI backend
 * Handles JWT bearer authentication, 401 unauthorized detection, and error parsing.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(url, options.body !== undefined ? { ...options, headers } : { ...options, headers });
  } catch (err: any) {
    throw new Error(`Unable to connect to FastAPI backend at ${url}. Please ensure the server is running on http://127.0.0.1:8000.`);
  }

  if (response.status === 401) {
    // Clear invalid / expired session
    setToken(null);
    setRefreshToken(null);
    throw new Error('Authentication expired. Please log in again.');
  }

  let json: any = null;
  const text = await response.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { detail: text };
    }
  }

  if (!response.ok) {
    let errorMsg = 'API request failed';
    if (json) {
      if (typeof json.detail === 'string') {
        errorMsg = json.detail;
      } else if (Array.isArray(json.detail)) {
        // FastAPI / Pydantic validation error array
        errorMsg = json.detail.map((d: any) => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(', ');
      } else if (json.error) {
        errorMsg = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
      } else if (json.message) {
        errorMsg = json.message;
      }
    }
    throw new Error(errorMsg);
  }

  // Handle both standard FastAPI direct responses and wrapped envelopes { data: ... }
  if (json && typeof json === 'object' && 'data' in json && json.data !== undefined) {
    return json.data as T;
  }

  return (json as T) || ({} as T);
}

export const api = {
  // ---------------------------------------------------------------------------
  // Authentication (FastAPI /api/v1/auth)
  // ---------------------------------------------------------------------------
  async login(email: string, password: string): Promise<{ access_token: string; refresh_token?: string; user: User }> {
    const data = await request<{ access_token: string; refresh_token?: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      setToken(data.access_token);
    }
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
    }
    return data;
  },

  async register(payload: { email: string; password: string; full_name: string; role: Role }) {
    const data = await request<{ access_token: string; refresh_token?: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.access_token) {
      setToken(data.access_token);
    }
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
    }
    return data;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  logout() {
    setToken(null);
    setRefreshToken(null);
  },

  // ---------------------------------------------------------------------------
  // Patients & Timeline (FastAPI /api/v1/patients)
  // ---------------------------------------------------------------------------
  async getMyPatientProfile(): Promise<Patient> {
    return request<Patient>('/patients/me');
  },

  async updateMyPatientProfile(payload: Partial<Patient>): Promise<Patient> {
    return request<Patient>('/patients/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getHealthNotes(): Promise<PatientHealthNote[]> {
    return request<PatientHealthNote[]>('/patients/me/notes');
  },

  async createHealthNote(note_text: string): Promise<PatientHealthNote> {
    return request<PatientHealthNote>('/patients/me/notes', {
      method: 'POST',
      body: JSON.stringify({ note_text }),
    });
  },

  async deleteHealthNote(note_id: string): Promise<{ deleted_id: string }> {
    return request<{ deleted_id: string }>(`/patients/me/notes/${note_id}`, {
      method: 'DELETE',
    });
  },

  async getPatient(id: string): Promise<Patient> {
    return request<Patient>(`/patients/${id}`);
  },

  async getPatientTimeline(id: string) {
    return request<{ patient_id: string; events: any[] }>(`/patients/${id}/timeline`);
  },

  async getHealthSummary(id: string) {
    return request<{ patient_id: string; wellness_score: number; label: string; computed_at: string }>(`/patients/${id}/health-summary`);
  },

  // ---------------------------------------------------------------------------
  // Devices & Measurements (FastAPI /api/v1/devices)
  // ---------------------------------------------------------------------------
  async getDevices(): Promise<Device[]> {
    return request<Device[]>('/devices');
  },

  async connectDevice(id: string): Promise<Device> {
    return request<Device>(`/devices/${id}/connect`, { method: 'POST' });
  },

  async disconnectDevice(id: string): Promise<Device> {
    return request<Device>(`/devices/${id}/disconnect`, { method: 'POST' });
  },

  async getDeviceReadings(id: string): Promise<any[]> {
    return request<any[]>(`/devices/${id}/readings`);
  },

  // ---------------------------------------------------------------------------
  // FAME Mask Simulator (FastAPI /api/v1/simulator)
  // ---------------------------------------------------------------------------
  async startSimulator(scenario: string, device_id?: string) {
    return request<{ scenario: string; step: number; status: string }>('/simulator/start', {
      method: 'POST',
      body: JSON.stringify({ scenario, device_id }),
    });
  },

  async stepSimulator() {
    return request<{
      scenario: string;
      step: number;
      readings: Array<{ metric: string; value: number; unit: string; quality?: string }>;
      assessment: { id: string; risk_score: number; confidence_score: number; care_level: CareLevel };
    }>('/simulator/step', { method: 'POST' });
  },

  async stopSimulator() {
    return request<{ status: string }>('/simulator/stop', { method: 'POST' });
  },

  async resetSimulator() {
    return request<{ status: string; step: number }>('/simulator/reset', { method: 'POST' });
  },

  async getSimulatorStatus() {
    return request<{ scenario?: string; step?: number; status: string }>('/simulator/status');
  },

  // ---------------------------------------------------------------------------
  // Symptom Sessions (FastAPI /api/v1/symptoms)
  // ---------------------------------------------------------------------------
  async startSymptomSession(raw_text: string, language = 'en') {
    const data = await request<any>('/symptoms/sessions', {
      method: 'POST',
      body: JSON.stringify({ raw_text, language }),
    });
    return {
      session_id: data.id || data.session_id,
      extracted_concepts: data.concepts || data.extracted_concepts || [],
      followup_questions: data.followup_questions || [],
    };
  },

  async answerFollowup(sessionId: string, questionId: string, answer: string) {
    return request<{ status: string }>(`/symptoms/sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, answer }),
    });
  },

  async finalizeSymptomSession(sessionId: string) {
    return request<{ id: string; status: string }>(`/symptoms/sessions/${sessionId}/finalize`, {
      method: 'POST',
    });
  },

  // ---------------------------------------------------------------------------
  // Clinical Assessments & Risk Fusion (FastAPI /api/v1/assessments)
  // ---------------------------------------------------------------------------
  async runAssessment(patient_id?: string, session_id?: string): Promise<RiskAssessment> {
    return request<RiskAssessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify({ session_id }),
    });
  },

  async getAssessmentHistory(patient_id?: string): Promise<RiskAssessment[]> {
    if (!patient_id) return [];
    return request<RiskAssessment[]>(`/assessments/patient/${patient_id}`);
  },

  async getModelMetrics() {
    return request<any>('/assessments/model/metrics');
  },

  // ---------------------------------------------------------------------------
  // Doctor Decision Support (FastAPI /api/v1/doctors)
  // ---------------------------------------------------------------------------
  async getDoctorQueue(): Promise<QueueItem[]> {
    return request<QueueItem[]>('/doctors/queue');
  },

  async getDoctorPatientView(patientId: string) {
    return request<{
      patient: { id: string; full_name: string; known_conditions?: string };
      latest_assessment: any;
      explanation_factors: Array<{ factor_name: string; contribution: number; direction: string }>;
      latest_vitals: Record<string, any>;
      previous_reviews: Array<{ id: string; decision: string; note?: string; created_at: string }>;
    }>(`/doctors/patients/${patientId}`);
  },

  async deleteDoctorReview(reviewId: string): Promise<{ deleted_id: string }> {
    return request<{ deleted_id: string }>('/doctors/reviews/' + reviewId, { method: 'DELETE' });
  },

  async submitDoctorReview(payload: { patient_id: string; assessment_id?: string; note: string; decision: string }) {
    return request<any>('/doctors/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async escalatePatient(patient_id: string, note?: string) {
    return request<any>('/doctors/escalate', {
      method: 'POST',
      body: JSON.stringify({ patient_id, note }),
    });
  },

  async deescalatePatient(patient_id: string, note?: string) {
    return request<any>('/doctors/deescalate', {
      method: 'POST',
      body: JSON.stringify({ patient_id, note }),
    });
  },

  // ---------------------------------------------------------------------------
  // Emergency Response State Machine (FastAPI /api/v1/emergency)
  // ---------------------------------------------------------------------------
  async getEmergencyCases(): Promise<any[]> {
    return request<any[]>('/emergency/cases');
  },

  async createEmergencyCase(patient_id: string, trigger_type = 'CLINICIAN') {
    return request<any>('/emergency/cases', {
      method: 'POST',
      body: JSON.stringify({ patient_id, trigger_type }),
    });
  },

  async verifyEmergencyCase(caseId: string) {
    return request<any>(`/emergency/cases/${caseId}/verify`, { method: 'POST' });
  },

  async dispatchEmergencyCase(caseId: string) {
    return request<any>(`/emergency/cases/${caseId}/dispatch`, { method: 'POST' });
  },

  async advanceEmergencyCase(caseId: string) {
    return request<any>(`/emergency/cases/${caseId}/advance`, { method: 'POST' });
  },

  async updateLocation(caseId: string, latitude: number, longitude: number, accuracy = 5.0) {
    return request<any>(`/emergency/cases/${caseId}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, accuracy, consent: true }),
    });
  },

  // ---------------------------------------------------------------------------
  // Ambulance Transit & Hospital Handoff (FastAPI /api/v1/ambulance)
  // ---------------------------------------------------------------------------
  async getAssignedAmbulanceCases(): Promise<any[]> {
    return request<any[]>('/ambulance/assigned');
  },

  async getAmbulanceBrief(caseId: string) {
    return request<any>(`/ambulance/cases/${caseId}/brief`);
  },

  async advanceAmbulanceStatus(caseId: string) {
    return request<any>(`/ambulance/cases/${caseId}/status`, { method: 'POST' });
  },

  // ---------------------------------------------------------------------------
  // Notifications (FastAPI /api/v1/notifications)
  // ---------------------------------------------------------------------------
  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/notifications');
  },

  async markNotificationRead(id: string) {
    return request<any>(`/notifications/${id}/read`, { method: 'POST' });
  },

  async getUnreadNotificationCount(): Promise<{ unread_count: number }> {
    return request<{ unread_count: number }>('/notifications/unread-count');
  },

  // ---------------------------------------------------------------------------
  // Audit Logs & Compliance (FastAPI /api/v1/audit)
  // ---------------------------------------------------------------------------
  async getAuditLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/audit/logs');
  },

  // ---------------------------------------------------------------------------
  // Gemini AI Foundation (FastAPI /api/v1/ai)
  // ---------------------------------------------------------------------------
  async getAIStatus() {
    return request<{ enabled: boolean; provider: string; configured: boolean; reachable: boolean; model: string }>('/ai/status');
  },

  async extractSymptomsAI(text: string, language = 'auto') {
    return request<{
      original_text: string;
      detected_language: string;
      symptoms: Array<{ name: string; severity?: number; duration_hours?: number }>;
      red_flag_phrases: string[];
      missing_information: string[];
      source: string;
    }>('/ai/symptoms/extract', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
    });
  },

  async explainAssessmentAI(payload: {
    risk_score: number;
    confidence_score: number;
    care_level: string;
    top_factors: string[];
    language?: string;
  }) {
    return request<{
      explanation: string;
      language: string;
      suggested_specialty: string;
      safety_level: string;
      requires_professional_review: boolean;
      source: string;
    }>('/ai/assessment/explain', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getPatientInsight(payload: {
    risk_score: number;
    confidence_score: number;
    care_level: string;
    top_factors: string[];
    symptom_text?: string;
    concepts?: string[];
    followup_answers?: string[];
    language?: string;
    patient_profile?: string;
    health_notes?: string[];
    lab_summary?: string;
  }) {
    return request<{
      explanation: string;
      possible_patterns: string[];
      specialist: { specialty: string; reason: string };
      self_care: Array<{ title: string; description: string }>;
      food_guidance: {
        recommended: Array<{ title: string; reason: string }>;
        limit: Array<{ title: string; reason: string }>;
      };
      source: string;
    }>('/ai/patient-insight', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async chatAI(payload: {
    message: string;
    conversation_id?: string;
    history?: Array<{ role: string; text: string }>;
    care_level?: string;
    risk_score?: number;
    top_factors?: string[];
    language?: string;
    patient_profile?: string;
    health_notes?: string[];
  }) {
    return request<{
      message: string;
      language: string;
      suggested_specialty?: string;
      safety_level: string;
      requires_professional_review: boolean;
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },


  async getConversations() {
    return request<Array<{
      id: string;
      user_id: string;
      title: string;
      is_pinned: boolean;
      created_at: string;
      updated_at: string;
    }>>('/ai/conversations');
  },

  async createConversation(title: string = 'New Conversation') {
    return request<{
      id: string;
      user_id: string;
      title: string;
      is_pinned: boolean;
      created_at: string;
      updated_at: string;
    }>('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async updateConversation(id: string, updates: { title?: string; is_pinned?: boolean }) {
    return request<{ status: string }>('/ai/conversations/' + id, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteConversation(id: string) {
    return request<{ status: string }>('/ai/conversations/' + id, {
      method: 'DELETE',
    });
  },

  // ---------------------------------------------------------------------------
  // Image Analysis & Multimodal AI (FastAPI /api/v1/images)
  // ---------------------------------------------------------------------------
  async analyzeHealthImage(file: File, text_context = '', language = 'English') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('text_context', text_context);
    formData.append('language', language);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/images/analyze`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      let errText = 'Image analysis failed';
      try {
        const errJson = await res.json();
        errText = errJson.detail || errJson.message || errText;
      } catch {
        errText = await res.text();
      }
      throw new Error(errText);
    }

    const json = await res.json();
    return json.data || json;
  },

  // ---------------------------------------------------------------------------
  // Medical Report OCR & Lab Extraction (FastAPI /api/v1/reports)
  // ---------------------------------------------------------------------------
  async analyzeMedicalReport(file: File, language = 'English', report_type?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    if (report_type) {
      formData.append('report_type', report_type);
    }

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/reports/analyze`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      let errText = 'Medical report analysis failed';
      try {
        const errJson = await res.json();
        errText = errJson.detail || errJson.message || errText;
      } catch {
        errText = await res.text();
      }
      throw new Error(errText);
    }

    const json = await res.json();
    return json.data || json;
  },

  // ---------------------------------------------------------------------------
  // Doctor Consultation & Token Queue (FastAPI /api/v1/patients/me/consultations & /api/v1/doctors/consultations)
  // ---------------------------------------------------------------------------
  async requestDoctorConsultation(specialty?: string, summary?: string) {
    return request<any>('/patients/me/consultations', {
      method: 'POST',
      body: JSON.stringify({ specialty, health_summary: summary }),
    });
  },

  async getMyDoctorConsultations() {
    return request<any[]>('/patients/me/consultations');
  },

  async cancelDoctorConsultation(requestId: string) {
    return request<any>(`/patients/me/consultations/${requestId}/cancel`, {
      method: 'POST',
    });
  },

  async getConsultationQueue() {
    return request<any[]>('/doctors/consultations/queue');
  },

  async getConsultationDetail(requestId: string) {
    return request<any>(`/doctors/consultations/${requestId}`);
  },

  async startConsultationReview(requestId: string) {
    return request<any>(`/doctors/consultations/${requestId}/start`, {
      method: 'POST',
    });
  },

  async completeConsultationReview(requestId: string) {
    return request<any>(`/doctors/consultations/${requestId}/complete`, {
      method: 'POST',
    });
  },

  // ---------------------------------------------------------------------------
  // Patient SOS & Emergency Geolocation (FastAPI /api/v1/emergency/cases/patient)
  // ---------------------------------------------------------------------------
  async triggerPatientSOS(latitude: number | null, longitude: number | null, accuracy: number | null, source: string, consent: boolean) {
    return request<any>('/emergency/cases/patient', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, accuracy, location_source: source, location_consent: consent }),
    });
  },

  async getPatientActiveEmergency() {
    return request<any>('/emergency/cases/patient/active');
  },
};




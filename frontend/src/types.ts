export type Role = 'PATIENT' | 'DOCTOR' | 'EMERGENCY_OPERATOR' | 'AMBULANCE_TEAM' | 'SYSTEM_ADMIN';

export type CareLevel = 'STABLE' | 'MONITOR' | 'ROUTINE_REVIEW' | 'PRIORITY_REVIEW' | 'URGENT' | 'POSSIBLE_EMERGENCY';

export type EmergencyStatus = 
  | 'DETECTED' 
  | 'UNDER_REVIEW' 
  | 'VERIFIED' 
  | 'DISPATCH_REQUESTED' 
  | 'DISPATCHED' 
  | 'PATIENT_REACHED' 
  | 'TRANSPORTING' 
  | 'HOSPITAL_REACHED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth?: string;
  sex?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  profile_picture_url?: string;
  known_conditions?: string;
  family_history?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_group?: string;
  public_id?: string;
  created_at: string;
}

export interface PatientHealthNote {
  id: string;
  patient_id: string;
  note_text: string;
  created_at: string;
}

export interface Device {
  id: string;
  patient_id: string;
  type: string;
  status: string;
  last_seen?: string;
  created_at: string;
}

export interface DeviceReading {
  id?: string;
  metric: string;
  value: number;
  unit: string;
  source_type?: string;
  quality?: string;
  recorded_at?: string;
}

export interface RiskFactor {
  factor_name: string;
  contribution: number;
  direction: 'increases_risk' | 'decreases_risk';
}

export interface RiskAssessment {
  id: string;
  patient_id: string;
  session_id?: string;
  risk_score: number;
  confidence_score: number;
  care_level: CareLevel;
  active_symptoms?: any[];
  negated_symptoms?: any[];
  red_flags?: string[];
  suggested_action?: string;
  missing_evidence?: string;
  created_at: string;
  top_factors?: RiskFactor[];
  triggered_safety_rules?: Array<{
    rule_id: string;
    version: string;
    severity: string;
    reason: string;
  }>;
}

export interface DriftEvent {
  id: string;
  patient_id: string;
  drift_score: number;
  direction: string;
  severity: string;
  contributing_metrics?: string;
  detected_at: string;
}

export interface DoctorReview {
  id: string;
  doctor_id?: string;
  patient_id: string;
  assessment_id?: string;
  note?: string;
  decision: 'MONITOR' | 'FOLLOW_UP' | 'URGENT_REVIEW' | 'EMERGENCY_ESCALATION' | 'RESOLVED';
  created_at: string;
}

export interface EmergencyCase {
  id: string;
  patient_id: string;
  patient?: Patient;
  assessment?: {
    id: string;
    risk_score: number;
    care_level: string;
    active_symptoms: any[];
    negated_symptoms: any[];
    red_flags: string[];
  };
  status: EmergencyStatus;
  severity: string;
  trigger_type: 'RULE' | 'CLINICIAN' | 'SIMULATED_TRIGGER' | 'DEMO_SIMULATION' | 'PATIENT_SOS';
  trigger_rule_id?: string;
  trigger_assessment_id?: string;
  trigger_measurements: Record<string, { value: number; quality?: string }>;
  measurement_quality?: string;
  simulation_status: string;
  location: {
    lat?: number;
    lng?: number;
    consent: boolean;
    accuracy?: number;
    source?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_user_id: string;
  type: string;
  payload: any;
  channel: string;
  read_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_role?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  result: string;
  metadata_json?: string;
  created_at: string;
}

export interface TimelineEvent {
  type: string;
  timestamp: string;
  summary: string;
  data: any;
}

export interface SimulatorStatus {
  scenario?: string;
  step?: number;
  status: 'NOT_STARTED' | 'RUNNING' | 'STOPPED';
}

export interface QueueItem {
  patient_id: string;
  patient_name: string;
  assessment_id: string;
  risk_score: number;
  confidence_score: number;
  care_level: CareLevel;
  drift_severity: string;
  entered_at: string;
}

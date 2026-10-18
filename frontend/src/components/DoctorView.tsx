import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  User,
  CheckCircle,
  FileCheck,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Heart,
  Activity,
  Wind,
  Thermometer,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { QueueItem } from '../types';
import { api } from '../services/api';

export const DoctorView: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<any | null>(null);
  const [clinicalNote, setClinicalNote] = useState('');
  const [decision, setDecision] = useState<'MONITOR' | 'FOLLOW_UP' | 'URGENT_REVIEW' | 'EMERGENCY_ESCALATION' | 'RESOLVED'>('MONITOR');
  const [submitting, setSubmitting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [selectedReviewIds, setSelectedReviewIds] = useState<Set<string>>(new Set());
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Consultations tab & queue states
  const [activeQueueTab, setActiveQueueTab] = useState<'triage' | 'consultations'>('triage');
  const [consultationQueue, setConsultationQueue] = useState<any[]>([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const q = await api.getDoctorQueue();
      setQueue(q);
      if (q.length > 0 && !selectedPatientId) {
        setSelectedPatientId(q[0].patient_id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultationQueue = async () => {
    try {
      const q = await api.getConsultationQueue();
      setConsultationQueue(q || []);
    } catch {
      // ignore
    }
  };

  const fetchPatientDetails = async (patientId: string) => {
    try {
      const data = await api.getDoctorPatientView(patientId);
      setPatientDetails(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleStartConsultation = async (requestId: string) => {
    try {
      await api.startConsultationReview(requestId);
      await fetchConsultationQueue();
      if (selectedPatientId) {
        await fetchPatientDetails(selectedPatientId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start review.');
    }
  };

  const handleCompleteConsultation = async (requestId: string) => {
    try {
      await api.completeConsultationReview(requestId);
      await fetchConsultationQueue();
      setSelectedConsultationId(null);
      alert('Consultation marked as COMPLETED.');
    } catch (err: any) {
      alert(err.message || 'Failed to complete consultation.');
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchConsultationQueue();
    const interval = setInterval(() => {
      fetchQueue();
      fetchConsultationQueue();
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientDetails(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSubmitting(true);
    try {
      await api.submitDoctorReview({
        patient_id: selectedPatientId,
        assessment_id: patientDetails?.latest_assessment?.id,
        note: clinicalNote,
        decision,
      });
      setClinicalNote('');
      fetchQueue();
      fetchPatientDetails(selectedPatientId);
      alert('Clinical decision review submitted and audited successfully.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReviewSelection = (id: string) => {
    setSelectedReviewIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedReviewIds.size === 0) return;
    if (!window.confirm(`Permanently delete ${selectedReviewIds.size} selected review(s)?`)) return;
    setDeletingSelected(true);
    try {
      await Promise.all(Array.from(selectedReviewIds).map(id => api.deleteDoctorReview(id)));
      setSelectedReviewIds(new Set());
      if (selectedPatientId) {
        const data = await api.getDoctorPatientView(selectedPatientId);
        setPatientDetails(data);
      }
    } catch (e: any) {
      alert('Failed to delete selected reviews: ' + (e?.message || 'Unknown error'));
    } finally {
      setDeletingSelected(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this clinical review record permanently?')) return;
    setDeletingReviewId(reviewId);
    try {
      await api.deleteDoctorReview(reviewId);
      if (selectedPatientId) {
        const data = await api.getDoctorPatientView(selectedPatientId);
        setPatientDetails(data);
      }
    } catch (e: any) {
      alert('Failed to delete review: ' + (e?.message || 'Unknown error'));
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleQuickEscalate = async () => {
    if (!selectedPatientId) return;
    try {
      await api.escalatePatient(selectedPatientId, 'Doctor triggered priority escalation');
      fetchQueue();
      fetchPatientDetails(selectedPatientId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleQuickDeescalate = async () => {
    if (!selectedPatientId) return;
    try {
      await api.deescalatePatient(selectedPatientId, 'Doctor cleared acute indicators to baseline monitor');
      fetchQueue();
      fetchPatientDetails(selectedPatientId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getCareBadgeColor = (level: string) => {
    switch (level) {
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'POSSIBLE_EMERGENCY':
        return 'bg-rose-600 text-white border-rose-400';
      case 'PRIORITY_REVIEW':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'ROUTINE_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Doctor Clinical Decision Support (CDS)</h2>
            <p className="text-xs text-slate-400">
              Prioritized Clinical Queue, Multi-Modal Anomaly Explanations & Review Actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Active Queue: <strong className="text-emerald-400">{queue.length}</strong> Patients
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue Switcher & Lists (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveQueueTab('triage')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                activeQueueTab === 'triage'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Triage Queue ({queue.length})
            </button>
            <button
              onClick={() => setActiveQueueTab('consultations')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                activeQueueTab === 'consultations'
                  ? 'bg-gradient-to-r from-cyan-950 to-indigo-950 text-white border border-cyan-850'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              Consults ({consultationQueue.length})
            </button>
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {activeQueueTab === 'triage' ? (
              queue.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                  <CheckCircle className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                  No patients currently requiring urgent clinician triage.
                </div>
              ) : (
                queue.map((item) => {
                  const isSelected = selectedPatientId === item.patient_id && !selectedConsultationId;
                  return (
                    <button
                      key={item.patient_id}
                      id={`queue-item-${item.patient_id}`}
                      onClick={() => {
                        setSelectedPatientId(item.patient_id);
                        setSelectedConsultationId(null);
                      }}
                      className={`w-full p-4 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-slate-850 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white">{item.patient_name}</div>
                          <div className="text-[11px] font-mono text-slate-400">ID: {item.patient_id.slice(0, 8)}...</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCareBadgeColor(item.care_level)}`}>
                          {item.care_level}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="font-semibold">Risk: {item.risk_score}</span>
                        </div>

                        <div className="text-[10px] text-slate-400">
                          Drift: <span className="font-medium text-amber-400 uppercase">{item.drift_severity}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )
            ) : (
              consultationQueue.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                  <Clock className="w-8 h-8 text-cyan-400/40 mx-auto mb-2" />
                  No active consultation requests.
                </div>
              ) : (
                consultationQueue.map((item) => {
                  const isSelected = selectedConsultationId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedPatientId(item.patient_id);
                        setSelectedConsultationId(item.id);
                      }}
                      className={`w-full p-4 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-slate-850 border-cyan-500 shadow-md ring-1 ring-cyan-500/20'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="font-mono text-cyan-400 font-bold">{item.token_number}</span>
                            <span>{item.patient_name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Specialty: <span className="text-slate-200">{item.specialty}</span></div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                          item.status === 'IN_REVIEW' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="font-semibold">Risk: {item.risk_score}</span>
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono">
                          Care: <span className="font-medium text-cyan-400">{item.care_level}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>


        {/* Right: Clinical Dossier & Review (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {patientDetails ? (
            <>
              {/* Patient Header & Quick Actions */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{patientDetails.patient.full_name}</span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50 mt-1 block w-fit">
                    ID: {patientDetails.patient.public_id || patientDetails.patient.id.slice(0, 8)}
                  </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Known Conditions: <span className="text-slate-200">{patientDetails.patient.known_conditions || 'None reported'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuickEscalate}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Escalate Urgent</span>
                  </button>
                  <button
                    onClick={handleQuickDeescalate}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>De-escalate</span>
                  </button>
                </div>
              </div>

              {/* Consultation Active Action Banner */}
              {selectedConsultationId && (() => {
                const currentConsult = consultationQueue.find(c => c.id === selectedConsultationId);
                if (!currentConsult) return null;
                return (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/45 to-slate-900 border border-cyan-500/40 flex items-center justify-between gap-4 shadow-lg">
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Patient Requested Consultation
                      </div>
                      <div className="text-sm font-bold text-white mt-1">
                        Token: <span className="text-cyan-300 font-mono font-extrabold text-base">{currentConsult.token_number}</span> | Specialty: <span className="text-slate-300">{currentConsult.specialty}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Reason/Summary: <span className="text-slate-300 font-medium">{currentConsult.health_summary || 'None provided'}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {currentConsult.status === 'WAITING' && (
                        <button
                          onClick={() => handleStartConsultation(currentConsult.id)}
                          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                        >
                          Start Review
                        </button>
                      )}
                      {currentConsult.status === 'IN_REVIEW' && (
                        <button
                          onClick={() => handleCompleteConsultation(currentConsult.id)}
                          className="px-4 py-2 bg-emerald-650 hover:bg-emerald-555 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer animate-pulse"
                        >
                          Complete Consultation
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}


              {/* Latest Vitals Snapshot */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span className="uppercase tracking-wider">Telemetry Snapshot & Provenance</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px]">
                    PROVENANCE: DEVICE / SIMULATED
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Heart Rate</span>
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">
                      {patientDetails.latest_vitals?.heart_rate?.value || '--'} <span className="text-xs font-normal text-slate-500">BPM</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>SpO2</span>
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">
                      {patientDetails.latest_vitals?.spo2?.value || '--'} <span className="text-xs font-normal text-slate-500">%</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Resp. Rate</span>
                      <Wind className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">
                      {patientDetails.latest_vitals?.respiratory_rate?.value || '--'} <span className="text-xs font-normal text-slate-500">br/m</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Temperature</span>
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">
                      {patientDetails.latest_vitals?.temperature?.value || '--'} <span className="text-xs font-normal text-slate-500">°C</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-factor Explanation Factors */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Explainable Multi-Modal Risk Breakdown</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[10px]">
                    PROVENANCE: AI OBSERVATION / FUSION
                  </span>
                </div>

                <div className="space-y-2.5">
                  {patientDetails.explanation_factors?.map((f: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="font-mono text-cyan-300">{f.factor_name}</div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">Contribution: <strong className="text-white">{f.contribution}</strong></span>
                        <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 text-[10px]">
                          {f.direction}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinician Decision Log Form */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  <span>Record Clinical Review & Triage Decision</span>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Clinical Triage Action Decision
                    </label>
                    <select
                      value={decision}
                      onChange={(e) => setDecision(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="MONITOR">MONITOR (Continue baseline observation)</option>
                      <option value="FOLLOW_UP">FOLLOW_UP (Schedule routine check)</option>
                      <option value="URGENT_REVIEW">URGENT_REVIEW (Elevate clinical priority)</option>
                      <option value="EMERGENCY_ESCALATION">EMERGENCY_ESCALATION (Trigger emergency response)</option>
                      <option value="RESOLVED">RESOLVED (Acute episode cleared)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Clinician Assessment Note (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={clinicalNote}
                      onChange={(e) => setClinicalNote(e.target.value)}
                      placeholder="e.g. Reviewed SpO2 drop; instructed patient to adjust mask and re-measure..."
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Recording Decision...' : 'Save & Log Clinical Decision'}</span>
                  </button>
                </form>
              </div>

              {/* Previous Doctor Reviews */}
              {patientDetails.previous_reviews && patientDetails.previous_reviews.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Prior Clinical Reviews</span>
                      <span className="text-slate-600 font-normal">({patientDetails.previous_reviews.length})</span>
                    </div>
                    {selectedReviewIds.size > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        disabled={deletingSelected}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-rose-900/60 hover:bg-rose-800/80 border border-rose-700/50 text-rose-300 hover:text-rose-100 disabled:opacity-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingSelected ? 'Deleting...' : `Delete Selected (${selectedReviewIds.size})`}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {patientDetails.previous_reviews.map((r: any) => (
                      <div
                        key={r.id}
                        className={`p-3 rounded-lg border text-xs transition-all ${selectedReviewIds.has(r.id) ? 'bg-rose-950/20 border-rose-800/60' : 'bg-slate-950/80 border-slate-800'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedReviewIds.has(r.id)}
                            onChange={() => toggleReviewSelection(r.id)}
                            className="w-3.5 h-3.5 rounded accent-rose-500 cursor-pointer flex-shrink-0"
                          />
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <span className="font-semibold text-emerald-400">{r.decision}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500">
                                {new Date(r.created_at).toLocaleString()}
                              </span>
                              <button
                                onClick={() => handleDeleteReview(r.id)}
                                disabled={deletingReviewId === r.id}
                                title="Delete this record"
                                className="p-1 rounded-md bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-700/50 text-slate-500 hover:text-rose-300 disabled:opacity-50 transition-all"
                              >
                                {deletingReviewId === r.id
                                  ? <span className="text-[9px] font-mono px-1">...</span>
                                  : <Trash2 className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        {r.note && <p className="text-slate-400 mt-2 ml-6 leading-relaxed">{r.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              Select a patient from the queue to inspect clinical vitals and record triage decisions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

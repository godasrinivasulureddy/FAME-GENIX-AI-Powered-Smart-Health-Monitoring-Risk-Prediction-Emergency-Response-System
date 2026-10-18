import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Phone,
  Building2,
  Activity,
  ArrowRight,
  User,
  Map
} from 'lucide-react';
import { api } from '../services/api';

export const AmbulanceView: React.FC = () => {
  const [assignedCases, setAssignedCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseBrief, setCaseBrief] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const fetchAssigned = async () => {
    try {
      const list = await api.getAssignedAmbulanceCases();
      setAssignedCases(list);
      if (list.length > 0 && !selectedCaseId) {
        setSelectedCaseId(list[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchBrief = async (caseId: string) => {
    try {
      const brief = await api.getAmbulanceBrief(caseId);
      setCaseBrief(brief);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssigned();
    const interval = setInterval(fetchAssigned, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchBrief(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleAdvanceStatus = async (caseId: string) => {
    setAdvancing(true);
    try {
      await api.advanceAmbulanceStatus(caseId);
      fetchAssigned();
      fetchBrief(caseId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const normalizeStatus = (status: string) => {
    if (status === 'PATIENT_REACHED') return 'ON_SCENE';
    return status;
  };

  const stages = [
    { key: 'DISPATCHED', label: 'Dispatched' },
    { key: 'EN_ROUTE', label: 'En Route' },
    { key: 'ON_SCENE', label: 'On Scene' },
    { key: 'TRANSPORTING', label: 'Transporting' },
    { key: 'HOSPITAL_REACHED', label: 'Hospital Reached' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getStageIndex = (status: string) => {
    const norm = normalizeStatus(status);
    if (norm === 'DISPATCH_REQUESTED') return -1;
    const idx = stages.findIndex((s) => s.key === norm);
    return idx >= 0 ? idx : 0;
  };

  const getActionLabel = (status: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'DISPATCH_REQUESTED':
        return 'Accept Dispatch';
      case 'DISPATCHED':
        return 'Start Route';
      case 'EN_ROUTE':
        return 'Arrived at Patient';
      case 'ON_SCENE':
        return 'Begin Transport';
      case 'TRANSPORTING':
        return 'Arrived at Hospital';
      case 'HOSPITAL_REACHED':
        return 'Complete Case';
      default:
        return 'Advance Stage';
    }
  };

  const selectedCase = assignedCases.find((c) => c.id === selectedCaseId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Ambulance Transit & Handoff Portal</h2>
            <p className="text-xs text-slate-400">
              Patient Context, Navigation & Hospital Pre-Arrival Notification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
            Unit: SIM-AMB-01 (Active)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Assigned Cases (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Active Dispatches ({assignedCases.length})
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {assignedCases.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                No active dispatches currently assigned to Unit 01.
              </div>
            ) : (
              assignedCases.map((c) => {
                const isSelected = selectedCaseId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-slate-850 border-amber-500 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-bold text-white">Case #{c.id.slice(0, 8)}</div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {c.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400">
                        Severity: <strong className="text-rose-400">{c.severity}</strong>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Transit Stepper & Pseudonymous Patient Brief (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedCase ? (
            <>
              {/* Transit Stepper Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Transit Progress & Hospital Handoff Stepper
                  </div>
                  {selectedCase.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleAdvanceStatus(selectedCase.id)}
                      disabled={advancing}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-amber-600/20 cursor-pointer"
                    >
                      <span>{getActionLabel(selectedCase.status)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Stepper visual */}
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                  {stages.map((stage, idx) => {
                    const currentIdx = getStageIndex(selectedCase.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={stage.key}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/30'
                            : isPassed
                            ? 'bg-slate-950 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-slate-500">Step 0{idx + 1}</div>
                        <div className="text-xs font-bold mt-1">{stage.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Patient Brief */}
              {caseBrief && caseBrief.patient_profile && (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>AMBULANCE PATIENT EMERGENCY BRIEF</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                    {/* PROFILE */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2">Profile</div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                          {caseBrief.patient_profile.profile_picture_url ? (
                            <img src={caseBrief.patient_profile.profile_picture_url} alt="Patient" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-white text-sm truncate">{caseBrief.patient_profile.full_name}</div>
                          <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{caseBrief.patient_profile.public_id}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-slate-300">
                        <div>
                          <div className="text-[10px] text-slate-500">Age</div>
                          <div className="font-semibold">{caseBrief.patient_profile.age}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Height</div>
                          <div className="font-semibold">{caseBrief.patient_profile.height_cm} cm</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Weight</div>
                          <div className="font-semibold">{caseBrief.patient_profile.weight_kg} kg</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80">
                        <div className="text-[10px] text-slate-500">Patient-reported Blood Group</div>
                        <div className="font-bold text-rose-400 text-sm">{caseBrief.patient_profile.blood_group}</div>
                        <div className="text-[9px] text-rose-400/70 mt-1 uppercase">Verify clinically before transfusion</div>
                      </div>
                    </div>

                    {/* CURRENT INCIDENT */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2">Current Incident</div>
                      
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500">Reported Health Issue</div>
                        <div className="font-bold text-rose-400 break-words leading-tight">{caseBrief.incident_snapshot.reported_issue}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500">Active Symptoms</div>
                        <div className="font-medium text-slate-300 break-words leading-tight">
                          {caseBrief.incident_snapshot.active_symptoms && caseBrief.incident_snapshot.active_symptoms.length > 0 
                            ? caseBrief.incident_snapshot.active_symptoms.map((s: any) => s.name).join(', ') 
                            : 'None'}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div>
                          <div className="text-[10px] text-slate-500">Risk Score</div>
                          <div className="font-mono font-bold text-rose-400">{Number(caseBrief.incident_snapshot.risk_score).toFixed(2)}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-slate-500">Care Level</div>
                          <div className="font-bold text-amber-400 break-words leading-tight">{caseBrief.incident_snapshot.care_level}</div>
                        </div>
                      </div>
                      
                      {caseBrief.incident_snapshot.red_flags && caseBrief.incident_snapshot.red_flags.length > 0 && (
                         <div className="space-y-1 pt-1">
                          <div className="text-[10px] text-slate-500">Red Flags</div>
                          <div className="flex flex-wrap gap-1">
                            {caseBrief.incident_snapshot.red_flags.map((rf: string) => (
                              <span key={rf} className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                                {rf}
                              </span>
                            ))}
                          </div>
                         </div>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        <div className="text-[10px] flex flex-col sm:flex-row sm:justify-between sm:gap-2">
                          <span className="text-slate-500 flex-shrink-0">Assessment:</span>
                          <span className="font-mono text-slate-400 break-all">{caseBrief.incident_snapshot.assessment_id || 'N/A'}</span>
                        </div>
                        <div className="text-[10px] flex flex-col sm:flex-row sm:justify-between sm:gap-2 mt-1">
                          <span className="text-slate-500 flex-shrink-0">Case ID:</span>
                          <span className="font-mono text-slate-400 break-all">{caseBrief.case.id}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Time:</span>
                          <span className="text-slate-400">{caseBrief.case.trigger_timestamp ? new Date(caseBrief.case.trigger_timestamp).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Trigger:</span>
                          <span className="text-slate-400 font-medium">{caseBrief.case.trigger_type}</span>
                        </div>
                      </div>
                    </div>

                    {/* MEDICAL CONTEXT */}
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2">Medical Context</div>
                      
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500">Known Medical Conditions</div>
                        <div className="font-medium text-slate-300 break-words leading-tight">{caseBrief.medical_context.known_conditions}</div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 space-y-3">
                        <div className="text-[10px] text-slate-500">Emergency Contact Name</div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-medium break-words leading-tight">{caseBrief.medical_context.emergency_contact_name}</span>
                        </div>
                        
                        <div className="text-[10px] text-slate-500 mt-2">Emergency Contact Phone</div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-mono">{caseBrief.medical_context.emergency_contact_phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hospital Pre-arrival Box */}
                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div className="font-bold text-white">Fame Genix Trauma Emergency Dept</div>
                        <div className="text-slate-400 text-[11px]">Pre-arrival telemetry broadcast active</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-cyan-900/60 text-cyan-300 font-mono text-[11px]">
                      ETA: ~8 mins
                    </span>
                  </div>
                </div>
              )}

              {/* PATIENT INCIDENT LOCATION */}
              {caseBrief && caseBrief.location && (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>PATIENT INCIDENT LOCATION</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                         <div className="text-[10px] text-slate-500">Source</div>
                         <div className="font-medium text-amber-400">{caseBrief.location.location_source}</div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                        <div className="space-y-1">
                           <div className="text-[10px] text-slate-500">Latitude</div>
                           <div className="font-mono text-slate-300">{caseBrief.location.latitude ?? 'N/A'}</div>
                        </div>
                        <div className="space-y-1">
                           <div className="text-[10px] text-slate-500">Longitude</div>
                           <div className="font-mono text-slate-300">{caseBrief.location.longitude ?? 'N/A'}</div>
                        </div>
                        <div className="space-y-1">
                           <div className="text-[10px] text-slate-500">Accuracy</div>
                           <div className="font-mono text-slate-300">{caseBrief.location.location_accuracy ? `±${Math.round(caseBrief.location.location_accuracy)} m` : 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                         <div className="text-[10px] text-slate-500">Timestamp</div>
                         <div className="font-medium text-slate-400">{caseBrief.location.location_timestamp ? new Date(caseBrief.location.location_timestamp).toLocaleString() : 'N/A'}</div>
                      </div>
                    </div>

                    <div className="flex items-center md:justify-end">
                      <a 
                        href={`https://www.google.com/maps?q=${caseBrief.location.latitude},${caseBrief.location.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
                          caseBrief.location.latitude 
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20' 
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          if (!caseBrief.location.latitude) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Map className="w-4 h-4" />
                        <span>Open Location in External Map</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              Select an assigned dispatch case to review patient brief and advance transit stages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

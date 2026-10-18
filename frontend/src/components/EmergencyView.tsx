import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  MapPin,
  CheckCircle,
  Truck,
  AlertTriangle,
  Play,
  Activity,
  User,
  Send,
  Navigation,
  Compass,
} from 'lucide-react';
import { EmergencyCase } from '../types';
import { api } from '../services/api';

export const EmergencyView: React.FC = () => {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [autoRefresh, setAutoRefresh] = useState(false); // Default to off as requested or maybe on? User said "if i on the button then notifications will comes" - let's default to false to reduce logs.

  const fetchCases = async () => {
    try {
      const list = await api.getEmergencyCases();
      setCases(list);
      if (list.length > 0 && !selectedCaseId) {
        setSelectedCaseId(list[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchCases, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  const handleVerify = async (id: string) => {
    setActionLoading(true);
    try {
      await api.verifyEmergencyCase(id);
      fetchCases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async (id: string) => {
    setActionLoading(true);
    try {
      await api.dispatchEmergencyCase(id);
      fetchCases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvance = async (id: string) => {
    setActionLoading(true);
    try {
      await api.advanceEmergencyCase(id);
      fetchCases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSimulatedCase = async () => {
    try {
      const p = await api.getMyPatientProfile().catch(() => null);
      const patientId = p?.id || 'patient-01';
      await api.createEmergencyCase(patientId, 'SIMULATED_TRIGGER');
      fetchCases();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DETECTED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'UNDER_REVIEW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'VERIFIED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'DISPATCH_REQUESTED':
      case 'DISPATCHED':
      case 'EN_ROUTE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'ON_SCENE':
      case 'PATIENT_REACHED':
      case 'TRANSPORTING':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'HOSPITAL_REACHED':
      case 'COMPLETED':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Emergency Response Operations Center</h2>
            <p className="text-xs text-slate-400">
              Verified Emergency Incidents, Trigger Provenance & Ambulance Dispatch Coordination
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors ${
              autoRefresh 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25' 
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-white' : 'text-slate-400'}`} />
            <span>SOS Notifications: {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleCreateSimulatedCase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/25"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Emergency Trigger</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Case List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Emergency Cases Board ({cases.length})
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {cases.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                <CheckCircle className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                No active emergency cases. System operating in nominal monitoring state.
              </div>
            ) : (
              cases.map((c) => {
                const isSelected = selectedCaseId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-slate-850 border-rose-500 shadow-md ring-1 ring-rose-500/20'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                          <span>Case #{c.id.slice(0, 8)}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Patient: <span className="font-mono text-cyan-300">{c.patient_id.slice(0, 8)}...</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadgeColor(c.status)}`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400">
                        Trigger: <strong className="text-white">{c.trigger_type}</strong>
                        {c.trigger_rule_id && <span className="text-rose-400 font-mono ml-1">[{c.trigger_rule_id}]</span>}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Case Dossier & Dispatch Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedCase ? (
            <>
              {/* Status Banner */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Emergency Incident</div>
                  <div className="text-xl font-bold text-white mt-0.5">Case #{selectedCase.id.slice(0, 8)}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Severity: <strong className="text-rose-400">{selectedCase.severity}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-cyan-300">{selectedCase.status}</strong></span>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedCase.status === 'DETECTED' && (
                    <button
                      onClick={() => handleVerify(selectedCase.id)}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                    >
                      Verify Emergency
                    </button>
                  )}

                  {['DETECTED', 'VERIFIED'].includes(selectedCase.status) && (
                    <button
                      onClick={() => handleDispatch(selectedCase.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Request Dispatch</span>
                    </button>
                  )}

                  {['DISPATCH_REQUESTED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'PATIENT_REACHED', 'TRANSPORTING', 'HOSPITAL_REACHED'].includes(selectedCase.status) && (
                    <button
                      onClick={() => handleAdvance(selectedCase.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Advance Stage</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Emergency State Machine Stepper */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Emergency State Machine Lifecycle
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-10 gap-1.5 text-center text-[10px]">
                  {[
                    'DETECTED',
                    'UNDER_REVIEW',
                    'VERIFIED',
                    'DISPATCH_REQUESTED',
                    'DISPATCHED',
                    'EN_ROUTE',
                    'ON_SCENE',
                    'TRANSPORTING',
                    'HOSPITAL_REACHED',
                    'COMPLETED',
                  ].map((st, idx) => {
                    const allStates = [
                      'DETECTED',
                      'UNDER_REVIEW',
                      'VERIFIED',
                      'DISPATCH_REQUESTED',
                      'DISPATCHED',
                      'EN_ROUTE',
                      'ON_SCENE',
                      'TRANSPORTING',
                      'HOSPITAL_REACHED',
                      'COMPLETED',
                    ];
                    const normStatus = selectedCase.status === 'PATIENT_REACHED' ? 'ON_SCENE' : selectedCase.status;
                    const currentIdx = allStates.indexOf(normStatus);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = st === normStatus;

                    return (
                      <div
                        key={st}
                        className={`p-2 rounded-lg border font-mono transition-all ${
                          isCurrent
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500/40 font-bold'
                            : isPassed
                            ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 font-semibold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div>0{idx + 1}</div>
                        <div className="truncate text-[9px] mt-0.5">{st.replace('_', ' ')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              
              {/* Patient Emergency Profile Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Patient Emergency Profile</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* PROFILE */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Profile</div>
                    <div className="flex items-start gap-3">
                      {selectedCase.patient?.profile_picture_url ? (
                        <img src={selectedCase.patient.profile_picture_url} alt="Patient" className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 text-lg font-bold border border-slate-700">
                          {(selectedCase.patient?.full_name || 'U')[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-white">{selectedCase.patient?.full_name || 'Unknown Patient'}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{selectedCase.patient?.public_id || 'ID N/A'}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">Age</div>
                        <div className="font-semibold text-slate-300">{selectedCase.patient?.age || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Patient-reported Blood Group <span className="text-[9px] text-rose-400 block -mt-1 opacity-80">(Verify clinically)</span></div>
                        <div className="font-bold text-rose-300">{selectedCase.patient?.blood_group || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Height (cm)</div>
                        <div className="font-semibold text-slate-300">{selectedCase.patient?.height_cm || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Weight (kg)</div>
                        <div className="font-semibold text-slate-300">{selectedCase.patient?.weight_kg || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* CURRENT INCIDENT */}
                  <div className="space-y-2 border-l border-slate-800 pl-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Current Incident</div>
                    
                    <div className="text-xs">
                      <div className="text-[10px] text-slate-500">Reported Health Issue</div>
                      <div className="font-bold text-rose-400">
                        {selectedCase.assessment?.active_symptoms?.length 
                          ? selectedCase.assessment.active_symptoms.map(s => s.name).join(' & ') 
                          : 'Emergency Triggered'}
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-[10px] text-slate-500">Active Symptoms</div>
                      <div className="font-semibold text-slate-300">
                        {selectedCase.assessment?.active_symptoms?.length 
                          ? selectedCase.assessment.active_symptoms.map(s => s.name).join(', ') 
                          : 'None reported'}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs mt-1">
                      <div>
                        <div className="text-[10px] text-slate-500">Risk Score</div>
                        <div className="font-mono font-bold text-rose-400">{(selectedCase.assessment?.risk_score ?? 0).toFixed(2)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-slate-500">Care Level</div>
                        <div className="font-bold text-white break-words leading-tight">{selectedCase.assessment?.care_level || 'N/A'}</div>
                      </div>
                    </div>
                    
                    {selectedCase.assessment?.red_flags && selectedCase.assessment.red_flags.length > 0 && (
                      <div className="text-xs">
                        <div className="text-[10px] text-slate-500">Red Flags</div>
                        <div className="text-rose-400 font-semibold">{selectedCase.assessment.red_flags.join(', ')}</div>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 font-mono mt-2 break-all" title={selectedCase.assessment?.id}>
                      Asmt: {selectedCase.assessment?.id || 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono break-all" title={selectedCase.id}>
                      Case: {selectedCase.id}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Time: {new Date(selectedCase.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* MEDICAL CONTEXT */}
                  <div className="space-y-2 border-l border-slate-800 pl-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Medical Context</div>
                    
                    <div className="text-xs">
                      <div className="text-[10px] text-slate-500">Known Medical Conditions</div>
                      <div className="font-semibold text-slate-300">
                        {selectedCase.patient?.known_conditions || 'None reported'}
                      </div>
                    </div>
                    
                    <div className="text-xs mt-3">
                      <div className="text-[10px] text-slate-500">Emergency Contact Name</div>
                      <div className="font-semibold text-white">
                        {selectedCase.patient?.emergency_contact_name || 'Not provided'}
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-[10px] text-slate-500">Emergency Contact Phone</div>
                      <div className="font-mono text-cyan-300">
                        {selectedCase.patient?.emergency_contact_phone || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Trigger Provenance Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Trigger Provenance & Sensor Snapshot</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Trigger Mechanism</span>
                    <div className="font-bold text-white mt-1">{selectedCase.trigger_type}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Trigger Rule ID</span>
                    <div className="font-mono font-bold text-rose-400 mt-1">{selectedCase.trigger_rule_id || 'N/A'}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-500 text-[10px]">Quality Flag</span>
                    <div className="font-mono text-cyan-300 mt-1">{selectedCase.measurement_quality || 'SIMULATED'}</div>
                  </div>
                </div>

                {/* Vitals Snapshot at Trigger */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400">Measurements Snapshot at Incident:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {Object.entries(selectedCase.trigger_measurements || {}).map(([metric, data]: [string, any]) => (
                      <div key={metric} className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase">{metric.replace(/_/g, ' ')}</span>
                        <div className="font-bold text-white mt-0.5">
                          {data && typeof data === 'object' && 'value' in data ? data.value : String(data ?? '')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GPS Geolocation Map / Coordinates Display */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>Patient Incident Location (Source: <strong className="text-cyan-400 font-mono">{selectedCase.location?.source || 'UNAVAILABLE'}</strong>)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {typeof selectedCase.location?.lat === 'number' && typeof selectedCase.location?.lng === 'number' ? `Lat: ${selectedCase.location.lat.toFixed(6)}, Lng: ${selectedCase.location.lng.toFixed(6)}` : 'Coordinates Unavailable'}
                  </span>
                </div>

                <div className="h-44 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  <div className="relative flex flex-col items-center gap-2 text-center p-4">
                    <div className={`w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 ${typeof selectedCase.location?.lat === 'number' ? 'animate-bounce' : ''}`}>
                      <Navigation className="w-5 h-5" />
                    </div>
                    {typeof selectedCase.location?.lat === 'number' && typeof selectedCase.location?.lng === 'number' ? (
                      <>
                        <div className="text-xs font-bold text-white">
                          {selectedCase.location?.source === 'BROWSER_DEVICE_GEOLOCATION' ? "Location captured from patient's browser/device" : 'Simulated Geolocation Fixed'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Accuracy: {typeof selectedCase.location?.accuracy === 'number' ? `±${selectedCase.location.accuracy.toFixed(1)} meters` : '±5.0 meters'}
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedCase.location.lat},${selectedCase.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-cyan-400 hover:text-cyan-300 text-[10px] font-bold rounded-lg transition-all"
                        >
                          Open Location in External Map
                        </a>
                      </>
                    ) : (
                      <>
                        <div className="text-xs font-bold text-slate-400">Device Location Unavailable</div>
                        <div className="text-[10px] text-slate-600">Location permission denied by user or device GPS offline.</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              Select an emergency case from the board to view trigger details and dispatch response teams.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  ShieldAlert,
  Activity,
  UserCheck,
  FileText,
  Radio,
  AlertTriangle,
  TrendingUp,
  Heart,
  Apple,
  PhoneCall,
  CheckCircle2,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface RiskCardProps {
  score: number;
  careLevel: string;
  anomalyDeviation?: number;
  healthDrift?: number;
  factors?: string[];
}

export const ChatRiskCard: React.FC<RiskCardProps> = ({
  score,
  careLevel,
  anomalyDeviation,
  healthDrift,
  factors,
}) => {
  const isHigh = careLevel === 'URGENT' || careLevel === 'POSSIBLE_EMERGENCY';
  return (
    <div className={`p-4 rounded-2xl border my-3 shadow-lg ${
      isHigh ? 'bg-rose-950/40 border-rose-800/80' : 'bg-slate-900 border-slate-800'
    }`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-5 h-5 ${isHigh ? 'text-rose-400' : 'text-cyan-400'}`} />
          <span className="text-sm font-bold text-white">Health Assessment Evaluation</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
          careLevel === 'STABLE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
          careLevel === 'MONITOR' ? 'bg-blue-950 text-blue-300 border border-blue-700' :
          'bg-rose-950 text-rose-300 border border-rose-700'
        }`}>
          {careLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
          <div className="text-[10px] text-slate-400 font-medium">Risk Score</div>
          <div className="text-xl font-bold text-cyan-400 mt-0.5">{score.toFixed(1)} / 100</div>
        </div>
        {anomalyDeviation !== undefined && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
            <div className="text-[10px] text-slate-400 font-medium">Anomaly Deviation</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">{anomalyDeviation.toFixed(2)} σ</div>
          </div>
        )}
        {healthDrift !== undefined && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
            <div className="text-[10px] text-slate-400 font-medium">EWMA Health Drift</div>
            <div className="text-base font-bold text-indigo-400 mt-0.5">{healthDrift.toFixed(3)}</div>
          </div>
        )}
      </div>

      {factors && factors.length > 0 && (
        <div className="mt-3 text-xs text-slate-300">
          <span className="font-semibold text-slate-400">Primary Contributing Factors: </span>
          <span>{factors.join(', ')}</span>
        </div>
      )}
    </div>
  );
};

interface SpecialistCardProps {
  specialty: string;
  reason?: string;
  onBookConsultation?: () => void;
}

export const ChatSpecialistCard: React.FC<SpecialistCardProps> = ({
  specialty,
  reason,
  onBookConsultation,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/60 my-3 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Recommended Specialist</div>
          <div className="text-sm font-bold text-white mt-0.5">{specialty}</div>
          {reason && <p className="text-xs text-slate-300 mt-1 leading-relaxed">{reason}</p>}
        </div>
      </div>

      {onBookConsultation && (
        <button
          onClick={onBookConsultation}
          className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md flex-shrink-0"
        >
          Book Consultation
        </button>
      )}
    </div>
  );
};

interface LabCardProps {
  fileName: string;
  findings: Array<{ testName: string; value: string; unit?: string; status: 'normal' | 'abnormal' | 'critical' }>;
}

export const ChatLabCard: React.FC<LabCardProps> = ({ fileName, findings }) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 my-3 shadow-lg space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <FileText className="w-5 h-5 text-indigo-400" />
        <div className="text-sm font-bold text-white">Lab Report Findings: <span className="text-cyan-400">{fileName}</span></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {findings.map((f, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">{f.testName}</span>
            <span className={`font-mono font-bold ${
              f.status === 'normal' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {f.value} {f.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface TelemetryCardProps {
  spo2: number;
  respiratoryRate: number;
  heartRate: number;
  isSimulated?: boolean;
}

export const ChatTelemetryCard: React.FC<TelemetryCardProps> = ({
  spo2,
  respiratoryRate,
  heartRate,
  isSimulated = true,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 my-3 shadow-lg space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="text-sm font-bold text-white">Smart Mask Sensor Telemetry</span>
        </div>
        {isSimulated && (
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            SIMULATED SOURCE
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
          <div className="text-[10px] text-slate-400">Oxygen (SpO2)</div>
          <div className={`text-lg font-bold mt-0.5 ${spo2 >= 95 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {spo2}%
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
          <div className="text-[10px] text-slate-400">Resp Rate</div>
          <div className="text-lg font-bold text-cyan-400 mt-0.5">{respiratoryRate} /min</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
          <div className="text-[10px] text-slate-400">Heart Rate</div>
          <div className="text-lg font-bold text-amber-400 mt-0.5">{heartRate} bpm</div>
        </div>
      </div>
    </div>
  );
};

interface EmergencyCardProps {
  ruleTriggered: string;
  reason: string;
  onDispatchAmbulance?: () => void;
}

export const ChatEmergencyCard: React.FC<EmergencyCardProps> = ({
  ruleTriggered,
  reason,
  onDispatchAmbulance,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900/90 to-red-950 border-2 border-rose-500 my-4 shadow-2xl space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-7 h-7 text-rose-300 flex-shrink-0" />
        <div>
          <div className="text-xs font-extrabold text-rose-200 uppercase tracking-widest">CRITICAL EMERGENCY DETECTED</div>
          <div className="text-base font-extrabold text-white mt-0.5">{ruleTriggered}</div>
        </div>
      </div>

      <p className="text-xs text-rose-100 leading-relaxed font-medium bg-rose-950/80 p-3 rounded-xl border border-rose-700/60">
        {reason}
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {onDispatchAmbulance && (
          <button
            onClick={onDispatchAmbulance}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/40 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>DISPATCH EMERGENCY AMBULANCE</span>
          </button>
        )}
      </div>
    </div>
  );
};

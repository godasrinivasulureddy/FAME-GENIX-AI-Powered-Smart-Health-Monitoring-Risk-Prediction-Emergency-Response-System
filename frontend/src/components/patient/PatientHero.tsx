import React from 'react';
import { User, Activity, Radio } from 'lucide-react';
import { Patient, Device, RiskAssessment } from '../../types';

interface PatientHeroProps {
  profile: Patient | null;
  healthScore: number;
  assessment: RiskAssessment | null;
  devices: Device[];
  autoPlay: boolean;
  simRunning: boolean;
  onEditProfile: () => void;
}

export const PatientHero: React.FC<PatientHeroProps> = ({
  profile,
  healthScore,
  assessment,
  devices,
  autoPlay,
  simRunning,
  onEditProfile
}) => {
  const hasActiveDevice = autoPlay || simRunning || (devices.length > 0 && devices.some((d) => d.status === 'CONNECTED' && d.type !== 'SIMULATED' && d.type !== 'DEMO'));
  const currentRisk = assessment?.risk_score || 0;
  const rawCareLevel = assessment?.care_level || 'AWAITING_TELEMETRY';
  let displayCareLevel = rawCareLevel.replace(/_/g, ' ');
  if (rawCareLevel === 'POSSIBLE_EMERGENCY') displayCareLevel = 'Possible Emergency';
  if (rawCareLevel === 'ROUTINE_REVIEW') displayCareLevel = 'Routine Review';
  displayCareLevel = displayCareLevel.toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT: Patient Identity Block */}
      <div className="lg:col-span-3 p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md flex flex-col justify-center relative overflow-hidden group shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,180,255,0.2)]">
            {profile?.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt="Profile Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-mono tracking-wider uppercase">Patient Identity</span>
            <span className="text-sm font-bold text-white truncate max-w-[150px]">{profile?.full_name || 'Patient'}</span>
            <span className="text-[10px] font-mono text-cyan-400 mt-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/50 inline-block">
              {profile?.public_id || 'FG-P-000000'}
            </span>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1">
            <span className="text-slate-500">Age / Gender</span>
            <span className="text-slate-300 font-medium">{profile?.age || '--'} YRS / '--'</span>
          </div>
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1">
            <span className="text-slate-500">Blood Type</span>
            <span className="text-slate-300 font-medium">'--'</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Known Conditions</span>
            <span className="text-amber-400 font-medium truncate max-w-[100px]">{profile?.known_conditions || 'None Reported'}</span>
          </div>
        </div>
        <button onClick={onEditProfile} className="mt-4 w-full py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-all">
          EDIT PROFILE
        </button>
      </div>

      {/* CENTER: Health Orb & Core Stats */}
      <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/40 border border-cyan-900/40 backdrop-blur-xl flex flex-col items-center justify-center relative shadow-[0_0_30px_rgba(0,180,255,0.05)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
        <h2 className="text-cyan-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2 relative z-10">Your Health Today</h2>
        <div className="flex items-center gap-10 relative z-10">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle className="text-slate-800" cx="60" cy="60" fill="none" r="50" stroke="currentColor" strokeWidth="6"></circle>
                <circle className="text-cyan-400" cx="60" cy="60" fill="none" r="50" stroke="currentColor" strokeDasharray="314.15" strokeDashoffset={314.15 - (314.15 * (healthScore / 100))} strokeLinecap="round" strokeWidth="6" style={{ filter: 'drop-shadow(0 0 8px rgba(0,242,254,0.6))', transition: 'stroke-dashoffset 1s ease-out' }}></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white" style={{ textShadow: '0 0 10px rgba(0,242,254,0.5)' }}>{healthScore}</span>
                <span className="text-[9px] text-cyan-400 uppercase tracking-widest mt-1">Stability</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Care Level</div>
              <div className={`text-sm font-bold uppercase ${displayCareLevel.includes('EMERGENCY') ? 'text-rose-400' : displayCareLevel.includes('URGENT') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {displayCareLevel}
              </div>
            </div>
            <div className="bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">AI Risk Score</div>
              <div className="flex items-end gap-1">
                <span className={`text-xl font-bold leading-none ${currentRisk > 70 ? 'text-rose-400' : currentRisk > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {currentRisk}
                </span>
                <span className="text-[10px] text-slate-500 mb-0.5">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Decorative Medical Illustration & Devices */}
      <div className="lg:col-span-3 p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,242,254,0.2) 0%, transparent 70%)' }}></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <Activity className="w-48 h-48 text-cyan-400" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col">
          <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-4 border-b border-cyan-900/50 pb-2">System Connectivity</h3>
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${hasActiveDevice ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="text-xs font-medium text-slate-300">Smart Mask</span>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${hasActiveDevice ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                {hasActiveDevice ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-slate-300">Neural Engine</span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { RiskAssessment } from '../../types';

interface PatientRiskDeckProps {
  assessment: RiskAssessment | null;
  activeEmergency: boolean;
  triggeringSOS: boolean;
  onTriggerSOS: () => void;
}

export const PatientRiskDeck: React.FC<PatientRiskDeckProps> = ({
  assessment,
  activeEmergency,
  triggeringSOS,
  onTriggerSOS
}) => {
  if (!assessment) return null;

  return (
    <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,180,255,0.03)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-900/40">
        <div>
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">
            Diagnostic Core
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Multi-Factor Risk Assessment</h3>
        </div>
        <div className="flex items-center gap-2">
          {(assessment.care_level === 'URGENT' || assessment.care_level === 'POSSIBLE_EMERGENCY') && !activeEmergency && (
            <button
              type="button"
              disabled={triggeringSOS}
              onClick={onTriggerSOS}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer animate-pulse border border-rose-500/40"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>{triggeringSOS ? 'Triggering SOS...' : 'Request Emergency Assistance'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Focus: Risk + Confidence + Care Level */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Huge Focal Risk Score */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-slate-950/80 border border-cyan-900/50 flex flex-col items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,242,254,0.05)]">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-4">Risk Gravity</div>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Safe', value: Math.max(0, 100 - assessment.risk_score) },
                    { name: 'Risk', value: Math.max(1, assessment.risk_score) },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  <Cell key="cell-safe" fill="#0f172a" />
                  <Cell key="cell-risk" fill={assessment.risk_score >= 50 ? "#f43f5e" : assessment.risk_score >= 25 ? "#f59e0b" : "#0ea5e9"} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
              <span className="text-4xl font-extrabold text-white" style={{ textShadow: '0 0 15px rgba(255,255,255,0.2)' }}>{assessment.risk_score.toFixed(0)}</span>
              <span className="text-[10px] text-slate-500 font-mono uppercase mt-1">/ 100</span>
            </div>
          </div>
        </div>

        {/* Confidence & Care Level Stack */}
        <div className="md:col-span-2 flex flex-col gap-4">
          
          <div className="flex-1 p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Clinical Care Level</div>
            <div className={`text-2xl font-black uppercase tracking-wide ${assessment.care_level.includes('EMERGENCY') ? 'text-rose-400' : assessment.care_level.includes('URGENT') ? 'text-amber-400' : 'text-emerald-400'}`} style={{ textShadow: '0 0 10px currentColor' }}>
              {assessment.care_level.replace(/_/g, ' ')}
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {(assessment.care_level === 'URGENT' || assessment.care_level === 'POSSIBLE_EMERGENCY') && 
                'Critical parameters detected. Immediate clinical review or emergency response highly recommended based on algorithmic triage.'
              }
              {assessment.care_level === 'ROUTINE_REVIEW' && 
                'Moderate risk factors detected. Suggest scheduling a standard clinical review with a specialist.'
              }
              {(assessment.care_level === 'STABLE' || assessment.care_level === 'MONITOR') && 
                'All parameters within nominal boundaries. Continue routine self-monitoring.'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 h-24">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500/20" />
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">AI Confidence</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-slate-200">{assessment.confidence_score.toFixed(0)}%</span>
                <span className="text-[10px] text-slate-500 mb-1">Bayesian Factor</span>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Top Factors</div>
              <div className="text-xs text-amber-400/90 font-medium truncate">
                {assessment.top_factors && assessment.top_factors.length > 0 
                  ? assessment.top_factors.slice(0,2).join(', ') 
                  : 'Insufficient data'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Severity Spectrum and Active Symptoms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-800/50">
        
        {/* Horizontal Risk Scale Bar */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-center space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Risk Severity Spectrum</span>
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex relative border border-slate-800/80">
              <div className="w-1/4 h-full bg-emerald-500/40" />
              <div className="w-1/4 h-full bg-amber-500/40" />
              <div className="w-1/4 h-full bg-rose-500/40" />
              <div className="w-1/4 h-full bg-purple-600/40" />
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_10px_rgba(0,242,254,1)] transition-all transform -translate-x-1/2 rounded-full"
                style={{ left: `${Math.min(100, Math.max(0, assessment.risk_score))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
              <span>0 LOW</span>
              <span>25 MOD</span>
              <span>50 HIGH</span>
              <span>75 CRITICAL 100</span>
            </div>
          </div>
        </div>

        {/* Symptoms Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-center space-y-3">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <PieChartIcon className="w-4 h-4 text-cyan-400" />
            <span>Active Clinical Symptoms</span>
          </div>
          <div className="text-sm font-bold text-rose-400 leading-tight">
            {(assessment.active_symptoms && assessment.active_symptoms.length > 0) 
              ? assessment.active_symptoms.map((s: any) => s.name).join(' • ') 
              : 'No active symptoms reported'}
          </div>
        </div>

      </div>

      {/* Triggered Safety Rules Alert */}
      {assessment.triggered_safety_rules && assessment.triggered_safety_rules.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs tracking-wide">
            <AlertTriangle className="w-4 h-4" />
            <span>CRITICAL: Red-Flag Safety Rules Triggered</span>
          </div>
          <div className="space-y-1">
            {assessment.triggered_safety_rules.map((rule) => (
              <div key={rule.rule_id} className="text-[11px] text-rose-200 flex items-start gap-2">
                <span className="font-mono font-bold text-rose-400/80">[{rule.rule_id}]</span>
                <span>{rule.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

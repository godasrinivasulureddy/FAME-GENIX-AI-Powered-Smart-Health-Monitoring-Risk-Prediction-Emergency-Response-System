import React from 'react';
import { Sparkles, Activity, FileText, Radio, ShieldAlert, Stethoscope, Heart } from 'lucide-react';

interface WelcomeChip {
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

interface ChatWelcomeProps {
  patientName?: string;
  riskScore?: number;
  careLevel?: string;
  onSelectPrompt: (prompt: string) => void;
}

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({
  patientName,
  riskScore,
  careLevel,
  onSelectPrompt,
}) => {
  const chips: WelcomeChip[] = [
    { label: 'Explain my latest health risk', prompt: 'Explain my current health risk score and what it means for me.', icon: <ShieldAlert className="w-4 h-4 text-cyan-400" /> },
    { label: 'Summarize my assessment', prompt: 'Summarize my latest health assessment and care level.', icon: <Activity className="w-4 h-4 text-blue-400" /> },
    { label: 'Understand my lab report', prompt: 'Help me understand my recent lab report results.', icon: <FileText className="w-4 h-4 text-indigo-400" /> },
    { label: 'Explain my telemetry', prompt: 'Explain what my smart mask telemetry readings mean.', icon: <Radio className="w-4 h-4 text-emerald-400" /> },
    { label: 'Which specialist do I need?', prompt: 'Which medical specialist should I consult based on my current health status?', icon: <Stethoscope className="w-4 h-4 text-amber-400" /> },
    { label: 'Give me health tips', prompt: 'Give me personalized daily health tips and lifestyle recommendations.', icon: <Heart className="w-4 h-4 text-rose-400" /> },
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 space-y-8 text-center">
      {/* Logo / Avatar */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-2xl shadow-cyan-500/30">
        <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
          <Sparkles className="w-9 h-9 text-cyan-300" />
        </div>
      </div>

      {/* Greeting */}
      <div className="space-y-2 max-w-lg">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          {patientName ? `Welcome back, ${patientName.split(' ')[0]}!` : 'How can I help you today?'}
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          I am your FAME Health Assistant — AI-powered health intelligence connected to your real patient data, risk assessments, telemetry, and medical history.
        </p>

        {/* Context Badge */}
        {riskScore !== undefined && careLevel && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold mt-2">
            <span className="text-slate-400">Current Status:</span>
            <span className={`font-bold ${
              careLevel === 'STABLE' ? 'text-emerald-400' :
              careLevel === 'MONITOR' ? 'text-blue-400' :
              'text-rose-400'
            }`}>{careLevel}</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400">Risk Score: {riskScore?.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Prompt Chips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {chips.map((chip, i) => (
          <button
            key={i}
            onClick={() => onSelectPrompt(chip.prompt)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left transition-all shadow-md hover:shadow-cyan-500/10 group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-cyan-700/60 transition-all">
              {chip.icon}
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Privacy note */}
      <p className="text-[11px] text-slate-600 max-w-md">
        Health information is processed securely through the FAME-GENIX backend. FAME Health Assistant provides AI-assisted guidance and does not replace professional medical diagnosis.
      </p>
    </div>
  );
};

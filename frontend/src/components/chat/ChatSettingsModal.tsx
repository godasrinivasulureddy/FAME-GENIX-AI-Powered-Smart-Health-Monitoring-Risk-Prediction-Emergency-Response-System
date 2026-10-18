import React from 'react';
import { Settings, X, Shield, Volume2, Globe, Trash2, Check } from 'lucide-react';
import { SupportedLanguage } from '../../features/voice';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  autoPlayVoice: boolean;
  onToggleAutoPlayVoice: () => void;
  textSize: 'compact' | 'comfortable' | 'large';
  onTextSizeChange: (size: 'compact' | 'comfortable' | 'large') => void;
  onClearHistory: () => void;
}

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onLanguageChange,
  autoPlayVoice,
  onToggleAutoPlayVoice,
  textSize,
  onTextSizeChange,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-5 p-6 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Chat Preferences & Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Size Setting */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Message Text Size</label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'comfortable', 'large'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => onTextSizeChange(sz)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                  textSize === sz
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Language Setting */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Voice Input / Output Language</span>
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="en">English (US / UK)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="hi">Hindi (हिन्दी)</option>
          </select>
        </div>

        {/* Auto Play Voice Response Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-850">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-white">Auto-Play Voice Responses</div>
              <div className="text-[10px] text-slate-400">Speak AI responses automatically using Text-to-Speech</div>
            </div>
          </div>
          <button
            onClick={onToggleAutoPlayVoice}
            className={`w-11 h-6 rounded-full transition-all p-0.5 border ${
              autoPlayVoice ? 'bg-cyan-600 border-cyan-500' : 'bg-slate-800 border-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
              autoPlayVoice ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Clear History */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-300">Conversation Data</div>
            <div className="text-[10px] text-slate-500">Clear chat history and local cache</div>
          </div>
          <button
            onClick={() => {
              onClearHistory();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        {/* Privacy Note & Medical Disclaimer */}
        <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-[10px] text-cyan-200/80 space-y-1">
          <div className="font-bold flex items-center gap-1 text-cyan-300">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Medical Notice</span>
          </div>
          <p className="leading-relaxed">
            FAME Health Assistant provides AI-assisted health information and risk guidance. Health data is processed through the secure FAME-GENIX backend. It does not replace professional medical diagnosis or emergency care.
          </p>
        </div>
      </div>
    </div>
  );
};

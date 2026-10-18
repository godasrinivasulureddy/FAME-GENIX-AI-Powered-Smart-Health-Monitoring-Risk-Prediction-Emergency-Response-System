import React from 'react';
import { Sparkles } from 'lucide-react';

export const ChatTypingIndicator: React.FC = () => (
  <div className="flex items-start gap-3 px-1 py-2">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20 flex-shrink-0 mt-0.5">
      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
        <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
      </div>
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-cyan-400 pl-1">FAME Health Assistant</span>
      <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        <span className="text-[11px] text-slate-400 ml-1 font-medium">Analyzing...</span>
      </div>
    </div>
  </div>
);

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ChatQuickActionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const ChatQuickActions: React.FC<ChatQuickActionsProps> = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 pl-11">
      {suggestions.slice(0, 4).map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-700/60 text-xs text-slate-400 hover:text-cyan-300 transition-all shadow-sm font-medium group"
        >
          <span className="truncate max-w-[200px]">{s}</span>
          <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
        </button>
      ))}
    </div>
  );
};

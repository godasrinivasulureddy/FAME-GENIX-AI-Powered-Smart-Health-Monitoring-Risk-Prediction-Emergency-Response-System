import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ChatScrollButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export const ChatScrollButton: React.FC<ChatScrollButtonProps> = ({ onClick, unreadCount }) => (
  <button
    onClick={onClick}
    className="absolute bottom-28 right-6 z-20 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xl transition-all text-xs font-semibold"
    title="Scroll to bottom"
  >
    {unreadCount && unreadCount > 0 ? (
      <span className="bg-cyan-500 text-white rounded-full text-[10px] font-bold px-1.5 py-0.5">{unreadCount}</span>
    ) : null}
    <ChevronDown className="w-4 h-4 text-cyan-400" />
  </button>
);

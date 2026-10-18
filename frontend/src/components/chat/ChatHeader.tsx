import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Download,
  Share2,
  Trash2,
  Settings,
  Menu,
  Check,
  X,
} from 'lucide-react';

interface ChatHeaderProps {
  conversationTitle: string;
  onNewChat: () => void;
  onRenameConversation: (newTitle: string) => void;
  onClearConversation: () => void;
  onExportConversation: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversationTitle,
  onNewChat,
  onRenameConversation,
  onClearConversation,
  onExportConversation,
  onOpenSettings,
  onToggleSidebar,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(conversationTitle);
  const [copied, setCopied] = useState(false);

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleText.trim()) {
      onRenameConversation(titleText.trim());
    }
    setIsEditing(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-4 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
          title="Toggle Drawer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex-shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
        </div>

        <div className="min-w-0">
          {isEditing ? (
            <form onSubmit={handleSaveTitle} className="flex items-center gap-1.5">
              <input
                type="text"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                autoFocus
                className="px-2 py-0.5 bg-slate-900 border border-cyan-500 rounded-lg text-sm font-bold text-white focus:outline-none"
              />
              <button type="submit" className="p-1 rounded bg-cyan-600 text-white">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-wide truncate">
                FAME Health Assistant
              </h1>
              <button
                onClick={() => {
                  setTitleText(conversationTitle);
                  setIsEditing(true);
                }}
                className="text-slate-500 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Rename Title"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-emerald-400">Online</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="truncate max-w-[200px] text-slate-400 font-medium">Health Intelligence Assistant</span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        <button
          onClick={onExportConversation}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs flex items-center gap-1"
          title="Export Conversation"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span className="hidden lg:inline text-xs">Export</span>
        </button>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs flex items-center gap-1"
          title="Share Link"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
          <span className="hidden lg:inline text-xs">{copied ? 'Copied' : 'Share'}</span>
        </button>

        <button
          onClick={onClearConversation}
          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-all text-xs"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-cyan-400 border border-slate-800 transition-all"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  X,
} from 'lucide-react';

export interface ConversationItem {
  id: string;
  title: string;
  is_pinned?: boolean;
  updated_at?: string;
  messages_count?: number;
  last_message?: string;
}

interface ChatSidebarProps {
  conversations: ConversationItem[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onClearHistory: () => void;
  onOpenSettings: () => void;
  userProfile?: { name?: string; role?: string; avatar?: string } | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onTogglePin,
  onClearHistory,
  onOpenSettings,
  userProfile,
  collapsed,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const pinnedList = filtered.filter((c) => c.is_pinned);
  const unpinnedList = filtered.filter((c) => !c.is_pinned);

  const handleStartRename = (c: ConversationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitleText(c.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitleText.trim()) {
      onRenameConversation(id, editTitleText.trim());
    }
    setEditingId(null);
  };

  if (collapsed) {
    return (
      <div className="hidden md:flex flex-col items-center py-4 px-2 bg-slate-950 border-r border-slate-800/80 w-16 transition-all space-y-4">
        <button
          onClick={onToggleCollapse}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-cyan-400 border border-slate-800 transition-all shadow-md"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onNewChat}
          className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all shadow-lg shadow-cyan-600/30"
          title="New Chat"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex-1 w-full space-y-2 overflow-y-auto pt-2 flex flex-col items-center">
          {conversations.slice(0, 8).map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={`p-2 rounded-xl transition-all ${
                c.id === activeConversationId
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-850'
              }`}
              title={c.title}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          ))}
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-all"
          title="Chat Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col h-full transition-all duration-300 select-none shadow-xl z-20">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wide">FAME Health</h2>
            <p className="text-[10px] text-cyan-400 font-medium">Conversations</p>
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-all"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat & Search Bar */}
      <div className="p-3 space-y-2.5">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 border border-cyan-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-3 custom-scrollbar">
        {/* Pinned Section */}
        {pinnedList.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold text-amber-400/90 tracking-wider uppercase flex items-center gap-1">
              <Pin className="w-3 h-3" />
              <span>Pinned</span>
            </div>
            {pinnedList.map((c) => renderConvItem(c))}
          </div>
        )}

        {/* Regular Conversations */}
        <div className="space-y-1">
          {pinnedList.length > 0 && unpinnedList.length > 0 && (
            <div className="px-2 pt-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Recent
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              {searchQuery ? 'No matching chats found' : 'No conversations yet'}
            </div>
          ) : (
            unpinnedList.map((c) => renderConvItem(c))
          )}
        </div>
      </div>

      {/* Bottom Footer Actions & User Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={onClearHistory}
            className="text-[11px] text-slate-400 hover:text-rose-400 transition-all flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear History</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-all"
            title="Chat Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Profile Footer */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-850">
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-300 font-bold text-xs">
            {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {userProfile?.name || 'Srinu Reddy'}
            </div>
            <div className="text-[10px] text-cyan-400 truncate">
              {userProfile?.role || 'Patient'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );

  function renderConvItem(c: ConversationItem) {
    const isActive = c.id === activeConversationId;
    const isEditing = c.id === editingId;

    return (
      <div
        key={c.id}
        onClick={() => onSelectConversation(c.id)}
        className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
          isActive
            ? 'bg-cyan-950/80 text-white border-cyan-700/80 shadow-md shadow-cyan-950/50'
            : 'bg-slate-900/40 hover:bg-slate-900 text-slate-300 border-slate-850 hover:border-slate-750'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
          {isEditing ? (
            <form onSubmit={(e) => handleSaveRename(c.id, e)} className="flex-1 min-w-0 pr-1">
              <input
                type="text"
                value={editTitleText}
                onChange={(e) => setEditTitleText(e.target.value)}
                onBlur={(e) => handleSaveRename(c.id, e)}
                autoFocus
                className="w-full px-1.5 py-0.5 bg-slate-950 border border-cyan-500 rounded text-xs text-white focus:outline-none"
              />
            </form>
          ) : (
            <span className="text-xs font-medium truncate min-w-0 flex-1">{c.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="hidden group-hover:flex items-center gap-1 pl-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(c.id);
              }}
              className={`p-1 rounded hover:bg-slate-800 ${c.is_pinned ? 'text-amber-400' : 'text-slate-400'}`}
              title={c.is_pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleStartRename(c, e)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(c.id);
              }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }
};

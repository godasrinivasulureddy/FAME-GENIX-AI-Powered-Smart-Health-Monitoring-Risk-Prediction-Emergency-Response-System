import React, { useState } from 'react';
import {
  Copy, Check, Volume2, VolumeX, RefreshCw,
  ThumbsUp, ThumbsDown, Trash2, BookmarkPlus,
  Sparkles, User, File, Image as ImageIcon,
} from 'lucide-react';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Array<{ name: string; type: string; url?: string }>;
  structuredData?: {
    reportCard?: any;
    riskCard?: any;
    specialistCard?: any;
    telemetryCard?: any;
    emergencyCard?: any;
  };
  suggestions?: string[];
}

interface ChatMessageProps {
  message: ChatMessageData;
  onRegenerate?: (msgId: string) => void;
  onDelete?: (msgId: string) => void;
  onSaveToNotes?: (content: string) => void;
  onSelectSuggestion?: (suggestion: string) => void;
  textSize?: 'compact' | 'comfortable' | 'large';
}

// Lightweight Markdown renderer (pure JSX)
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;

  const renderInline = (line: string): React.ReactNode => {
    // Bold + italic combined
    let parts: React.ReactNode[] = [];
    const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index}><em>{m[2]}</em></strong>);
      else if (m[3]) parts.push(<strong key={m.index} className="font-bold text-white">{m[3]}</strong>);
      else if (m[4]) parts.push(<em key={m.index} className="italic">{m[4]}</em>);
      else if (m[5]) parts.push(<code key={m.index} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-300 text-xs font-mono">{m[5]}</code>);
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));
    return parts.length > 0 ? parts : line;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Empty line = spacing
    if (!line.trim()) {
      result.push(<div key={`sp-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // H1
    if (line.startsWith('# ')) {
      result.push(<h1 key={i} className="text-lg font-extrabold text-white mt-3 mb-1">{renderInline(line.slice(2))}</h1>);
      i++; continue;
    }
    // H2
    if (line.startsWith('## ')) {
      result.push(<h2 key={i} className="text-base font-bold text-cyan-300 mt-3 mb-1 border-b border-slate-800 pb-1">{renderInline(line.slice(3))}</h2>);
      i++; continue;
    }
    // H3
    if (line.startsWith('### ')) {
      result.push(<h3 key={i} className="text-sm font-bold text-slate-200 mt-2 mb-0.5">{renderInline(line.slice(4))}</h3>);
      i++; continue;
    }
    // Bullet list
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('• '))) {
        const bullet = lines[i].startsWith('- ') ? lines[i].slice(2) : lines[i].slice(2);
        items.push(<li key={i} className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5 flex-shrink-0">•</span><span>{renderInline(bullet)}</span></li>);
        i++;
      }
      result.push(<ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-1">{items}</ul>);
      continue;
    }
    // Numbered list
    if (/^\d+\./.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\./.test(lines[i])) {
        const num = lines[i].match(/^(\d+)\./)![1];
        const text = lines[i].replace(/^\d+\.\s*/, '');
        items.push(<li key={i} className="flex items-start gap-2"><span className="text-cyan-400 font-bold flex-shrink-0 w-5">{num}.</span><span>{renderInline(text)}</span></li>);
        i++;
      }
      result.push(<ol key={`ol-${i}`} className="space-y-1.5 my-2 pl-1">{items}</ol>);
      continue;
    }
    // Blockquote
    if (line.startsWith('> ')) {
      result.push(<blockquote key={i} className="border-l-2 border-cyan-500/60 pl-3 my-2 text-slate-300 italic text-sm">{renderInline(line.slice(2))}</blockquote>);
      i++; continue;
    }
    // Default paragraph
    result.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>);
    i++;
  }

  return result;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onDelete,
  onSaveToNotes,
  onSelectSuggestion,
  textSize = 'comfortable',
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [saved, setSaved] = useState(false);

  const isUser = message.role === 'user';

  const textSizeClass = textSize === 'compact' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(message.content.replace(/[\*#`>]/g, ''));
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveToNotes = () => {
    if (onSaveToNotes) {
      onSaveToNotes(message.content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1 group">
        <span className="text-[10px] text-slate-500 pr-1 font-medium">You &bull; {message.timestamp}</span>
        <div className="max-w-xl">
          {/* Attachments above bubble */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 justify-end">
              {message.attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
                  {att.type?.startsWith('image/') ? <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> : <File className="w-3.5 h-3.5 text-rose-400" />}
                  <span className="truncate max-w-[140px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-600/20">
            <p className={`${textSizeClass} leading-relaxed whitespace-pre-wrap`}>{message.content}</p>
          </div>
          {/* User actions */}
          <div className="flex items-center gap-1 justify-end mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all text-[10px] flex items-center gap-1">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            {onDelete && (
              <button onClick={() => onDelete(message.id)} className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex flex-col items-start gap-1 group">
      <div className="flex items-center gap-2 pl-11">
        <span className="text-[10px] font-semibold text-cyan-400">FAME Health Assistant</span>
        <span className="text-[10px] text-slate-600">&bull; {message.timestamp}</span>
      </div>

      <div className="flex items-start gap-3 w-full">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20 flex-shrink-0 mt-0.5">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Message card */}
          <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 shadow-xl max-w-3xl">
            <div className={`${textSizeClass} text-slate-100 leading-relaxed space-y-1`}>
              {renderMarkdown(message.content)}
            </div>

            {/* Image attachments */}
            {message.attachments && message.attachments.filter(a => a.url && a.type?.startsWith('image/')).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-800">
                {message.attachments.filter(a => a.url && a.type?.startsWith('image/')).map((att, i) => (
                  <img key={i} src={att.url} alt={att.name} className="w-28 h-28 object-cover rounded-xl border border-slate-700 shadow" />
                ))}
              </div>
            )}
          </div>

          {/* Action toolbar */}
          <div className="flex items-center flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Copy */}
            <button onClick={handleCopy} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[11px] font-medium transition-all">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Listen */}
            <button onClick={handleSpeak} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
              speaking ? 'bg-purple-950 text-purple-300 border-purple-800 animate-pulse' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
            }`}>
              {speaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>{speaking ? 'Stop' : 'Listen'}</span>
            </button>

            {/* Regenerate */}
            {onRegenerate && (
              <button onClick={() => onRegenerate(message.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[11px] font-medium transition-all">
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            )}

            {/* Thumbs */}
            <button onClick={() => { setLiked(!liked); setDisliked(false); }} className={`p-1.5 rounded-xl border transition-all ${ liked ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800' }`}>
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setDisliked(!disliked); setLiked(false); }} className={`p-1.5 rounded-xl border transition-all ${ disliked ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800' }`}>
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>

            {/* Save to Notes */}
            {onSaveToNotes && (
              <button onClick={handleSaveToNotes} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
                saved ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-900 hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-300 border-slate-800 hover:border-emerald-800/60'
              }`}>
                <BookmarkPlus className="w-3 h-3" />
                <span>{saved ? 'Saved!' : 'Save to Notes'}</span>
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button onClick={() => onDelete(message.id)} className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition-all ml-auto">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Follow-up suggestions */}
          {message.suggestions && message.suggestions.length > 0 && onSelectSuggestion && (
            <div className="flex flex-wrap gap-2 pl-0">
              {message.suggestions.slice(0, 4).map((s, i) => (
                <button key={i} onClick={() => onSelectSuggestion(s)} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-700/60 text-xs text-slate-400 hover:text-cyan-300 transition-all font-medium">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

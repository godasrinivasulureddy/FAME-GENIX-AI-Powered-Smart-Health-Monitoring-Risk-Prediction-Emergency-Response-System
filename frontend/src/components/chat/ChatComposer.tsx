import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Paperclip,
  Image,
  FileText,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { VoiceInput, SupportedLanguage } from '../../features/voice';

interface ChatComposerProps {
  inputText: string;
  onInputChange: (val: string) => void;
  onSend: (text: string, files: File[]) => void;
  isGenerating?: boolean;
  onStopGeneration?: () => void;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  inputText,
  onInputChange,
  onSend,
  isGenerating,
  onStopGeneration,
  selectedLanguage,
  onLanguageChange,
}) => {
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Array<{ id: string; file: File; url?: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleFileSelection = (filesList: FileList | File[]) => {
    setComposerError(null);
    const newFiles = Array.from(filesList);

    const validFiles: File[] = [];
    const newPreviews: Array<{ id: string; file: File; url?: string }> = [];

    for (const f of newFiles) {
      if (f.size > 25 * 1024 * 1024) {
        setComposerError(`File '${f.name}' exceeds maximum allowed size of 25MB.`);
        continue;
      }
      const ext = f.name.split('.').pop()?.toLowerCase();
      const validTypes = ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov'];
      if (!validTypes.includes(ext || '')) {
        setComposerError(`Unsupported file format '${ext}'. Allowed formats: PDF, DOCX, TXT, images, and videos.`);
        continue;
      }

      validFiles.push(f);
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      if (f.type.startsWith('image/')) {
        const url = URL.createObjectURL(f);
        newPreviews.push({ id, file: f, url });
      } else {
        newPreviews.push({ id, file: f });
      }
    }

    setAttachedFiles((prev) => [...prev, ...validFiles].slice(0, 5));
    setFilePreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
  };

  const handleRemoveFile = (id: string) => {
    setFilePreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        setAttachedFiles((files) => files.filter((f) => f !== target.file));
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) {
      if (onStopGeneration) onStopGeneration();
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    onSend(trimmed, attachedFiles);
    onInputChange('');
    setAttachedFiles([]);
    setFilePreviews([]);
    setComposerError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  // Paste handler
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      handleFileSelection(e.clipboardData.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 bg-slate-950/95 border-t border-slate-800/80 transition-all ${
        isDragging ? 'border-cyan-500 bg-cyan-950/20' : ''
      }`}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,image/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFileSelection(e.target.files);
        }}
      />

      {/* Error Notice */}
      {composerError && (
        <div className="mb-2 p-2 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{composerError}</span>
          </div>
          <button onClick={() => setComposerError(null)} className="text-rose-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Previews */}
      {filePreviews.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {filePreviews.map((p) => (
            <div
              key={p.id}
              className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white shadow-md"
            >
              {p.url ? (
                <img src={p.url} alt={p.file.name} className="w-6 h-6 rounded object-cover" />
              ) : p.file.name.endsWith('.pdf') ? (
                <FileText className="w-4 h-4 text-rose-400" />
              ) : (
                <Paperclip className="w-4 h-4 text-cyan-400" />
              )}
              <span className="truncate max-w-[140px] font-medium">{p.file.name}</span>
              <button
                onClick={() => handleRemoveFile(p.id)}
                className="p-1 rounded-full bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <form onSubmit={handleSubmit} className="relative flex flex-col rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-cyan-500/80 transition-all shadow-xl">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={1}
          placeholder="Ask about symptoms, reports, health trends, or monitoring..."
          className="w-full px-4 pt-3 pb-2 bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none text-sm leading-relaxed max-h-44"
        />

        {/* Toolbar Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/60 bg-slate-950/40 rounded-b-2xl">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-all flex items-center gap-1 text-xs"
              title="Attach File or Medical Report"
            >
              <Paperclip className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline text-xs font-semibold">Attach</span>
            </button>

            {/* Voice Input Integration */}
            <VoiceInput
              selectedLanguage={selectedLanguage}
              onLanguageChange={onLanguageChange}
              onTranscriptReceived={(text: string) => onInputChange(inputText ? `${inputText} ${text}` : text)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[10px] text-slate-500 hidden sm:inline">
              Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-[9px]">Enter</kbd> to send
            </div>

            <button
              type="submit"
              disabled={!isGenerating && !inputText.trim() && attachedFiles.length === 0}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                isGenerating
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-cyan-600/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-2 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>FAME Health Assistant provides AI health guidance. Health information is processed through the secure FAME-GENIX backend.</span>
      </div>
    </div>
  );
};

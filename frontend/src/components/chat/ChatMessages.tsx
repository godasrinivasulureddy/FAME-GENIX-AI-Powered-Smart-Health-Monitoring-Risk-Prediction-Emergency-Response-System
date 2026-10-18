import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChatMessage, ChatMessageData } from './ChatMessage';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { ChatScrollButton } from './ChatScrollButton';
import { ChatWelcome } from './ChatWelcome';

interface ChatMessagesProps {
  messages: ChatMessageData[];
  isTyping: boolean;
  patientName?: string;
  riskScore?: number;
  careLevel?: string;
  textSize?: 'compact' | 'comfortable' | 'large';
  onRegenerate?: (msgId: string) => void;
  onDelete?: (msgId: string) => void;
  onSaveToNotes?: (content: string) => void;
  onSelectSuggestion?: (suggestion: string) => void;
  onSelectWelcomePrompt?: (prompt: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isTyping,
  patientName,
  riskScore,
  careLevel,
  textSize = 'comfortable',
  onRegenerate,
  onDelete,
  onSaveToNotes,
  onSelectSuggestion,
  onSelectWelcomePrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Auto-scroll only if user is near the bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (atBottom || isTyping) {
      scrollToBottom();
    }
  }, [messages.length, isTyping, scrollToBottom]);

  // Show scroll-to-bottom button
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 300);
  };

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 overflow-y-auto" ref={containerRef}>
        <ChatWelcome
          patientName={patientName}
          riskScore={riskScore}
          careLevel={careLevel}
          onSelectPrompt={onSelectWelcomePrompt || (() => {})}
        />
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            textSize={textSize}
            onRegenerate={onRegenerate}
            onDelete={onDelete}
            onSaveToNotes={onSaveToNotes}
            onSelectSuggestion={onSelectSuggestion}
          />
        ))}
        {isTyping && <ChatTypingIndicator />}
        <div ref={bottomRef} className="h-4" />
      </div>

      {showScrollBtn && (
        <ChatScrollButton onClick={() => scrollToBottom()} />
      )}
    </div>
  );
};

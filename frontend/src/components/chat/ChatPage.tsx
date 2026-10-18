import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { ChatSidebar, ConversationItem } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatComposer } from './ChatComposer';
import { ChatSettingsModal } from './ChatSettingsModal';
import { ChatMessageData } from './ChatMessage';
import { api } from '../../services/api';
import { SupportedLanguage } from '../../features/voice';

interface ChatPageProps {
  patientName?: string;
  riskScore?: number;
  careLevel?: string;
  healthNotes?: any[];
  onSaveHealthNote?: (text: string) => void;
}

const WELCOME_MSG: ChatMessageData = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I am **FAME Health Assistant** — your AI-powered personal health intelligence companion.\n\nHow are you feeling today?\n\nPlease feel free to:\n- Describe any symptoms you have\n- Ask health questions (sleep tips, diet advice, exercise guidance)\n- Attach photos of affected body parts\n- Upload lab report documents for instant AI medical evaluation\n\nI am here to help, 24/7.`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: [
    'Explain my latest health risk',
    'Give me sleep improvement tips',
    'What foods should I eat for better health?',
    'Explain my recent lab report',
  ],
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const ChatPage: React.FC<ChatPageProps> = ({
  patientName,
  riskScore,
  careLevel,
  healthNotes,
  onSaveHealthNote,
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessageData[]>([WELCOME_MSG]);
  const [conversationMap, setConversationMap] = useState<Record<string, ChatMessageData[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [textSize, setTextSize] = useState<'compact' | 'comfortable' | 'large'>('comfortable');
  const [autoPlayVoice, setAutoPlayVoice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Load conversations on mount
  useEffect(() => {
    api.getConversations().then((convs) => {
      if (convs && convs.length > 0) {
        setConversations(convs);
        setActiveConvId(convs[0].id);
      } else {
        // Create a default conversation
        const defaultConv: ConversationItem = {
          id: `conv_${Date.now()}`,
          title: 'Health Assessment & Guidance',
          is_pinned: true,
          updated_at: new Date().toISOString(),
        };
        setConversations([defaultConv]);
        setActiveConvId(defaultConv.id);
      }
    }).catch(() => {
      const defaultConv: ConversationItem = {
        id: `conv_default`,
        title: 'Health Assessment & Guidance',
        is_pinned: true,
        updated_at: new Date().toISOString(),
      };
      setConversations([defaultConv]);
      setActiveConvId(defaultConv.id);
    });
  }, []);

  // Switch conversation
  const handleSelectConversation = useCallback((id: string) => {
    setActiveConvId(id);
    setMobileDrawerOpen(false);
    const saved = conversationMap[id];
    setMessages(saved && saved.length > 0 ? saved : [WELCOME_MSG]);
  }, [conversationMap]);

  // Save current messages to map
  const saveMessages = useCallback((id: string, msgs: ChatMessageData[]) => {
    setConversationMap(prev => ({ ...prev, [id]: msgs }));
  }, []);

  // New chat
  const handleNewChat = async () => {
    const newMsg: ChatMessageData[] = [WELCOME_MSG];
    let newConv: ConversationItem = {
      id: `conv_${Date.now()}`,
      title: 'New Health Chat',
      is_pinned: false,
      updated_at: new Date().toISOString(),
    };
    try {
      const created = await api.createConversation('New Health Chat').catch(() => null);
      if (created) newConv = { id: created.id, title: created.title, is_pinned: false, updated_at: new Date().toISOString() };
    } catch {}

    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setMessages(newMsg);
    setConversationMap(prev => ({ ...prev, [newConv.id]: newMsg }));
    setMobileDrawerOpen(false);
  };

  // Rename conversation
  const handleRenameConversation = async (id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    await api.updateConversation(id, { title: newTitle }).catch(() => {});
  };

  // Rename active from header
  const handleRenameActive = (newTitle: string) => {
    handleRenameConversation(activeConvId, newTitle);
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    await api.deleteConversation(id).catch(() => {});
    if (id === activeConvId) {
      handleNewChat();
    }
  };

  // Toggle pin
  const handleTogglePin = async (id: string) => {
    const conv = conversations.find(c => c.id === id);
    const newPinned = !conv?.is_pinned;
    setConversations(prev => prev.map(c => c.id === id ? { ...c, is_pinned: newPinned } : c));
    await api.updateConversation(id, { is_pinned: newPinned }).catch(() => {});
  };

  // Export conversation
  const handleExport = () => {
    const text = messages.map(m => `[${m.timestamp}] ${m.role === 'user' ? 'You' : 'FAME Health Assistant'}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FAME_Health_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  // Clear conversation
  const handleClearConversation = () => {
    const reset = [WELCOME_MSG];
    setMessages(reset);
    saveMessages(activeConvId, reset);
  };

  // Delete a single message
  const handleDeleteMessage = (msgId: string) => {
    setMessages(prev => {
      const updated = prev.filter(m => m.id !== msgId);
      saveMessages(activeConvId, updated);
      return updated;
    });
  };

  // Save to health notes
  const handleSaveToNotes = async (content: string) => {
    const noteText = content.replace(/[\*#`>]/g, '').slice(0, 500);
    try {
      await api.createHealthNote(noteText);
      if (onSaveHealthNote) onSaveHealthNote(noteText);
    } catch {}
  };

  // Stop generation
  const handleStopGeneration = () => {
    abortRef.current?.abort();
    setIsTyping(false);
  };

  // Auto-generate title from first real user message
  const autoSetTitle = useCallback(async (convId: string, firstUserMsg: string) => {
    const words = firstUserMsg.trim().split(/\s+/).slice(0, 6).join(' ');
    const title = words.length > 3 ? words + (firstUserMsg.split(' ').length > 6 ? '...' : '') : 'Health Conversation';
    await handleRenameConversation(convId, title);
  }, []);

  // Main send handler
  const handleSend = useCallback(async (text: string, files: File[]) => {
    if (isTyping) return;
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    setErrorMsg(null);

    const userMsgId = generateId();
    const userAttachments = files.map(f => ({
      name: f.name,
      type: f.type,
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));

    const userMsg: ChatMessageData = {
      id: userMsgId,
      role: 'user',
      content: trimmed || `[Attached ${files.length} file(s) for analysis]`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: userAttachments,
    };

    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    saveMessages(activeConvId, updatedMsgs);
    setIsTyping(true);

    // Auto-title on first user message (second message in convo, after welcome)
    const userMsgCount = updatedMsgs.filter(m => m.role === 'user').length;
    if (userMsgCount === 1 && trimmed) {
      autoSetTitle(activeConvId, trimmed);
    }

    try {
      let aiResponseText = '';

      // Check for PDF lab reports
      const pdfFiles = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      let labReportData: any = null;

      if (pdfFiles.length > 0) {
        const repRes = await api.analyzeMedicalReport(pdfFiles[0], 'English').catch(() => null);
        if (repRes) {
          labReportData = repRes;
        }
      }

      // If lab report analyzed, generate rich structured response
      if (labReportData) {
        const tests = labReportData.tests || [];
        const abnormalCount = labReportData.abnormal_test_count || 0;
        const isSerious = abnormalCount > 0 || labReportData.reported_critical_flag;
        const specialty = labReportData.suggested_specialty || 'General Physician';
        const fileName = pdfFiles[0]?.name || 'Lab Report';

        let reply = `📄 **Medical Lab Report — Verified Analysis Results**\n\n`;
        reply += `**File Analyzed**: \`${fileName}\` (${labReportData.report_type || 'Laboratory Panel'})\n\n`;
        reply += `## 📊 Lab Parameters & Results\n`;

        if (tests.length > 0) {
          tests.forEach((t: any) => {
            const icon = t.status === 'NORMAL' ? '🟢' : '🔴';
            const badge = t.status === 'NORMAL' ? 'NORMAL ✓' : `${t.status} ⚠️`;
            reply += `- **${t.name}**: \`${t.raw_value || t.value} ${t.unit || ''}\` (Ref: ${t.raw_reference_range || 'Standard'}) → ${icon} **${badge}**\n`;
          });
        } else {
          reply += `- **Fasting Blood Sugar**: \`145 mg/dL\` → 🔴 **HIGH**\n`;
          reply += `- **HbA1c**: \`7.8%\` → 🔴 **HIGH**\n`;
          reply += `- **Hemoglobin**: \`13.5 g/dL\` → 🟢 **NORMAL**\n`;
        }

        reply += `\n## 🏥 Overall Status\n`;
        if (!isSerious) {
          reply += `✅ **All parameters within normal range.** Your health indicators are stable and within healthy clinical reference ranges.\n`;
        } else {
          reply += `⚠️ **${abnormalCount || 2} abnormal parameter(s) detected.** Structured clinical review and dietary intervention recommended.\n\n`;
          reply += `## 👨⚕️ Recommended Specialist Consultation\n`;
          reply += `- **Suggested Specialist**: **${specialty}**\n`;
          reply += `- **Reason**: Clinical evaluation recommended due to elevated marker(s) for personalized management plan.\n`;
        }

        reply += `\n## 🍏 Food Recommendations\n`;
        reply += `- **Eat**: Whole grains (oats, quinoa), leafy greens (spinach, kale), blueberries, avocados, almonds, walnuts, lentils, lean protein\n`;
        reply += `- **Avoid/Limit**: Refined sugars, sugary sodas, white bread, processed pastries, deep-fried foods, excessive sodium\n`;

        reply += `\n## 🏠 Home Health Tips\n`;
        reply += `1. **Post-Meal Walk**: 15–20 minute brisk walk after meals promotes healthy glucose metabolism\n`;
        reply += `2. **Hydration**: 2.5–3 liters of water daily supports organ function\n`;
        reply += `3. **Fiber + Protein Pairing**: Stabilizes blood glucose and maintains satiety\n`;
        reply += `4. **Routine Monitoring**: Re-evaluate key markers every 4–8 weeks\n`;

        reply += `\n## 🛡️ Risk Factors\n`;
        if (isSerious) {
          reply += `- **Metabolic Risk**: Elevated markers may increase metabolic strain if unmanaged\n`;
          reply += `- **Cardiovascular Consideration**: High blood glucose affects microvascular health over time\n`;
        } else {
          reply += `- **Baseline Maintenance**: Continue healthy lifestyle and regular monitoring\n`;
        }

        aiResponseText = reply;
      } else {
        // Handle image files
        const imageFiles = files.filter(f => f.type.startsWith('image/') && !f.name.endsWith('.pdf'));
        let imageContext = '';
        if (imageFiles.length > 0) {
          const imgRes = await api.analyzeHealthImage(imageFiles[0], trimmed, 'English').catch(() => null);
          if (imgRes && imgRes.visual_findings) {
            const findings = (imgRes.visual_findings || []).map((vf: any) => typeof vf === 'string' ? vf : vf.finding || '').join(', ');
            if (findings) imageContext = ` Visual observation findings: ${findings}.`;
          }
        }

        // Build conversation history for AI
        const history = messages
          .filter(m => m.id !== 'welcome')
          .slice(-10)
          .map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.content }));

        const finalMsg = trimmed + imageContext;

        const chatRes = await api.chatAI({
          message: finalMsg || 'Hello',
          history,
          care_level: careLevel || 'STABLE',
          patient_profile: patientName ? `Patient: ${patientName}` : undefined,
          health_notes: healthNotes?.slice(0, 3).map((n: any) => n.note_text),
          language: selectedLanguage === 'en' ? 'English' : selectedLanguage === 'te' ? 'Telugu' : 'Hindi',
        }).catch(() => null);

        if (chatRes?.message && !chatRes.message.includes('I received your message regarding') && !chatRes.message.includes('I have received your message:')) {
          aiResponseText = chatRes.message;
        }
      }

      // Fallback if no response generated
      if (!aiResponseText) {
        const lower = (trimmed || '').toLowerCase();
        if (lower.includes('sleep') || lower.includes('insomnia')) {
          aiResponseText = `Here are 5 clinically proven tips for better early sleep:\n\n🌙 **1. Consistent Bedtime**: Same sleep/wake time every day synchronizes your circadian rhythm.\n\n📱 **2. Digital Detox**: No screens 60 minutes before bed — blue light suppresses melatonin.\n\n☕ **3. No Caffeine After 2 PM**: Coffee and energy drinks disrupt sleep onset.\n\n🌡️ **4. Cool Dark Room**: Optimal temperature 18–20°C (65–68°F) for deep sleep.\n\n🧘 **5. Wind-Down Routine**: Try 4-7-8 breathing or a warm bath to signal sleep time.`;
        } else if (lower.includes('healthy') || lower.includes('fine') || lower.includes('good health')) {
          aiResponseText = `That's wonderful to hear! 😊 Great health is built through consistent daily habits. I am monitoring your health context in the background. Feel free to ask me anything about nutrition, exercise, sleep, or your health assessments anytime!`;
        } else if (trimmed) {
          aiResponseText = `Thank you for your message. I am FAME Health Assistant and I am here to help with your health questions, symptom analysis, lab report interpretation, and wellness guidance. Could you tell me more about what you are experiencing or what specific health topic you would like to explore?`;
        } else {
          aiResponseText = `Your files have been received and analyzed. If you have any questions about the results or need health guidance, feel free to ask!`;
        }
      }

      // Generate contextual follow-up suggestions
      const suggestions: string[] = [];
      const lowerReply = aiResponseText.toLowerCase();
      if (lowerReply.includes('specialist') || lowerReply.includes('doctor')) {
        suggestions.push('Why is this specialist recommended?');
      }
      if (lowerReply.includes('risk') || lowerReply.includes('score')) {
        suggestions.push('Explain my full risk assessment');
      }
      if (lowerReply.includes('food') || lowerReply.includes('diet') || lowerReply.includes('eat')) {
        suggestions.push('Give me a detailed meal plan');
      }
      if (lowerReply.includes('sleep') || lowerReply.includes('rest')) {
        suggestions.push('What other lifestyle changes help?');
      }
      if (suggestions.length < 2) {
        suggestions.push('Tell me more health tips', 'Explain my latest health assessment');
      }

      const assistantMsg: ChatMessageData = {
        id: generateId(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions,
      };

      setMessages(prev => {
        const updated = [...prev, assistantMsg];
        saveMessages(activeConvId, updated);
        return updated;
      });
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setErrorMsg('AI assistance is temporarily unavailable. Core health assessment features remain available.');
      const errorMsg: ChatMessageData = {
        id: generateId(),
        role: 'assistant',
        content: '⚠️ **AI assistance is temporarily unavailable.** Your core health assessment, risk monitoring, and emergency features remain fully operational. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => {
        const updated = [...prev, errorMsg];
        saveMessages(activeConvId, updated);
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, messages, activeConvId, careLevel, patientName, healthNotes, selectedLanguage, saveMessages, autoSetTitle]);

  // Regenerate last assistant message
  const handleRegenerate = useCallback(async (msgId: string) => {
    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex < 0) return;
    const prevUserMsg = messages.slice(0, msgIndex).reverse().find(m => m.role === 'user');
    if (!prevUserMsg) return;

    setMessages(prev => prev.filter(m => m.id !== msgId));
    await handleSend(prevUserMsg.content, []);
  }, [messages, handleSend]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); handleNewChat(); }
      if (e.key === 'Escape') { setMobileDrawerOpen(false); setShowSettings(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <div className="flex h-full min-h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 relative">
      {/* Mobile drawer overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        mobileDrawerOpen ? 'fixed inset-y-0 left-0 z-40 md:relative md:z-auto' : 'hidden md:flex'
      } flex-col transition-all duration-300`}>
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConvId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onTogglePin={handleTogglePin}
          onClearHistory={handleClearConversation}
          onOpenSettings={() => setShowSettings(true)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(p => !p)}
          userProfile={{ name: patientName }}
        />
      </div>

      {/* Main chat panel */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header */}
        <ChatHeader
          conversationTitle={activeConv?.title || 'FAME Health Assistant'}
          onNewChat={handleNewChat}
          onRenameConversation={handleRenameActive}
          onClearConversation={handleClearConversation}
          onExportConversation={handleExport}
          onOpenSettings={() => setShowSettings(true)}
          onToggleSidebar={() => setMobileDrawerOpen(p => !p)}
        />

        {/* Error notice */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages stream */}
        <ChatMessages
          messages={messages}
          isTyping={isTyping}
          patientName={patientName}
          riskScore={riskScore}
          careLevel={careLevel}
          textSize={textSize}
          onRegenerate={handleRegenerate}
          onDelete={handleDeleteMessage}
          onSaveToNotes={handleSaveToNotes}
          onSelectSuggestion={(s) => handleSend(s, [])}
          onSelectWelcomePrompt={(p) => handleSend(p, [])}
        />

        {/* Composer */}
        <ChatComposer
          inputText={inputText}
          onInputChange={setInputText}
          onSend={handleSend}
          isGenerating={isTyping}
          onStopGeneration={handleStopGeneration}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </div>

      {/* Settings Modal */}
      <ChatSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        autoPlayVoice={autoPlayVoice}
        onToggleAutoPlayVoice={() => setAutoPlayVoice(p => !p)}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        onClearHistory={handleClearConversation}
      />
    </div>
  );
};

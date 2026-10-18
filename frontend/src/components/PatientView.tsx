import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Thermometer,
  ShieldAlert,
  Play,
  RotateCcw,
  Send,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  User,
  Zap,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Image as ImageIcon,
  Camera,
  Stethoscope,
  Lightbulb,
  Utensils,
  Forward,
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon,
  UserCheck,
  Trash2,
  Copy,
  Check,
  Bot,
  File,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Mic,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Patient, Device, RiskAssessment, TimelineEvent } from '../types';
import { api, getToken } from '../services/api';
import { VoiceInput, SpeakerButton, SupportedLanguage } from '../features/voice';
import { ImageUpload } from '../features/images/ImageUpload';
import { LiveCameraModal } from '../features/images/LiveCameraModal';
import { ReportUpload } from '../features/reports/ReportUpload';
import { PatientProfileModal } from './PatientProfileModal';
import { ChatSidebar, ConversationItem } from './chat/ChatSidebar';
import { ChatHeader } from './chat/ChatHeader';
import { ChatComposer } from './chat/ChatComposer';
import { ChatRiskCard, ChatSpecialistCard, ChatLabCard, ChatTelemetryCard, ChatEmergencyCard } from './chat/ChatHealthCards';
import { ChatSettingsModal } from './chat/ChatSettingsModal';
import { ChatPage } from './chat/ChatPage';
import { PatientHero } from './patient/PatientHero';
import { PatientRiskDeck } from './patient/PatientRiskDeck';


interface PatientViewProps {
  onTriggerEmergency?: () => void;
}

interface ChatFeedItem {
  id: string;
  sender?: 'patient' | 'gemini';
  text: string;
  time: string;
  concepts?: string[];
  attachments?: Array<{ name: string; type: string; url?: string }>;
}

export const PatientView: React.FC<PatientViewProps> = () => {
  const [profile, setProfile] = useState<Patient | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<RiskAssessment[]>([]);
  const [telemetryAssessmentHistory, setTelemetryAssessmentHistory] = useState<RiskAssessment[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [healthScore, setHealthScore] = useState<number>(95);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Simulator State
  const [scenario, setScenario] = useState<string>('RESPIRATORY_DRIFT');
  const [simStep, setSimStep] = useState<number>(0);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  // Jitter for visual telemetry
  const [jitter, setJitter] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setJitter(Math.random()), 1200);
    return () => clearInterval(int);
  }, []);

  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [activePatientTab, setActivePatientTab] = useState<'dashboard' | 'ai-chat'>('dashboard');


  // Symptom Wizard & Voice State
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [symptomText, setSymptomText] = useState('');
  const [lastSubmittedSymptomText, setLastSubmittedSymptomText] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [extractedConcepts, setExtractedConcepts] = useState<string[]>([]);
  const [followupQuestions, setFollowupQuestions] = useState<Array<{ id: string; question: string; reason: string }>>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardFinalized, setWizardFinalized] = useState(false);

  // Attached Multi-Media State (Up to 5 photos/videos)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedPreviews, setAttachedPreviews] = useState<Array<{ id: string; file: File; url: string }>>([]);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [showLiveCamera, setShowLiveCamera] = useState<boolean>(false);
  const [imageAnalysisResults, setImageAnalysisResults] = useState<any[]>([]);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Gemini AI State
  const [aiStatus, setAiStatus] = useState<{ enabled: boolean; provider: string; configured: boolean; reachable: boolean; model?: string } | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{ explanation: string; suggested_specialty: string; source: string } | null>(null);
  const [patientInsight, setPatientInsight] = useState<{
    explanation: string;
    possible_patterns: string[];
    specialist: { specialty: string; reason: string };
    self_care: Array<{ title: string; description: string }>;
    food_guidance: {
      recommended: Array<{ title: string; reason: string }>;
      limit: Array<{ title: string; reason: string }>;
    };
    source: string;
  } | null>(null);

  // Dated Health Notes Journal State
  const [healthNotes, setHealthNotes] = useState<any[]>([]);
  const [topNoteText, setTopNoteText] = useState('');
  const [savingTopNote, setSavingTopNote] = useState(false);

  const fetchData = async () => {
    try {
      const p = await api.getMyPatientProfile().catch(() => null);
      if (p) {
        setProfile(p);
        const aHistory = await api.getAssessmentHistory(p.id).catch(() => []);
        setAssessmentHistory(aHistory);
        if (aHistory.length > 0) {
          setAssessment(aHistory[0]);
        }
        const t = await api.getPatientTimeline(p.id).catch(() => ({ events: [] }));
        setTimeline(t.events || []);
      }

      const devList = await api.getDevices().catch(() => []);
      setDevices(devList);
      if (devList.length > 0) {
        const rList = await api.getDeviceReadings(devList[0].id).catch(() => []);
        setReadings(rList.reverse());
      }

      const notesList = await api.getHealthNotes().catch(() => []);
      setHealthNotes(notesList);
    } catch {
      // not logged in or error
    } finally {
      setLoading(false);
    }
  };

  const handleTopAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topNoteText.trim()) return;
    setSavingTopNote(true);
    try {
      const created = await api.createHealthNote(topNoteText.trim());
      setHealthNotes((prev) => [created, ...prev]);
      setTopNoteText('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save health note');
    } finally {
      setSavingTopNote(false);
    }
  };

  useEffect(() => {
    fetchData();
    api.getAIStatus().then(setAiStatus).catch(() => {});
  }, []);

  useEffect(() => {
    if (assessment) {
      const factors = (assessment.top_factors || []).map((f: any) => typeof f === 'string' ? f : f.factor_name || f.name || String(f));
      setWizardFinalized(true);

      api.explainAssessmentAI({
        risk_score: assessment.risk_score,
        confidence_score: assessment.confidence_score,
        care_level: assessment.care_level,
        top_factors: factors.length > 0 ? factors : ['Vitals telemetry deviation'],
        language: selectedLanguage,
      })
      .then(setAiExplanation)
      .catch(() => {});

      api.getPatientInsight({
        risk_score: assessment.risk_score,
        confidence_score: assessment.confidence_score,
        care_level: assessment.care_level,
        top_factors: factors.length > 0 ? factors : ['Vitals telemetry deviation'],
        symptom_text: assessment.suggested_action || '',
        concepts: [],
        followup_answers: [],
        language: selectedLanguage,
        patient_profile: profile ? `${profile.full_name}, Age: ${profile.age || 'N/A'}, Known: ${profile.known_conditions || 'None'}` : undefined,
        health_notes: healthNotes.slice(0, 3).map((n) => n.note_text),
      })
      .then(setPatientInsight)
      .catch(() => {});
    }
  }, [assessment?.id, selectedLanguage]);

  // Simulator Auto-play loop
  useEffect(() => {
    let timer: any = null;
    if (autoPlay) {
      timer = setInterval(async () => {
        try {
          await handleStepSim();
        } catch {
          setAutoPlay(false);
        }
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [autoPlay, simStep]);

  const handleStartSim = async (selectedScenario: string) => {
    try {
      setScenario(selectedScenario);
      const res = await api.startSimulator(selectedScenario, devices[0]?.id);
      setSimStep(res.step);
      setSimRunning(true);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to start simulator scenario.');
    }
  };

  const handleStepSim = async () => {
    try {
      const res = await api.stepSimulator();
      setSimStep(res.step + 1);
      setSimRunning(true);
      fetchData();

      if (profile) {
        const devAssessment = await api.runAssessment(profile.id).catch(() => null);
        if (devAssessment) {
          setTelemetryAssessmentHistory((prev) => [devAssessment, ...prev]);
        }
      }
    } catch (err: any) {
      setAutoPlay(false);
    }
  };

  const handleResetSim = async () => {
    try {
      setAutoPlay(false);
      const res = await api.resetSimulator();
      setSimStep(res.step);
      fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to reset simulator.');
    }
  };

  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [likedMsgs, setLikedMsgs] = useState<Record<string, boolean>>({});
  const [dislikedMsgs, setDislikedMsgs] = useState<Record<string, boolean>>({});
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const toggleLikeMsg = (id: string) => {
    setLikedMsgs((prev) => ({ ...prev, [id]: !prev[id] }));
    setDislikedMsgs((prev) => ({ ...prev, [id]: false }));
  };

  const toggleDislikeMsg = (id: string) => {
    setDislikedMsgs((prev) => ({ ...prev, [id]: !prev[id] }));
    setLikedMsgs((prev) => ({ ...prev, [id]: false }));
  };

  const handleSpeakMsg = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyChatMessage = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }).catch(() => {});
  };

  const handleDeleteChatMessage = (idToDelete: string) => {
    setSubmittedFeed((prev) => prev.filter((item) => item.id !== idToDelete));
  };

  const handleClearChatHistory = () => {
    setSubmittedFeed([DEFAULT_1ST_WELCOME_MESSAGE]);
  };

  // Full Conversation History & Settings State
  const [conversations, setConversations] = useState<ConversationItem[]>([
    { id: 'conv_default', title: 'Health Assessment & Guidance', is_pinned: true, updated_at: new Date().toISOString() }
  ]);
  const [activeConvId, setActiveConvId] = useState<string>('conv_default');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<'compact' | 'comfortable' | 'large'>('comfortable');

  // Consultation workflow states
  const [myConsultations, setMyConsultations] = useState<any[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<any | null>(null);
  const [submittingConsultation, setSubmittingConsultation] = useState<boolean>(false);

  const fetchConsultations = async () => {
    try {
      const res = await api.getMyDoctorConsultations();
      setMyConsultations(res || []);
      const active = res?.find((c: any) => c.status === 'WAITING' || c.status === 'IN_REVIEW');
      setActiveConsultation(active || null);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    }
  };

  const handleRequestConsultation = async (specialty: string, summary: string) => {
    try {
      setSubmittingConsultation(true);
      const res = await api.requestDoctorConsultation(specialty, summary);
      if (res) {
        alert(`Consultation requested successfully! Assigned Queue Token: ${res.token_number}`);
        fetchConsultations();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to request consultation.');
    } finally {
      setSubmittingConsultation(false);
    }
  };

  const handleCancelConsultation = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this consultation request?')) return;
    try {
      await api.cancelDoctorConsultation(requestId);
      alert('Consultation request cancelled.');
      fetchConsultations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel consultation.');
    }
  };

  // Patient active emergency state
  const [activeEmergency, setActiveEmergency] = useState<any | null>(null);
  const [triggeringSOS, setTriggeringSOS] = useState<boolean>(false);

  const fetchActiveEmergency = async () => {
    try {
      const res = await api.getPatientActiveEmergency();
      setActiveEmergency(res || null);
    } catch {
      // ignore
    }
  };

  const handleTriggerSOS = () => {
    if (!window.confirm('Are you sure you want to request immediate emergency assistance? This will alert emergency responders.')) return;
    setTriggeringSOS(true);
    
    const sendSOS = async (lat: number | null, lng: number | null, acc: number | null, source: string, consent: boolean) => {
      try {
        const res = await api.triggerPatientSOS(lat, lng, acc, source, consent);
        setActiveEmergency(res);
        alert(`Emergency requested successfully! Case ID: ${res.id.slice(0, 8)}. Responders have been notified.`);
      } catch (err: any) {
        alert(err.message || 'Failed to trigger emergency assistance request.');
      } finally {
        setTriggeringSOS(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          sendSOS(lat, lng, accuracy, 'BROWSER_DEVICE_GEOLOCATION', true);
        },
        (err) => {
          alert('Location permission was not granted or was unavailable. You can still request emergency assistance, but precise device location is unavailable.');
          sendSOS(null, null, null, 'UNAVAILABLE', false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by your browser. Requesting emergency assistance with location marked as unavailable.');
      sendSOS(null, null, null, 'UNAVAILABLE', false);
    }
  };

  // Load conversations, consultations, and active emergency on mount
  useEffect(() => {
    fetchConsultations();
    fetchActiveEmergency();
    const interval = setInterval(() => {
      if (getToken()) {
        fetchConsultations();
        fetchActiveEmergency();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {

    api.getConversations().then((res) => {
      if (res && res.length > 0) {
        setConversations(res);
        setActiveConvId(res[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleCreateNewChat = async () => {
    try {
      const created = await api.createConversation('New Health Chat').catch(() => null);
      const newConv: ConversationItem = created
        ? { id: created.id, title: created.title, is_pinned: false, updated_at: new Date().toISOString() }
        : { id: `conv_${Date.now()}`, title: 'New Health Chat', is_pinned: false, updated_at: new Date().toISOString() };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setSubmittedFeed([DEFAULT_1ST_WELCOME_MESSAGE]);
    } catch {
      const newConv = { id: `conv_${Date.now()}`, title: 'New Health Chat', is_pinned: false, updated_at: new Date().toISOString() };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setSubmittedFeed([DEFAULT_1ST_WELCOME_MESSAGE]);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
    await api.updateConversation(id, { title: newTitle }).catch(() => {});
  };

  const handleDeleteConversation = async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    await api.deleteConversation(id).catch(() => {});
    if (activeConvId === id) {
      handleCreateNewChat();
    }
  };

  const handleTogglePin = async (id: string) => {
    const target = conversations.find((c) => c.id === id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_pinned: !c.is_pinned } : c))
    );
    if (target) {
      await api.updateConversation(id, { is_pinned: !target.is_pinned }).catch(() => {});
    }
  };

  const handleExportConversation = () => {
    const text = submittedFeed.map((f) => `[${f.time}] ${f.sender === 'patient' ? 'Patient' : 'Fame Health Assistant'}: ${f.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FAME_Health_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  const addSingleAttachedFile = (file: File, customUrl?: string) => {
    setAttachedFiles((prev) => {
      if (prev.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) {
        return prev;
      }
      if (prev.length >= 5) {
        setErrorMessage('Maximum 5 media files (photos/videos) can be attached at a time.');
        return prev;
      }
      return [...prev, file];
    });

    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    if (customUrl) {
      setAttachedPreviews((prev) => {
        if (prev.some((p) => p.file.name === file.name && p.file.size === file.size && p.file.lastModified === file.lastModified)) {
          return prev;
        }
        return [...prev, { id, file, url: customUrl }];
      });
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const resUrl = reader.result as string;
          setAttachedPreviews((prev) => {
            if (prev.some((p) => p.file.name === file.name && p.file.size === file.size && p.file.lastModified === file.lastModified)) {
              return prev;
            }
            return [...prev, { id, file, url: resUrl }];
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (attachedFiles.length + files.length > 5) {
      setErrorMessage(`Maximum 5 media files allowed. You can attach up to ${5 - attachedFiles.length} more file(s).`);
      e.target.value = '';
      return;
    }

    const validTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/webm', 'video/mp4', 'video/quicktime', 'video/ogg', 'video/mkv',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    for (const file of files) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage(`File ${file.name} exceeds 25 MB limit.`);
        continue;
      }
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isPdfOrDoc = 
        file.type === 'application/pdf' ||
        file.type.startsWith('text/') ||
        file.type.includes('word') ||
        file.type.includes('document') ||
        file.name.match(/\.(pdf|txt|doc|docx|csv)$/i) !== null;

      if (!isImage && !isVideo && !isPdfOrDoc && !validTypes.includes(file.type.toLowerCase())) {
        setErrorMessage(`Invalid file type for ${file.name}. Please upload photos, videos, or PDF/document medical reports.`);
        continue;
      }
      addSingleAttachedFile(file);
    }
    e.target.value = '';
  };

  const handleRemoveSingleAttachedFile = (id: string) => {
    setAttachedPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        setAttachedFiles((files) => files.filter((f) => f !== target.file));
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleRemoveAllAttachedFiles = () => {
    setAttachedFiles([]);
    setAttachedPreviews([]);
    setImageAnalysisResults([]);
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const DEFAULT_1ST_WELCOME_MESSAGE: ChatFeedItem = {
    id: 'welcome_1st_message',
    sender: 'gemini',
    text: `Hello! I am Fame Genix Health Care Assistant. How are you feeling today?\n\nPlease feel free to describe any symptoms you have, ask health questions (such as sleep tips, diet advice, or exercise guidance), attach photos of affected body parts, or upload lab report documents for an instant medical AI evaluation.`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [submittedFeed, setSubmittedFeed] = useState<ChatFeedItem[]>([DEFAULT_1ST_WELCOME_MESSAGE]);

  const handleChatOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardLoading) return;

    const inputToProcess = symptomText.trim();
    if (!inputToProcess && attachedFiles.length === 0) return;

    setWizardLoading(true);
    setErrorMessage(null);

    const attachmentsForMsg = attachedPreviews.map((p) => ({
      name: p.file.name,
      type: p.file.type,
      url: p.url,
    }));

    const patMsgId = `${Date.now()}_pat`;
    const patientMessage: ChatFeedItem = {
      id: patMsgId,
      sender: 'patient',
      text: inputToProcess || (attachmentsForMsg.length > 0 ? `[Attached ${attachmentsForMsg.length} file(s) for AI analysis]` : ''),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachmentsForMsg,
    };

    setSubmittedFeed((prev) => [...prev, patientMessage]);
    setSymptomText('');

    handleRemoveAllAttachedFiles();

    try {
      const chatHistoryForApi = submittedFeed.map((f) => ({
        role: f.sender === 'patient' || !f.sender ? 'user' : 'model',
        text: f.text,
      }));

      const liveAiChat = await api.chatAI({
        message: inputToProcess || 'Hello',
        history: chatHistoryForApi,
        care_level: assessment?.care_level || 'STABLE',
        patient_profile: profile ? `${profile.full_name}, Age: ${profile.age || 'N/A'}, Known: ${profile.known_conditions || 'None'}` : undefined,
        health_notes: healthNotes.slice(0, 3).map((n) => n.note_text),
        language: selectedLanguage === 'te' ? 'Telugu' : selectedLanguage === 'hi' ? 'Hindi' : 'English',
      }).catch(() => null);

      let geminiReplyText = '';
      if (liveAiChat?.message) {
        geminiReplyText = liveAiChat.message;
      }

      if (!geminiReplyText || geminiReplyText.includes("AI service is temporarily unavailable")) {
        geminiReplyText = "AI service is temporarily unavailable. Your health assessment tools are still available, but I cannot generate a personalized AI response right now.";
      }

      const geminiMessage: ChatFeedItem = {
        id: `${Date.now()}_gemini`,
        sender: 'gemini',
        text: geminiReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSubmittedFeed((prev) => [...prev, geminiMessage]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to AI service.');
      const errorMsg: ChatFeedItem = {
        id: `${Date.now()}_gemini_err`,
        sender: 'gemini',
        text: "AI service is temporarily unavailable. Your health assessment tools are still available, but I cannot generate a personalized AI response right now.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSubmittedFeed((prev) => [...prev, errorMsg]);
    } finally {
      setWizardLoading(false);
    }
  };

  const handleAnalyzeHealth = async () => {
    if (wizardLoading) return;

    const inputToProcess = symptomText.trim();
    if (!inputToProcess && attachedFiles.length === 0 && submittedFeed.length <= 1) {
      alert("Please describe your symptoms or attach documents first in the input area.");
      return;
    }

    setWizardLoading(true);
    setWizardFinalized(false);
    setErrorMessage(null);

    if (inputToProcess) {
      const patMsgId = `${Date.now()}_pat`;
      const patientMessage: ChatFeedItem = {
        id: patMsgId,
        sender: 'patient',
        text: inputToProcess,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSubmittedFeed((prev) => [...prev, patientMessage]);
      setSymptomText('');
    }

    const currentAttachedFiles = [...attachedFiles];
    handleRemoveAllAttachedFiles();

    try {
      const pdfFiles = currentAttachedFiles.filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      let pdfObservationsText = '';

      for (const pdfFile of pdfFiles) {
        const repRes = await api.analyzeMedicalReport(pdfFile, selectedLanguage).catch(() => null);
        if (repRes) {
          if (repRes.tests && repRes.tests.length > 0) {
            const testNames = repRes.tests.map((t: any) => `${t.name}: ${t.raw_value || t.value} (${t.status})`).join(', ');
            pdfObservationsText += ` Medical Report Parameters: ${testNames}.`;
          }
        }
      }

      const mediaFiles = currentAttachedFiles.filter((f) => !f.name.endsWith('.pdf') && f.type !== 'application/pdf');
      let imageObservationsText = '';
      const validImgResults: any[] = [];

      if (mediaFiles.length > 0) {
        const imageTasks = mediaFiles.map((file) =>
          api.analyzeHealthImage(file, inputToProcess, selectedLanguage).catch(() => null)
        );
        const imgResList = await Promise.all(imageTasks);
        imgResList.forEach((res) => {
          if (res) {
            validImgResults.push(res);
            const findingsStr = (res.visual_findings || [])
              .map((vf: any) => typeof vf === 'string' ? vf : vf.finding || vf.name || '')
              .join(' ');
            if (findingsStr) {
              imageObservationsText += ` ${findingsStr}`;
            }
          }
        });
      }

      if (validImgResults.length > 0) {
        setImageAnalysisResults(validImgResults);
      }

      let combinedText = inputToProcess;
      if (pdfObservationsText) {
        combinedText = combinedText ? `${combinedText}.${pdfObservationsText}` : pdfObservationsText.trim();
      }
      if (imageObservationsText.trim()) {
        combinedText = combinedText ? `${combinedText}. Visual observations: ${imageObservationsText}` : `Visual image observation: ${imageObservationsText}`;
      }
      
      if (!combinedText) {
        const patientMessages = submittedFeed.filter(m => m.sender === 'patient' || !m.sender).map(m => m.text).join(' ');
        combinedText = patientMessages || 'Visual photo/document observation attached for health evaluation.';
      }

      setLastSubmittedSymptomText(combinedText);

      const res = await api.startSymptomSession(combinedText, selectedLanguage);
      if (res && res.session_id) {
        setActiveSessionId(res.session_id);
        setExtractedConcepts(res.extracted_concepts || []);
        
        await api.finalizeSymptomSession(res.session_id);
        const newAssessment = await api.runAssessment(undefined, res.session_id);
        setAssessment(newAssessment);
        setWizardFinalized(true);

        const topFactorsStrings = (newAssessment.top_factors || []).map((f: any) =>
          typeof f === 'string' ? f : f.factor_name || f.name || String(f)
        );

        const [aiExp, insight] = await Promise.all([
          api.explainAssessmentAI({
            risk_score: newAssessment.risk_score,
            confidence_score: newAssessment.confidence_score,
            care_level: newAssessment.care_level,
            top_factors: topFactorsStrings,
            language: selectedLanguage,
          }).catch(() => null),
          api.getPatientInsight({
            risk_score: newAssessment.risk_score,
            confidence_score: newAssessment.confidence_score,
            care_level: newAssessment.care_level,
            top_factors: topFactorsStrings,
            symptom_text: combinedText,
            concepts: res.extracted_concepts || [],
            followup_answers: [],
            language: selectedLanguage,
            patient_profile: profile ? `${profile.full_name}, Age: ${profile.age || 'N/A'}, Known: ${profile.known_conditions || 'None'}` : undefined,
            health_notes: healthNotes.slice(0, 3).map((n) => n.note_text),
          }).catch(() => null),
        ]);

        if (aiExp) setAiExplanation(aiExp);
        if (insight) setPatientInsight(insight);

        const confirmationMsg: ChatFeedItem = {
          id: `${Date.now()}_gemini`,
          sender: 'gemini',
          text: `Your clinical health analysis has been compiled successfully. Assessment ID: \`${newAssessment.id}\`. Please review the updated clinical results panel below.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setSubmittedFeed((prev) => [...prev, confirmationMsg]);

        setTimeout(() => {
          const assessmentEl = document.getElementById('multi-factor-assessment-section');
          if (assessmentEl) {
            assessmentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to analyze health symptoms.');
    } finally {
      setWizardLoading(false);
    }
  };

  const handleAnswerQuestion = async (qId: string, answerText: string) => {
    if (!activeSessionId) return;
    setAnswers((prev) => ({ ...prev, [qId]: answerText }));
    try {
      await api.answerFollowup(activeSessionId, qId, answerText);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleFinalizeSymptomSession = async () => {
    if (!activeSessionId) return;
    setWizardLoading(true);
    setErrorMessage(null);
    try {
      // Submit any pending answers before finalizing
      for (const [qId, ans] of Object.entries(answers)) {
        if (ans && typeof ans === 'string' && ans.trim()) {
          await api.answerFollowup(activeSessionId, qId, ans.trim()).catch(() => {});
        }
      }

      await api.finalizeSymptomSession(activeSessionId);
      const newAssessment = await api.runAssessment(undefined, activeSessionId);
      setAssessment(newAssessment);
      setWizardFinalized(true);

      try {
        const topFactorsStrings = (newAssessment.top_factors || []).map((f: any) =>
          typeof f === 'string' ? f : f.factor_name || f.name || String(f)
        );
        const [aiExp, insight] = await Promise.all([
          api.explainAssessmentAI({
            risk_score: newAssessment.risk_score,
            confidence_score: newAssessment.confidence_score,
            care_level: newAssessment.care_level,
            top_factors: topFactorsStrings,
            language: selectedLanguage,
          }).catch(() => null),
          api.getPatientInsight({
            risk_score: newAssessment.risk_score,
            confidence_score: newAssessment.confidence_score,
            care_level: newAssessment.care_level,
            top_factors: topFactorsStrings,
            symptom_text: lastSubmittedSymptomText || symptomText,
            concepts: extractedConcepts,
            followup_answers: Object.values(answers).filter((a) => typeof a === 'string' && a.trim() !== '') as string[],
            language: selectedLanguage,
            patient_profile: profile ? `${profile.full_name}, Age: ${profile.age || 'N/A'}, Known: ${profile.known_conditions || 'None'}` : undefined,
            health_notes: healthNotes.slice(0, 3).map((n) => n.note_text),
          }).catch(() => null),
        ]);
        if (aiExp) setAiExplanation(aiExp);
        if (insight) setPatientInsight(insight);
      } catch {
        // ignore fallback
      }

      // Step 2: Smooth scroll down to Multi-Factor Risk Assessment section!
      setTimeout(() => {
        const assessmentEl = document.getElementById('multi-factor-assessment-section');
        if (assessmentEl) {
          assessmentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to complete symptom assessment. Please try again.');
    } finally {
      setWizardLoading(false);
    }
  };

  const handleLabReportAnalyzed = async (labResult: any) => {
    if (!labResult) return;
    try {
      setWizardLoading(true);
      setWizardFinalized(false);
      setErrorMessage(null);

      const abnormalTests = (labResult.tests || []).filter((t: any) => t.status === 'HIGH' || t.status === 'LOW' || t.status === 'CRITICAL_REPORTED');
      const testSummary = abnormalTests.map((t: any) => `${t.name} ${t.raw_value || t.value} (${t.status})`).join(', ');
      const labText = `Medical Report Analysis (${labResult.report_type || 'LAB_REPORT'}): ${labResult.explanation || ''}. ${testSummary ? `Abnormal findings: ${testSummary}` : 'All tested parameters within reference ranges.'}`;

      setLastSubmittedSymptomText(labText);

      const sessionRes = await api.startSymptomSession(labText, selectedLanguage);
      if (sessionRes) {
        setActiveSessionId(sessionRes.session_id);
        setExtractedConcepts(sessionRes.extracted_concepts);
        setFollowupQuestions(sessionRes.followup_questions);

        await api.finalizeSymptomSession(sessionRes.session_id);
        const newAssessment = await api.runAssessment(undefined, sessionRes.session_id);
        setAssessment(newAssessment);
        setWizardFinalized(true);

        const topFactorsStrings = (newAssessment.top_factors || []).map((f: any) =>
          typeof f === 'string' ? f : f.factor_name || f.name || String(f)
        );

        const insight = await api.getPatientInsight({
          risk_score: newAssessment.risk_score,
          confidence_score: newAssessment.confidence_score,
          care_level: newAssessment.care_level,
          top_factors: topFactorsStrings,
          symptom_text: labText,
          concepts: sessionRes.extracted_concepts,
          followup_answers: [],
          language: selectedLanguage,
          patient_profile: profile ? `${profile.full_name}, Age: ${profile.age || 'N/A'}, Known: ${profile.known_conditions || 'None'}` : undefined,
          health_notes: healthNotes.slice(0, 3).map((n) => n.note_text),
          lab_summary: labText,
        }).catch(() => null);

        if (insight) {
          setPatientInsight(insight);
        }

        setTimeout(() => {
          const assessmentEl = document.getElementById('multi-factor-assessment-section');
          if (assessmentEl) {
            assessmentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      }
    } catch (err: any) {
      console.error('Failed to trigger health assessment from lab report:', err);
    } finally {
      setWizardLoading(false);
    }
  };

  const handleResetHealthAnalysis = () => {
    setSymptomText('');
    setActiveSessionId(null);
    setExtractedConcepts([]);
    setFollowupQuestions([]);
    setAnswers({});
    setWizardFinalized(false);
    setWizardLoading(false);
    setErrorMessage(null);
    handleRemoveAllAttachedFiles();
  };

  // Helper for latest vital values
  const getLatestReading = (metric: string) => {
    const r = readings.filter((x) => x.metric === metric).slice(-1)[0];
    return r ? r.value : null;
  };

  // Base values
  const baseHr = getLatestReading('heart_rate') || 72;
  const baseSpo2 = getLatestReading('spo2') || 98;
  const baseRr = getLatestReading('respiratory_rate') || 16;
  const baseTemp = getLatestReading('temperature') || 36.7;
  const baseVoc = getLatestReading('voc_index') || 0.2;

  // Jittered display values
  const hr = Math.round(baseHr + (jitter > 0 ? (Math.random() * 4 - 2) : 0));
  const spo2 = Math.min(100, Math.round(baseSpo2 + (jitter > 0 ? (Math.random() * 2 - 1) : 0)));
  const rr = Math.round(baseRr + (jitter > 0 ? (Math.random() * 2 - 1) : 0));
  const temp = Number((baseTemp + (jitter > 0 ? (Math.random() * 0.4 - 0.2) : 0)).toFixed(1));
  const voc = Number(Math.max(0, baseVoc + (jitter > 0 ? (Math.random() * 0.04 - 0.02) : 0)).toFixed(2));


  // Chronologically sort readings
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  // Group by timestamp with metric propagation
  const groupedData: Record<string, any> = {};
  let lastHR = hr, lastSpO2 = spo2, lastRR = rr, lastTemp = temp, lastVOC = voc;

  sortedReadings.forEach((r) => {
    const d = new Date(r.recorded_at);
    const timeKey = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (!groupedData[timeKey]) {
      groupedData[timeKey] = {
        time: timeKey,
        heart_rate: lastHR,
        spo2: lastSpO2,
        respiratory_rate: lastRR,
        temperature: lastTemp,
        voc_index: lastVOC,
      };
    }
    groupedData[timeKey][r.metric] = r.value;
    if (r.metric === 'heart_rate') lastHR = r.value;
    if (r.metric === 'spo2') lastSpO2 = r.value;
    if (r.metric === 'respiratory_rate') lastRR = r.value;
    if (r.metric === 'temperature') lastTemp = r.value;
    if (r.metric === 'voc_index') lastVOC = r.value;
  });

  let chartData = Object.values(groupedData);

  // Fallback: If empty or sparse, generate smooth continuous baseline telemetry wave
  if (chartData.length < 5) {
    const now = new Date();
    const fallbackPoints = [];
    for (let i = 9; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 4000);
      const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const varHR = Math.round(Math.sin(i * 0.8) * 3);
      const varSpO2 = Math.round(Math.cos(i * 0.8) * 1);
      fallbackPoints.push({
        time: timeStr,
        heart_rate: Math.max(50, Math.min(160, (lastHR || 72) + varHR)),
        spo2: Math.max(85, Math.min(100, (lastSpO2 || 98) + varSpO2)),
        respiratory_rate: Math.max(10, Math.min(35, (lastRR || 16) + Math.round(varHR / 2))),
        temperature: lastTemp || 36.7,
        voc_index: lastVOC || 0.2,
      });
    }
    chartData = fallbackPoints;
  }

  const getCareBadgeColor = (level?: string) => {
    switch (level) {
      case 'STABLE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MONITOR':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'ROUTINE_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'PRIORITY_REVIEW':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'POSSIBLE_EMERGENCY':
        return 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30 animate-bounce';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getRelatedDoctorSpecialty = (concepts: string[], text: string, aiSpecialty?: string) => {
    if (aiSpecialty && aiSpecialty !== 'General Medicine' && aiSpecialty !== 'General Physician / Internal Medicine') return aiSpecialty;
    const combined = (text + ' ' + concepts.join(' ')).toLowerCase().replace(/_/g, ' ');
    if (combined.includes('chest') || combined.includes('heart') || combined.includes('cardio') || combined.includes('palpitations') || combined.includes('angina') || combined.includes('attack')) {
      return 'Cardiologist (Heart & Vascular Specialist)';
    }
    if (combined.includes('cough') || combined.includes('breath') || combined.includes('asthma') || combined.includes('lung') || combined.includes('spo2') || combined.includes('respiratory')) {
      return 'Pulmonologist (Respiratory Specialist)';
    }
    if (combined.includes('headache') || combined.includes('dizzy') || combined.includes('numb') || combined.includes('seizure') || combined.includes('brain') || combined.includes('stroke')) {
      return 'Neurologist (Brain & Nerve Specialist)';
    }
    if (combined.includes('stomach') || combined.includes('vomit') || combined.includes('nausea') || combined.includes('abdomen') || combined.includes('gastric')) {
      return 'Gastroenterologist (Digestive Specialist)';
    }
    if (combined.includes('skin') || combined.includes('rash') || combined.includes('itch') || combined.includes('derma')) {
      return 'Dermatologist (Skin Specialist)';
    }
    return 'General Physician / Internal Medicine';
  };

  const getImmediateHealthTips = (text: string, concepts: string[]) => {
    const combined = (text + ' ' + concepts.join(' ')).toLowerCase();
    const tips: Array<{ title: string; desc: string }> = [];

    if (combined.includes('fever') || combined.includes('temp') || combined.includes('warm') || combined.includes('hot')) {
      tips.push({
        title: 'Hydration & Thermal Balance',
        desc: 'Sip warm fluids, electrolytes, or herbal tea. Apply a lukewarm damp compress to your forehead to reduce thermal strain naturally.',
      });
      tips.push({
        title: 'Rest & Temperature Tracking',
        desc: 'Avoid physical exertion. Check your body temperature every 4 hours and keep your room well-ventilated.',
      });
    }

    if (combined.includes('cough') || combined.includes('throat') || combined.includes('breath') || combined.includes('asthma') || combined.includes('respiratory')) {
      tips.push({
        title: 'Warm Steam Inhalation & Gargling',
        desc: 'Inhale warm steam for 5–10 minutes and gargle with warm salt water twice daily to soothe bronchial irritation.',
      });
      tips.push({
        title: 'Elevated Posture While Resting',
        desc: 'Use extra pillows to keep your head elevated while resting to improve airway clearance and prevent nocturnal coughing spikes.',
      });
    }

    if (combined.includes('chest') || combined.includes('heart') || combined.includes('tightness')) {
      tips.push({
        title: 'Immediate Calm & Sitting Position',
        desc: 'Sit comfortably upright in a quiet area. Avoid sudden movements or heavy exertion.',
      });
      tips.push({
        title: 'Emergency Vigilance',
        desc: 'If chest tightness spreads to your arm/jaw or causes sweating, immediately trigger Emergency Ops in the platform top header.',
      });
    }

    if (combined.includes('headache') || combined.includes('dizzy') || combined.includes('migraine')) {
      tips.push({
        title: 'Dim Lighting & Cold Compress',
        desc: 'Rest in a quiet, dark room. Apply a cold compress to forehead/temples to relieve cranial vascular tension.',
      });
    }

    if (tips.length < 3) {
      tips.push({
        title: 'Optimal Hydration & Balanced Electrolytes',
        desc: 'Drink plenty of clean water, coconut water, or warm lemon water to maintain cellular hydration and flush toxins.',
      });
      tips.push({
        title: 'Continuous Vital Telemetry Monitoring',
        desc: 'Keep your smart mask connected or re-test vitals every 30 minutes to record baseline physiological stability.',
      });
      tips.push({
        title: 'Avoid Unprescribed Antibiotics',
        desc: 'Do not start unprescribed medications. Follow professional clinical recommendations.',
      });
    }

    return tips.slice(0, 4);
  };

  const getFoodRecommendations = (text: string, concepts: string[]) => {
    const combined = (text + ' ' + concepts.join(' ')).toLowerCase();

    let recommended: Array<{ name: string; desc: string }> = [];
    let avoid: Array<{ name: string; desc: string }> = [];

    if (combined.includes('fever') || combined.includes('temp') || combined.includes('hot')) {
      recommended.push({
        name: 'Warm Vegetable Broth & Clear Soups',
        desc: 'Easy to digest, rich in natural minerals, and restores fluids lost from thermal sweating.',
      });
      recommended.push({
        name: 'Fresh Coconut Water & ORS Fluids',
        desc: 'Replenishes vital sodium and potassium electrolytes to maintain cellular fluid balance.',
      });
      recommended.push({
        name: 'Soft Rice Porridge (Khichdi / Oats)',
        desc: 'Provides gentle complex carbohydrates without overloading the digestive system.',
      });
      avoid.push({
        name: 'Heavy Fried Foods & High-Fat Dairy',
        desc: 'Slows down gastric emptying and increases internal metabolic heat burden.',
      });
      avoid.push({
        name: 'Chilled Ice Creams & Cold Soft Drinks',
        desc: 'Can provoke sudden thermal throat shock and suppress immune response.',
      });
    } else if (combined.includes('cough') || combined.includes('throat') || combined.includes('breath') || combined.includes('asthma')) {
      recommended.push({
        name: 'Warm Ginger & Honey Herbal Tea',
        desc: 'Soothes throat mucus lining, relieves bronchial spasms, and clears phlegm.',
      });
      recommended.push({
        name: 'Turmeric Golden Milk & Steamed Greens',
        desc: 'Contains curcumin and antioxidants to reduce airway inflammation.',
      });
      recommended.push({
        name: 'Vitamin C Citrus Fruits (Oranges, Guava, Kiwi)',
        desc: 'Strengthens white blood cell immunity against bronchial and throat pathogens.',
      });
      avoid.push({
        name: 'Refrigerated Beverages & Cold Desserts',
        desc: 'Triggers acute airway bronchospasms and worsens mucus congestion.',
      });
      avoid.push({
        name: 'Processed Sugars & Oily Snacks',
        desc: 'Promotes systemic tissue inflammation and impairs respiratory clearance.',
      });
    } else if (combined.includes('stomach') || combined.includes('nausea') || combined.includes('vomit') || combined.includes('abdomen') || combined.includes('diarrhea')) {
      recommended.push({
        name: 'BRAT Diet (Bananas, Rice, Applesauce, Toast)',
        desc: 'Binds loose stools, provides gentle potassium, and calms irritated stomach lining.',
      });
      recommended.push({
        name: 'Probiotic Curd / Yogurt & Buttermilk',
        desc: 'Restores healthy gut microflora damaged by gastric upset or acidity.',
      });
      avoid.push({
        name: 'Spicy Chili Oils & Raw Garlic/Onions',
        desc: 'Severely irritates gastric mucosa and provokes painful acid reflux spikes.',
      });
      avoid.push({
        name: 'Caffeinated Coffee & Carbonated Drinks',
        desc: 'Dehydrates intestinal lining and aggravates abdominal cramping.',
      });
    } else if (combined.includes('heart') || combined.includes('chest') || combined.includes('bp') || combined.includes('palpitations')) {
      recommended.push({
        name: 'Leafy Spinach, Oats & Garlic Infusions',
        desc: 'Rich in magnesium and nitrates that relax blood vessels and stabilize blood pressure.',
      });
      recommended.push({
        name: 'Omega-3 Rich Seeds (Flax, Chia) & Walnuts',
        desc: 'Supports cardiac arterial elasticity and reduces vascular oxidative stress.',
      });
      avoid.push({
        name: 'High-Sodium Canned Foods & Salty Chips',
        desc: 'Causes fluid retention, increasing vascular resistance and cardiac workload.',
      });
      avoid.push({
        name: 'Energy Drinks & Heavy Concentrated Caffeine',
        desc: 'Triggers unwanted heart rate spikes and arterial constriction.',
      });
    } else {
      recommended.push({
        name: 'Fresh Seasonal Whole Fruits & Leafy Salads',
        desc: 'Delivers bio-available vitamins, essential minerals, and dietary fiber for recovery.',
      });
      recommended.push({
        name: 'Steamed Lentils (Dal), Quinoa & Whole Grains',
        desc: 'Provides steady glucose release to support tissue healing and immune vitality.',
      });
      recommended.push({
        name: 'Pure Hydration (2.5 to 3 Liters Daily)',
        desc: 'Essential for cellular hydration, detoxification, and physiological balance.',
      });
      avoid.push({
        name: 'Ultra-Processed Foods & Deep-Fried Snacks',
        desc: 'High in trans-fats and chemical additives that promote inflammatory stress.',
      });
      avoid.push({
        name: 'Excess Refined Sugar & Soda Drinks',
        desc: 'Spikes blood glucose rapidly and induces metabolic fatigue.',
      });
    }

    return { recommended, avoid };
  };

  const hasActiveDevice = autoPlay || simRunning || (devices.length > 0 && devices.some((d) => d.status === 'CONNECTED' && d.type !== 'SIMULATED' && d.type !== 'DEMO'));

  useEffect(() => {
    if (assessment?.risk_score !== undefined) {
      const score = Math.max(10, Math.min(100, Math.round(100 - assessment.risk_score)));
      setHealthScore(score);
    } else {
      let base = 95;
      if (hr > 100 || hr < 50) base -= 15;
      if (spo2 < 95) base -= (95 - spo2) * 5;
      if (rr > 20 || rr < 12) base -= 10;
      if (temp > 38.0 || temp < 35.5) base -= 10;
      setHealthScore(Math.max(10, Math.min(100, base)));
    }
  }, [assessment, hr, spo2, rr, temp]);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 overflow-hidden text-slate-200 font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,10,30,1)_0%,rgba(0,2,10,1)_100%)]" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px]" />
      </div>
      <div className="relative z-10 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Inline App Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── HEALTH DASHBOARD (Single Authoritative View) ─── */}
      <div className="space-y-6">


      <PatientHero 
          profile={profile} 
          healthScore={healthScore} 
          assessment={assessment} 
          devices={devices} 
          autoPlay={autoPlay} 
          simRunning={simRunning} 
          onEditProfile={() => setShowProfileModal(true)} 
        />

      {/* ─── ACTIVE EMERGENCY SOS STATUS CARD ─── */}
      {activeEmergency && (() => {
        const getEmergencyStatusLabel = (status: string) => {
          switch (status) {
            case 'DETECTED':
              return 'Emergency Assistance Requested';
            case 'UNDER_REVIEW':
            case 'VERIFIED':
              return 'Verified by Operator';
            case 'DISPATCH_REQUESTED':
              return 'Ambulance Dispatch Requested';
            case 'DISPATCHED':
              return 'Ambulance Dispatched';
            case 'EN_ROUTE':
              return 'Ambulance En Route';
            case 'ON_SCENE':
            case 'PATIENT_REACHED':
              return 'Ambulance On Scene';
            case 'TRANSPORTING':
              return 'Transporting to Hospital';
            case 'HOSPITAL_REACHED':
              return 'Hospital Reached';
            case 'COMPLETED':
              return 'Emergency Case Completed';
            default:
              return status.replace(/_/g, ' ');
          }
        };

        return (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border border-rose-500/40 flex items-center justify-between gap-4 shadow-2xl animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 animate-bounce">
                <AlertTriangle className="w-6 h-6 text-rose-500 animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-rose-300 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                  <span>CRITICAL EMERGENCY ASSISTANCE ACTIVE</span>
                </div>
                <div className="text-base font-extrabold text-white mt-1">
                  Case ID: <span className="font-mono text-rose-350">{activeEmergency.id.slice(0, 8)}</span>
                </div>
                <div className="text-xs text-slate-350 mt-1">
                  Status: <span className="font-bold text-white uppercase">{getEmergencyStatusLabel(activeEmergency.status)}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Location sharing: <span className="font-mono text-cyan-300">{activeEmergency.location?.source || 'UNAVAILABLE'}</span>
                  {activeEmergency.location?.lat && ` (Lat: ${activeEmergency.location.lat.toFixed(4)}, Lng: ${activeEmergency.location.lng.toFixed(4)})`}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] font-extrabold px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-700/60 text-rose-350 tracking-wide uppercase">
                Responders Alerted
              </span>
            </div>
          </div>
        );
      })()}

      {/* ─── ACTIVE DOCTOR CONSULTATION STATUS BANNERS & HISTORY ─── */}
      {activeConsultation && (
        <div className="grid grid-cols-1 gap-4">
          {/* Active Consultation Status */}
          <div className="w-full p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/40 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Stethoscope className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Active Clinical Consultation Status
                </div>
                <div className="text-base font-extrabold text-white mt-1">
                  Token: <span className="text-cyan-300 font-mono text-lg">{activeConsultation.token_number}</span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Specialty: <span className="font-semibold text-white">{activeConsultation.specialty}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Requested at: {new Date(activeConsultation.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border tracking-wide uppercase ${
                activeConsultation.status === 'WAITING'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}>
                {activeConsultation.status === 'WAITING' ? 'Waiting in Queue' : 'In Review by Clinician'}
              </span>
              
              {activeConsultation.status === 'WAITING' && (
                <button
                  onClick={() => handleCancelConsultation(activeConsultation.id)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline font-semibold transition-all mt-1 cursor-pointer"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* 100% Authentic Google Gemini AI Chat Box Experience */}
      <div className="p-6 rounded-3xl bg-[#030b14]/80 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,180,255,0.1)] backdrop-blur-2xl space-y-5">
        
        {/* Gemini Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-purple-500 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-300">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Health Analysis Intelligence</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time AI health assistant for text messages, symptom analysis, photos/videos, and PDF medical report OCR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {submittedFeed.length > 0 && (
              <button
                type="button"
                onClick={handleClearChatHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 text-xs font-semibold transition-all shadow-sm"
                title="Start a new chat session"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>New Chat</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetHealthAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm"
              title="Reset inputs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Gemini Empty Welcome State (if no messages yet) */}
        {submittedFeed.length === 0 && (
          <div className="py-8 px-4 rounded-2xl bg-gradient-to-b from-slate-950/60 to-slate-900/40 border border-slate-800/80 text-center space-y-4 shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 mx-auto shadow-lg shadow-purple-600/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Hello! I am Fame Genix Health Care Assistant</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Describe symptoms, ask health questions, attach photos of physical observations, or upload PDF lab report documents for instant AI analysis.
              </p>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-xl mx-auto">
              {[
                { label: '🩺 Severe lower back pain', prompt: 'I have severe lower back pain that worsens when sitting.' },
                { label: '📷 Check photo observation', prompt: 'Analyzing photo observation attached.' },
                { label: '📄 Interpret lab blood report', prompt: 'Attached PDF blood lab report for OCR analysis.' },
                { label: '💊 Self-care guidance for headache', prompt: 'Suggest self-care guidance for sudden throbbing headache.' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSymptomText(chip.prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-cyan-300 hover:text-white border border-slate-800 hover:border-cyan-500/50 text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gemini Scrollable Chat Stream */}
        {submittedFeed.length > 0 && (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 pb-2 scrollbar-thin">
            {submittedFeed.map((item) => {
              const isPatient = item.sender === 'patient' || !item.sender;
              const isLiked = likedMsgs[item.id];
              const isDisliked = dislikedMsgs[item.id];
              const isSpeaking = speakingMsgId === item.id;

              return (
                <div key={item.id} className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'} space-y-1`}>
                  
                  {/* Avatar & Sender Label */}
                  <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 font-medium ${isPatient ? 'pr-1' : 'pl-1'}`}>
                    {isPatient ? (
                      <>
                        <span>You (Patient Input)</span>
                        <span className="font-mono text-slate-500">• {item.time}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white">
                          <Sparkles className="w-2.5 h-2.5" />
                        </div>
                        <span className="font-bold text-purple-300">Fame Genix Health Care Assistant</span>
                        <span className="font-mono text-slate-500">• {item.time}</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`p-4 rounded-3xl ${
                    isPatient
                      ? 'rounded-tr-none bg-gradient-to-r from-cyan-950/90 to-slate-900 border border-cyan-800/80 text-white max-w-xl shadow-lg'
                      : 'rounded-tl-none bg-slate-950/90 border border-slate-800 text-slate-100 max-w-2xl shadow-xl'
                  } text-xs space-y-3 transition-all`}>
                    
                    {/* Message Body */}
                    <p className="leading-relaxed whitespace-pre-line text-slate-100 text-xs sm:text-sm font-normal">
                      {item.text}
                    </p>

                    {/* Attached Photo/Video/PDF Media Grid inside Message Bubble */}
                    {item.attachments && item.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/60">
                        {item.attachments.map((att, aIdx) => (
                          <div key={aIdx} className="p-1.5 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md shadow-lg shadow-sm flex flex-col items-start gap-1">
                            {att.url && (att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) ? (
                              <img src={att.url} alt={att.name} className="w-32 h-32 object-cover rounded-lg border border-slate-700 shadow" />
                            ) : att.url && att.type?.startsWith('video/') ? (
                              <video src={att.url} controls className="w-36 h-28 object-cover rounded-lg border border-slate-700 shadow" />
                            ) : null}
                            <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-cyan-300 border border-cyan-800/80 text-[10px] font-mono flex items-center gap-1 max-w-[150px] truncate">
                              {att.type?.includes('pdf') || att.name?.endsWith('.pdf') ? <File className="w-3.5 h-3.5 text-purple-400" /> : <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />}
                              <span className="truncate">{att.name}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Action Toolbar (Delete & Copy for both Patient and Assistant) */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80 text-slate-400 text-[11px]">
                      {/* Copy Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyChatMessage(item.text, item.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all shadow-sm"
                        title="Copy text to clipboard"
                      >
                        {copiedMsgId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                        <span>{copiedMsgId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {!isPatient && (
                        <>
                          {/* Listen Voice Button */}
                          <button
                            type="button"
                            onClick={() => handleSpeakMsg(item.text, item.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all ${
                              isSpeaking ? 'bg-purple-950 text-purple-300 border-purple-800 animate-pulse' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                            }`}
                            title="Listen to AI response"
                          >
                            <Volume2 className="w-3 h-3 text-purple-400" />
                            <span>{isSpeaking ? 'Speaking...' : 'Listen'}</span>
                          </button>

                          {/* Thumbs Up Button */}
                          <button
                            type="button"
                            onClick={() => toggleLikeMsg(item.id)}
                            className={`p-1 px-2 rounded-lg border transition-all ${
                              isLiked ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                            }`}
                            title="Good response"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>

                          {/* Thumbs Down Button */}
                          <button
                            type="button"
                            onClick={() => toggleDislikeMsg(item.id)}
                            className={`p-1 px-2 rounded-lg border transition-all ${
                              isDisliked ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                            }`}
                            title="Poor response"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </>
                      )}

                      {/* Delete Message Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteChatMessage(item.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 transition-all ml-auto shadow-sm"
                        title="Delete this message"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>
        )}

        {/* Gemini Streaming Thinking State */}
        {wizardLoading && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 to-slate-950 border border-purple-500/50 text-purple-200 text-xs flex items-center justify-between shadow-xl animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span className="font-semibold text-purple-100">Fame Genix Health Care Assistant is analyzing text, media & documents...</span>
            </div>
            <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-900/80 border border-purple-700">
              Generating AI Response
            </span>
          </div>
        )}

        {/* Floating Gemini Chat Bar Box */}
        <form onSubmit={handleChatOnly} className="space-y-3">
          <div className={`p-3.5 bg-slate-950 border rounded-3xl space-y-2.5 transition-all shadow-2xl ${
            wizardLoading ? 'border-purple-500 ring-2 ring-purple-500/30 animate-pulse' : 'border-slate-800 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20'
          }`}>
            
            {/* Media Attachment Chips in Input Area */}
            {attachedPreviews.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-800/60">
                {attachedPreviews.map((p) => (
                  <div key={p.id} className="inline-flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-slate-900 border border-cyan-800/80 text-xs text-white shadow-sm">
                    {p.file.type.startsWith('video/') ? (
                      <video src={p.url} controls className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                    ) : p.file.type.includes('pdf') || p.file.name.endsWith('.pdf') ? (
                      <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300">
                        <File className="w-4 h-4" />
                      </div>
                    ) : (
                      <img src={p.url} alt="Attached" className="w-8 h-8 object-cover rounded-lg border border-slate-700" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-cyan-300 truncate max-w-[130px]">
                        {p.file.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {(p.file.size / 1024 / 1024).toFixed(2)} MB • {p.file.type.includes('pdf') || p.file.name.endsWith('.pdf') ? 'PDF Report' : p.file.type.startsWith('video/') ? 'Video' : 'Photo'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSingleAttachedFile(p.id)}
                      className="ml-1 p-1 rounded-md hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Textarea Input */}
            <textarea
              rows={3}
              value={symptomText}
              disabled={wizardLoading}
              onChange={(e) => setSymptomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChatOnly(e);
                }
              }}
              placeholder={wizardLoading ? 'Fame Genix Health Care Assistant is processing your input...' : 'Ask Fame Genix Health Care Assistant anything, describe symptoms, or attach photos/videos/PDF reports (Press Enter to submit)...'}
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none disabled:opacity-50 font-normal leading-relaxed"
            />

            {/* Gemini Input Control Toolbar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 relative">
                <button
                  type="button"
                  disabled={wizardLoading}
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-cyan-400 border border-slate-800 text-xs font-medium transition-all disabled:opacity-50"
                  title="Attach Photo, Video, or PDF Medical Report"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Attach Photo / Video / PDF</span>
                </button>

                {showAttachMenu && (
                  <div className="absolute left-0 bottom-full mb-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-30 overflow-hidden backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachMenu(false);
                        imageFileInputRef.current?.click();
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-850 flex items-center gap-2.5 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span>Upload Photo / Video / PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachMenu(false);
                        setShowLiveCamera(true);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-850 flex items-center gap-2.5 border-t border-slate-800 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Live Camera / Record</span>
                    </button>
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={imageFileInputRef}
                  onChange={handleImageFileSelected}
                  accept="image/*,video/*,.pdf,.txt,.doc,.docx"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleImageFileSelected}
                  accept="image/*,video/*"
                  capture="environment"
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 hidden md:inline">
                  Press Enter to chat
                </span>
                <button
                  type="button"
                  onClick={handleAnalyzeHealth}
                  disabled={wizardLoading || (!symptomText.trim() && attachedFiles.length === 0)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg transition-all ${
                    wizardLoading
                      ? 'bg-cyan-600/80 animate-pulse cursor-wait'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-cyan-600/30'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>ANALYZE HEALTH</span>
                </button>
                <button
                  type="submit"
                  disabled={wizardLoading || (!symptomText.trim() && attachedFiles.length === 0)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-lg transition-all ${
                    wizardLoading
                      ? 'bg-purple-600/80 animate-pulse cursor-wait'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-purple-600/30'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send (Chat)</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Medical Report & Lab OCR Module */}
      <ReportUpload language={selectedLanguage} onAnalysisResult={handleLabReportAnalyzed} />
      
      {/* Empty State before first assessment analysis */}
      {!wizardFinalized || !assessment ? (
        <div id="multi-factor-assessment-section" className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md shadow-lg text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Health Assessment Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Describe your symptoms in the Health Analysis Intelligence box, optionally attach medical reports, and click <strong className="text-cyan-300">ANALYZE HEALTH</strong> to view your Multi-Factor Health Risk overview, specialist suggestions, self-care guidance, and health analytics trends.
          </p>
        </div>
      ) : (
        /* Unified Real-Time AI Results Pipeline (Blocks 5 through 10) */
        <div id="multi-factor-assessment-section" className="space-y-6">
          {/* BLOCK 5 — Multi-Factor Risk Assessment Scorecard & Donut */}
          <PatientRiskDeck 
            assessment={assessment}
            activeEmergency={activeEmergency}
            triggeringSOS={triggeringSOS}
            onTriggerSOS={handleTriggerSOS}
          />

          {/* BLOCK 6 — AI Health Explanation & Possible Health Patterns */}
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Health Explanation & Clinical Overview</span>
              </div>
              {aiExplanation && (
                <SpeakerButton textToSpeak={aiExplanation.explanation} language={selectedLanguage} label="Listen Explanation" />
              )}
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
              {patientInsight?.explanation || aiExplanation?.explanation || 'Your health assessment has been computed successfully based on your reported symptoms and vitals context.'}
            </p>


          </div>

          {/* BLOCK 7 — Suggested Specialist Consultation */}
          {(() => {
            const activeFullText = [lastSubmittedSymptomText || symptomText, ...Object.values(answers)].filter(Boolean).join(' ');
            const recSpecialty = patientInsight?.specialist?.specialty || aiExplanation?.suggested_specialty || "General Physician / Internal Medicine";
            const specReason = patientInsight?.specialist?.reason || `Clinical review advised based on care level '${assessment.care_level}' and telemetry parameters.`;

            const careLevelUpper = assessment.care_level.toUpperCase();
            const isEmergency = careLevelUpper === 'URGENT' || careLevelUpper === 'POSSIBLE_EMERGENCY';
            const isStableOrMonitor = careLevelUpper === 'STABLE' || careLevelUpper === 'MONITOR';

            return (
              <div className={`p-4 rounded-xl border space-y-2 ${
                isEmergency ? 'bg-rose-950/20 border-rose-500/40' :
                isStableOrMonitor ? 'bg-slate-950 border-slate-800' :
                'bg-gradient-to-r from-slate-950 to-slate-900 border-cyan-500/40'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                      isEmergency ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      isStableOrMonitor ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    }`}>
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        isEmergency ? 'text-rose-400' :
                        isStableOrMonitor ? 'text-emerald-400' :
                        'text-cyan-400'
                      }`}>
                        Suggested Specialist Consultation
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {isStableOrMonitor ? (
                          <span className="text-emerald-400">✓ Doctor Consultation Not Currently Required (Self-Monitoring Appropriate)</span>
                        ) : isEmergency ? (
                          <span className="text-rose-400">⚠️ Emergency Care Recommended</span>
                        ) : (
                          <span>Suggested Specialty: <span className="text-cyan-300">{recSpecialty}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono flex-shrink-0 ${
                    isEmergency ? 'bg-rose-950 text-rose-300 border-rose-800' :
                    isStableOrMonitor ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                    'bg-cyan-950 text-cyan-300 border-cyan-800'
                  }`}>
                    {assessment.care_level} Triage
                  </span>
                </div>
                
                {!isStableOrMonitor && (
                  <p className="text-xs text-slate-300 leading-relaxed pl-12">
                    <strong className="text-slate-200">Clinical Reason:</strong> {specReason}
                  </p>
                )}

                <div className="pl-12 pt-2 pb-1">
                  {isStableOrMonitor ? (
                    <span className="text-xs text-slate-400">Please continue to monitor your health trends using the smart telemetry dashboard.</span>
                  ) : isEmergency ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs text-rose-400 font-bold">Please trigger the Emergency Assistance (SOS) alert immediately to request ambulance dispatch.</span>
                    </div>
                  ) : activeConsultation ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <span>✓ Active consultation requested: {activeConsultation.token_number}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({activeConsultation.status})</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={submittingConsultation}
                      onClick={() => handleRequestConsultation(recSpecialty, `Requested review based on care recommendation for ${recSpecialty}.`)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/10 transition-all cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>{submittingConsultation ? 'Requesting...' : 'Request Doctor Consultation'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* BLOCK 8 — Health Tips & Self-Care Guidance */}
          <div className="p-5 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                <span>Health Tips & Self-Care Guidance</span>
              </div>
              <span className="text-[10px] text-emerald-300 font-mono">
                {assessment.care_level in { URGENT: 1, POSSIBLE_EMERGENCY: 1 } ? 'Emergency Safety Focus' : 'Tailored Wellness Guidance'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {patientInsight?.self_care && patientInsight.self_care.length > 0 ? (
                patientInsight.self_care.map((tip, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/50 border border-cyan-900/40 backdrop-blur-md shadow-[0_0_30px_rgba(0,242,254,0.05)] space-y-1">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span>{tip.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed pl-3">{tip.description}</p>
                  </div>
                ))
              ) : (
                getImmediateHealthTips([lastSubmittedSymptomText || symptomText, ...Object.values(answers)].filter(Boolean).join(' '), extractedConcepts).map((tip, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/50 border border-cyan-900/40 backdrop-blur-md shadow-[0_0_30px_rgba(0,242,254,0.05)] space-y-1">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span>{tip.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed pl-3">{tip.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BLOCK 9 — Food & Hydration Guidance */}
          {(() => {
            const activeFullText = [lastSubmittedSymptomText || symptomText, ...Object.values(answers)].filter(Boolean).join(' ');
            const isUrgentCase = assessment.care_level in { URGENT: 1, POSSIBLE_EMERGENCY: 1 };
            const recList = patientInsight?.food_guidance?.recommended?.map((f) => ({ name: f.title, desc: f.reason }))
              || getFoodRecommendations(activeFullText, extractedConcepts).recommended;
            const limitList = patientInsight?.food_guidance?.limit?.map((f) => ({ name: f.title, desc: f.reason }))
              || getFoodRecommendations(activeFullText, extractedConcepts).avoid;

            return (
              <div className="p-5 rounded-xl bg-slate-950/90 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    <span>Food & Hydration Guidance</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                    {isUrgentCase ? 'Emergency Caution' : 'Tailored AI Nutrition'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recommended Foods Column */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Recommended Foods & Hydration:</span>
                    </div>
                    <div className="space-y-2">
                      {recList.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-emerald-900/40 space-y-0.5">
                          <div className="text-xs font-semibold text-emerald-200">{item.name}</div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Foods to Avoid Column */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 pb-1 border-b border-slate-800">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span>Foods & Drinks to Limit:</span>
                    </div>
                    <div className="space-y-2">
                      {limitList.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-rose-900/40 space-y-0.5">
                          <div className="text-xs font-semibold text-rose-200">{item.name}</div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

          {/* AI Visual Findings Cards */}
          {imageAnalysisResults.length > 0 && imageAnalysisResults.map((result, rIdx) => (
            <div key={rIdx} className="p-4 rounded-xl bg-slate-950/90 border border-cyan-800/40 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>AI Visual Observations #{rIdx + 1} ({result.source})</span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  Quality: {result.image_quality} • Area: {result.body_area}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {result.explanation}
              </p>
              {result.visual_findings && result.visual_findings.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Observed Visual Features:</div>
                  {result.visual_findings.map((f: any, idx: number) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>
                        <strong className="text-white">{f.finding}</strong> ({f.severity || 'mild'}, {f.location || 'localized'})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

      {/* Simulator Controller & Live Vitals */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">FAME Smart Mask Telemetry Simulator <span className="ml-3 px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-400 border border-cyan-800 text-[9px] uppercase tracking-widest font-mono">SIMULATED TELEMETRY</span></h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate sensor variations, respiratory drift, and critical red-flag triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={scenario}
              onChange={(e) => handleStartSim(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="HEALTHY">Scenario: Healthy Baseline</option>
              <option value="RESPIRATORY_DRIFT">Scenario: Respiratory Drift</option>
              <option value="CRITICAL_RESPIRATORY">Scenario: Critical Respiratory</option>
              <option value="NOISY_DATA">Scenario: Noisy / Outlier Data</option>
            </select>

            <button
              onClick={handleStepSim}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Step Forward ({simStep})</span>
            </button>

            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                autoPlay
                  ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <span>{autoPlay ? 'Pause Auto' : 'Auto Stream'}</span>
            </button>

            <button
              onClick={handleResetSim}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
              title="Reset Simulator"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5 Vitals Gauges */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Heart Rate */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-transparent opacity-50" />
            <div className="flex flex-col z-10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Heart Rate
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${hr > 120 ? 'text-rose-400' : 'text-white'}`}>{hr}</span>
                <span className="text-[10px] text-slate-500 font-mono">BPM</span>
              </div>
            </div>
            {/* SVG Mini Ring */}
            <div className="w-12 h-12 relative z-10">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-rose-500" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - (hr / 200) * 100} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
              </svg>
            </div>
          </div>

          {/* SpO2 */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-transparent opacity-50" />
            <div className="flex flex-col z-10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Blood Oxygen
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${spo2 < 92 ? 'text-rose-400' : 'text-cyan-50'}`}>{spo2}</span>
                <span className="text-[10px] text-slate-500 font-mono">%</span>
              </div>
            </div>
            <div className="w-12 h-12 relative z-10">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-cyan-400" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - spo2} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
              </svg>
            </div>
          </div>

          {/* Resp Rate */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-transparent opacity-50" />
            <div className="flex flex-col z-10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Wind className="w-3.5 h-3.5 text-blue-400" /> Resp. Rate
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${rr > 25 ? 'text-amber-400' : 'text-white'}`}>{rr}</span>
                <span className="text-[10px] text-slate-500 font-mono">br/m</span>
              </div>
            </div>
            <div className="w-12 h-12 relative z-10">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-400" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - (rr / 40) * 100} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
              </svg>
            </div>
          </div>

          {/* Temperature */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-transparent opacity-50" />
            <div className="flex flex-col z-10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temp
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${temp > 37.8 ? 'text-amber-400' : 'text-white'}`}>{temp}</span>
                <span className="text-[10px] text-slate-500 font-mono">°C</span>
              </div>
            </div>
            <div className="w-12 h-12 relative z-10">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-amber-400" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - ((temp-35) / 5) * 100} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
              </svg>
            </div>
          </div>

          {/* VOC */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-between group overflow-hidden relative sm:col-span-1 col-span-2">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-transparent opacity-50" />
            <div className="flex flex-col z-10">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Wind className="w-3.5 h-3.5 text-emerald-400" /> VOC Exhale
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{voc}</span>
                <span className="text-[10px] text-slate-500 font-mono">idx</span>
              </div>
            </div>
            <div className="w-12 h-12 relative z-10">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-400" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - (voc / 1) * 100} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
              </svg>
            </div>
          </div>

        </div>

        {/* Realistic Telemetry Waveform */}
        <div className="h-40 w-full mt-2 bg-[#020813] border border-cyan-900/40 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between group">
          
          <style>{`
            @keyframes ecg-draw {
              0% { stroke-dashoffset: 100; opacity: 1; }
              95% { stroke-dashoffset: 0; opacity: 1; }
              100% { stroke-dashoffset: 0; opacity: 0; }
            }
          `}</style>
          
          <div className="flex justify-between items-center z-10 text-[9px] font-mono text-cyan-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LEAD-II BIOSENSOR GRAPH - REALTIME SWEEP SPEED: 25mm/s
            </div>
            <div className="text-slate-400">
              MARKER: HR {hr} BPM • SpO2 {spo2}% • Resp {rr} • {temp}°C
            </div>
          </div>
          
          {/* SVG ECG Waveform */}
          <div 
            className="absolute inset-0 top-8 bottom-0 px-2 flex items-center overflow-hidden opacity-90"
          >
            <svg 
              className="h-24 w-[200%]" 
              viewBox="0 0 1000 100" 
              preserveAspectRatio="none"
            >
              <path 
                d="M0,50 L20,50 L25,45 L30,50 L40,50 L45,20 L50,90 L55,50 L65,50 L70,42 L80,50 L100,50 L100,50 L120,50 L125,45 L130,50 L140,50 L145,20 L150,90 L155,50 L165,50 L170,42 L180,50 L200,50 L200,50 L220,50 L225,45 L230,50 L240,50 L245,20 L250,90 L255,50 L265,50 L270,42 L280,50 L300,50 L300,50 L320,50 L325,45 L330,50 L340,50 L345,20 L350,90 L355,50 L365,50 L370,42 L380,50 L400,50 L400,50 L420,50 L425,45 L430,50 L440,50 L445,20 L450,90 L455,50 L465,50 L470,42 L480,50 L500,50 L500,50 L520,50 L525,45 L530,50 L540,50 L545,20 L550,90 L555,50 L565,50 L570,42 L580,50 L600,50 L600,50 L620,50 L625,45 L630,50 L640,50 L645,20 L650,90 L655,50 L665,50 L670,42 L680,50 L700,50 L700,50 L720,50 L725,45 L730,50 L740,50 L745,20 L750,90 L755,50 L765,50 L770,42 L780,50 L800,50 L800,50 L820,50 L825,45 L830,50 L840,50 L845,20 L850,90 L855,50 L865,50 L870,42 L880,50 L900,50 L900,50 L920,50 L925,45 L930,50 L940,50 L945,20 L950,90 L955,50 L965,50 L970,42 L980,50 L1000,50" 
                fill="none" 
                stroke="#00f2fe" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                pathLength="100"
                strokeDasharray="100"
                style={{ 
                  filter: 'drop-shadow(0px 0px 4px rgba(0,242,254,0.8))',
                  animation: 'ecg-draw 3.5s linear infinite'
                }} 
              />
            </svg>
          </div>
          
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,254,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,254,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        </div>
      </div>

          {/* Health Risk Overview & Trends (Smart Mask Telemetry History Only) */}
          {(() => {
            const hist = telemetryAssessmentHistory.filter((a): a is RiskAssessment => Boolean(a));
            const revHist = hist.slice().reverse();
            let trendText = hist.length === 0 ? 'Awaiting Telemetry' : 'Stable';
            let trendColor = 'text-cyan-400';
            if (hist.length >= 2) {
              const latest = hist[0]?.risk_score ?? 0;
              const prev = hist[1]?.risk_score ?? 0;
              if (latest < prev) {
                trendText = 'Improving (Risk Decreasing)';
                trendColor = 'text-emerald-400';
              } else if (latest > prev) {
                trendText = 'Worsening (Risk Increasing)';
                trendColor = 'text-rose-400';
              }
            }

            const barData = revHist.map((a, idx) => ({
              name: `#${idx + 1}`,
              RiskScore: a?.risk_score ?? 0,
              Confidence: a?.confidence_score ?? 0,
            }));

            return (
              <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    <span>Health Risk Overview & Trends</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-normal">
                      Connected Smart Mask Telemetry Only
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-400">Current Trend:</span>
                    <span className={`font-bold ${trendColor}`}>{trendText}</span>
                  </div>
                </div>

                {hist.length === 0 ? (
                  <div className="p-6 rounded-lg bg-slate-900/50 border border-slate-800/80 backdrop-blur-md shadow-lg text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Awaiting Smart Mask Connection</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Connect physical FAME Smart Mask device or run the Telemetry Simulator to record real-time vitals trends. Input symptoms & lab OCR assessments do not alter hardware telemetry trends.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column: Recent Assessment History Bar Chart */}
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 backdrop-blur-md shadow-lg space-y-2">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span>Smart Mask Assessment History</span>
                        <span className="text-[10px] text-slate-400 font-mono">{hist.length} record(s)</span>
                      </div>
                      <div className="h-40 w-full pt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                            <Bar dataKey="RiskScore" fill="#f43f5e" name="Risk Score" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Confidence" fill="#06b6d4" name="Confidence %" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Right Column: Detailed Time-Series Risk Progression Graph */}
                    <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 backdrop-blur-md shadow-lg space-y-2">
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span>Telemetry Risk Progression Over Time</span>
                        <span className="text-[10px] text-cyan-400 font-mono">Live Sensor Stream</span>
                      </div>
                      <div className="h-40 w-full pt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={revHist.map((a, i) => ({
                            time: `#${i + 1}`,
                            risk: a?.risk_score ?? 0,
                            confidence: a?.confidence_score ?? 0,
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                            <Line type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2} name="Risk Score" connectNulls={true} />
                            <Line type="monotone" dataKey="confidence" stroke="#06b6d4" strokeWidth={2} name="Confidence %" connectNulls={true} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

      {/* Live WebCam Camera Modal */}
      <LiveCameraModal
        isOpen={showLiveCamera}
        onClose={() => setShowLiveCamera(false)}
        onCapture={(file, dataUrl) => {
          addSingleAttachedFile(file, dataUrl);
        }}
      />

      {/* Dedicated Patient Profile & Health Notes Modal */}
      <PatientProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        patient={profile}
        onProfileUpdated={(updated) => {
          setProfile(updated);
        }}
      />

      {/* Chat Settings Modal */}
      <ChatSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        autoPlayVoice={autoPlayVoice}
        onToggleAutoPlayVoice={() => setAutoPlayVoice((prev) => !prev)}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        onClearHistory={handleClearChatHistory}
      />
      </div>
          </div>
    </div>
  );
};

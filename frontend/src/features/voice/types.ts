export type SupportedLanguage = 'en' | 'te' | 'hi';

export interface LanguageSetting {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  sttLocale: string;
  ttsLocale: string;
}

export interface SpeechRecognitionHookResult {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: (lang?: SupportedLanguage) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export interface SpeechSynthesisHookResult {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string, lang?: SupportedLanguage) => void;
  stop: () => void;
}

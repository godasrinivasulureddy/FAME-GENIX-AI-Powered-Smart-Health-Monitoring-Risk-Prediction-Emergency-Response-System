import React, { useEffect } from 'react';
import { Mic, MicOff, Square, Globe, AlertCircle } from 'lucide-react';
import { SupportedLanguage } from './types';
import { LANGUAGE_SETTINGS } from './languageConfig';
import { useSpeechRecognition } from './useSpeechRecognition';

interface VoiceInputProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onTranscriptReceived: (text: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  selectedLanguage,
  onLanguageChange,
  onTranscriptReceived,
}) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition(selectedLanguage);

  // When speech transcript completes, push to parent's text input (editable)
  useEffect(() => {
    if (transcript) {
      onTranscriptReceived(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscriptReceived, resetTranscript]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
      {/* Language Selector */}
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-cyan-400" />
        <span className="text-slate-400 font-medium">Language:</span>
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-500"
          aria-label="Select symptom language"
        >
          {Object.values(LANGUAGE_SETTINGS).map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeLabel} ({lang.label})
            </option>
          ))}
        </select>
      </div>

      {/* Microphone Control */}
      <div className="flex items-center gap-3">
        {isListening && interimTranscript && (
          <span className="text-cyan-400 animate-pulse italic font-mono text-[11px] truncate max-w-[200px]">
            "{interimTranscript}"
          </span>
        )}

        {isSupported ? (
          <button
            type="button"
            onClick={() => (isListening ? stopListening() : startListening(selectedLanguage))}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse hover:bg-rose-500/30'
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
            }`}
            title={isListening ? 'Stop recording speech' : 'Speak symptoms using microphone'}
            aria-label="Toggle voice input microphone"
          >
            {isListening ? (
              <>
                <Square className="w-3.5 h-3.5 fill-rose-400" />
                <span>Listening... [Stop]</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Speak Symptoms</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-400 text-[11px]">
            <MicOff className="w-3.5 h-3.5" />
            <span>Voice input unsupported (Type symptoms below)</span>
          </div>
        )}
      </div>

      {/* Error / Permission Warning */}
      {error && (
        <div className="w-full flex items-center gap-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

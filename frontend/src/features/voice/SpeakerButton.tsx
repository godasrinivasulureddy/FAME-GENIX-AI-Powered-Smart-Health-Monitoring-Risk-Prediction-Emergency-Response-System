import React from 'react';
import { Volume2, Square, VolumeX } from 'lucide-react';
import { SupportedLanguage } from './types';
import { useSpeechSynthesis } from './useSpeechSynthesis';

interface SpeakerButtonProps {
  textToSpeak: string;
  language?: SupportedLanguage;
  label?: string;
}

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({
  textToSpeak,
  language = 'en',
  label = 'Listen',
}) => {
  const { isSpeaking, isSupported, speak, stop } = useSpeechSynthesis();

  if (!isSupported) {
    return (
      <span className="text-[11px] text-slate-500 flex items-center gap-1" title="Text-to-Speech is unavailable in this browser">
        <VolumeX className="w-3 h-3" />
        <span>Audio unavailable</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (isSpeaking ? stop() : speak(textToSpeak, language))}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
        isSpeaking
          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse hover:bg-rose-500/30'
          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20'
      }`}
      aria-label={isSpeaking ? 'Stop audio explanation playback' : 'Play audio explanation'}
    >
      {isSpeaking ? (
        <>
          <Square className="w-3 h-3 fill-rose-300" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

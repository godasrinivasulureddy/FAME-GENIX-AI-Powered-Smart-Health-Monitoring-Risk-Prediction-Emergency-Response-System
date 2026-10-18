import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechSynthesisHookResult, SupportedLanguage } from './types';
import { getLanguageSetting } from './languageConfig';

export function useSpeechSynthesis(): SpeechSynthesisHookResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      const updateVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    } else {
      setIsSupported(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string, lang: SupportedLanguage = 'en') => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    const langSetting = getLanguageSetting(lang);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langSetting.ttsLocale;
    utterance.rate = 0.95; // Slightly slower for clear clinical understanding

    // Try to match specific language voice if available
    const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.toLowerCase() === langSetting.ttsLocale.toLowerCase() || v.lang.toLowerCase().startsWith(lang.toLowerCase())
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
  };
}

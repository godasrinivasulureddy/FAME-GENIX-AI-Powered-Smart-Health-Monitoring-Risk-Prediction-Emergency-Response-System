import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognitionHookResult, SupportedLanguage } from './types';
import { getLanguageSetting } from './languageConfig';

// Declare SpeechRecognition interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition(defaultLang: SupportedLanguage = 'en'): SpeechRecognitionHookResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore if already stopped
      }
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(
    (lang: SupportedLanguage = defaultLang) => {
      setError(null);
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionClass) {
        setIsSupported(false);
        setError('Voice recognition is not supported in this browser. Please type your symptoms.');
        return;
      }

      if (isListening) {
        stopListening();
      }

      try {
        const recognition = new SpeechRecognitionClass();
        const langSetting = getLanguageSetting(lang);
        recognition.lang = langSetting.sttLocale;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          setInterimTranscript('');
        };

        recognition.onresult = (event: any) => {
          let currentFinal = '';
          let currentInterim = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              currentFinal += res[0].transcript + ' ';
            } else {
              currentInterim += res[0].transcript;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => (prev ? `${prev.trim()} ${currentFinal.trim()}` : currentFinal.trim()));
          }
          setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: any) => {
          const errType = event.error;
          if (errType === 'not-allowed') {
            setError('Microphone access was denied. You can still type your symptoms manually.');
          } else if (errType === 'no-speech') {
            setError('No speech was detected. Please try speaking again.');
          } else if (errType === 'audio-capture') {
            setError('No microphone found. Please connect a microphone.');
          } else {
            setError('Speech recognition encountered an issue. You can edit the text manually.');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        setError('Could not start microphone. Please type your symptoms.');
        setIsListening(false);
      }
    },
    [defaultLang, isListening, stopListening]
  );

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

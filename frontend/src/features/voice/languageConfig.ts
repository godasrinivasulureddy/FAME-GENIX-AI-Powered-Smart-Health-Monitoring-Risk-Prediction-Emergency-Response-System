import { LanguageSetting, SupportedLanguage } from './types';

export const LANGUAGE_SETTINGS: Record<SupportedLanguage, LanguageSetting> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    sttLocale: 'en-IN',
    ttsLocale: 'en-IN',
  },
  te: {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    sttLocale: 'te-IN',
    ttsLocale: 'te-IN',
  },
  hi: {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    sttLocale: 'hi-IN',
    ttsLocale: 'hi-IN',
  },
};

export function getLanguageSetting(code: SupportedLanguage): LanguageSetting {
  return LANGUAGE_SETTINGS[code] || LANGUAGE_SETTINGS.en;
}

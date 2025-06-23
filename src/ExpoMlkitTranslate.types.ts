export const TRANSLATE_LANGUAGES = {
  AFRIKAANS: "af",
  ALBANIAN: "sq",
  ARABIC: "ar",
  BELARUSIAN: "be",
  BENGALI: "bn",
  BULGARIAN: "bg",
  CATALAN: "ca",
  CHINESE: "zh",
  CROATIAN: "hr",
  CZECH: "cs",
  DANISH: "da",
  DUTCH: "nl",
  ENGLISH: "en",
  ESPERANTO: "eo",
  ESTONIAN: "et",
  FILIPINO: "tl",
  FINNISH: "fi",
  FRENCH: "fr",
  GALICIAN: "gl",
  GEORGIAN: "ka",
  GERMAN: "de",
  GREEK: "el",
  GUJARATI: "gu",
  HAITIAN_CREOLE: "ht",
  HEBREW: "he",
  HINDI: "hi",
  HUNGARIAN: "hu",
  ICELANDIC: "is",
  INDONESIAN: "id",
  IRISH: "ga",
  ITALIAN: "it",
  JAPANESE: "ja",
  KANNADA: "kn",
  KOREAN: "ko",
  LATVIAN: "lv",
  LITHUANIAN: "lt",
  MACEDONIAN: "mk",
  MALAY: "ms",
  MALTESE: "mt",
  MARATHI: "mr",
  NORWEGIAN: "no",
  PERSIAN: "fa",
  POLISH: "pl",
  PORTUGUESE: "pt",
  ROMANIAN: "ro",
  RUSSIAN: "ru",
  SLOVAK: "sk",
  SLOVENIAN: "sl",
  SPANISH: "es",
  SWAHILI: "sw",
  SWEDISH: "sv",
  TAGALOG: "tl",
  TAMIL: "ta",
  TELUGU: "te",
  THAI: "th",
  TURKISH: "tr",
  UKRAINIAN: "uk",
  URDU: "ur",
  VIETNAMESE: "vi",
  WELSH: "cy",
} as const;

export type TranslateLanguage =
  (typeof TRANSLATE_LANGUAGES)[keyof typeof TRANSLATE_LANGUAGES];

export interface TranslationOptions {
  sourceLanguage: TranslateLanguage;
  targetLanguage: TranslateLanguage;
}

export interface ModelDownloadOptions {
  allowsCellularAccess?: boolean;
  allowsBackgroundDownloading?: boolean;
}

export interface TranslationResult {
  translatedText: string;
}

export interface ModelInfo {
  language: TranslateLanguage;
  isDownloaded: boolean;
}

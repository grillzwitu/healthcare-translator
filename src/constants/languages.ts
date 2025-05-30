/**
 * List of supported languages for translation and speech recognition.
 * Each language has a code (IETF BCP 47) and a human-readable label.
 * 
 * If you add or remove languages, ensure all components using LANGUAGES
 * handle the changes gracefully. This file does not throw errors directly,
 * but you should validate language codes in your UI logic and log errors
 * with error codes (e.g., LANG-001) if an invalid code is used.
 */
export const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "pt-PT", label: "Portuguese" },
  { code: "ru-RU", label: "Russian" },
  { code: "sv-SE", label: "Swedish" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "tr-TR", label: "Turkish" },
  { code: "ko-KR", label: "Korean" },
];

// Note: Error handling for invalid language codes should be implemented
// in components that use LANGUAGES, e.g., when setting or selecting a language.
// Example error logging in a component:
// if (!LANGUAGES.some(l => l.code === value)) {
//   console.error("[LANG-001] Invalid language code selected:", value);
// }
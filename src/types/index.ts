/**
 * Role type for chat participants.
 * "Patient" or "Provider" only.
 */
export type Role = "Patient" | "Provider";

/**
 * Message interface for chat history.
 * Represents a single message exchanged in the chat.
 */
export interface Message {
  sender: Role;
  inputLang: string;
  targetLang: string;
  original: string;
  corrected: string;
  suggestions: string;
  translation: string;
  correctedHeading?: string;
  suggestionsHeading?: string;
  translationHeading?: string;
}

/**
 * Props for SpeechToText component.
 * @property onTranscript - Callback for when a transcript is ready.
 * @property isListening - Whether speech recognition is active.
 * @property setIsListening - Setter for listening state.
 * @property inputLang - Language code for recognition.
 */
export interface SpeechToTextProps {
  onTranscript: (text: string) => void | Promise<void>;
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  inputLang: string;
}

/**
 * Section of a parsed AI response.
 * Used for displaying additional structured output.
 */
export interface ParsedAIResponseSection {
  heading: string;
  content: string;
}

/**
 * Parsed AI response structure.
 * Used for extracting and displaying translation, corrections, and suggestions.
 */
export interface ParsedAIResponse {
  correctedInput: string;
  correctedTarget: string;
  correctedTargetHeading: string;
  suggestions: string;
  suggestionsHeading: string;
  translation: string;
  translationHeading: string;
  sections: ParsedAIResponseSection[];
}

/**
 * Props for TranslationOutput component.
 * Handles error codes for audio playback and UI feedback.
 * @property correction - The corrected transcript string.
 * @property suggestions - Suggestions string.
 * @property translatedText - The translated text string.
 * @property processing - Whether the translation is in progress.
 * @property speak - Function to play the translation audio (should handle errors with error codes, e.g., [TO-001]).
 * @property sections - Additional sections to display (optional).
 */
export interface TranslationOutputProps {
  correction: string;
  suggestions: string;
  translatedText: string;
  processing: boolean;
  speak: () => void;
  sections: { heading: string; content: string }[];
}

/**
 * Props for Panel component (Patient or Provider).
 * All language code changes and transcript updates should be validated in the component.
 * Log errors with error codes (e.g., [PANEL-001]) if invalid values are used.
 */
export interface PanelProps {
  role: Role;
  inputLang: string;
  setInputLang: (v: string) => void;
  targetLang: string;
  setTargetLang: (v: string) => void;
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  onSend: (text: string) => void;
  transcript: string;
  setTranscript: (v: string) => void;
}

// Note: This file only defines types and interfaces. Error handling should be implemented in the consuming components.
// When handling errors, use descriptive error codes (e.g., [SR-001] for speech recognition, [TO-001] for translation output, [PANEL-001] for panel errors, etc.)
// and, where applicable, include HTTP status codes or Web Speech API error codes in logs for better debugging.
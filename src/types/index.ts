export type Role = "Patient" | "Provider";

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

export interface SpeechToTextProps {
  onTranscript: (text: string) => void | Promise<void>;
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  inputLang: string;
}
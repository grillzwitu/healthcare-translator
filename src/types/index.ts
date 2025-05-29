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

export interface ParsedAIResponseSection {
  heading: string;
  content: string;
}

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
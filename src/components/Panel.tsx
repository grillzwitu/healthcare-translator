import { LANGUAGES } from "@/constants/languages";
import SpeechToText from "./SpeechToText";
import { Role } from "@/types";

interface PanelProps {
  role: Role;
  inputLang: string;
  setInputLang: (v: string) => void;
  targetLang: string;
  setTargetLang: (v: string) => void;
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  onSend: (text: string) => void;
}

export default function Panel({
  role,
  inputLang,
  setInputLang,
  targetLang,
  setTargetLang,
  isListening,
  setIsListening,
  onSend,
}: PanelProps) {
  return (
    <div className="flex flex-col gap-2 border rounded p-4 bg-white shadow min-w-0">
      <div className="font-bold text-lg mb-2">{role}</div>
      <label className="font-semibold">Input Language</label>
      <select
        value={inputLang}
        onChange={e => setInputLang(e.target.value)}
        className="p-2 border rounded mb-2"
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
      <label className="font-semibold">Target Language</label>
      <select
        value={targetLang}
        onChange={e => setTargetLang(e.target.value)}
        className="p-2 border rounded mb-2"
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
      <SpeechToText
        onTranscript={onSend}
        isListening={isListening}
        setIsListening={setIsListening}
        inputLang={inputLang}
      />
    </div>
  );
}
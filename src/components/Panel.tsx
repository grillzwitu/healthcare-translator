import { LANGUAGES } from "@/constants/languages";
import SpeechToText from "./SpeechToText";
import { PanelProps } from "@/types";

/**
 * Panel component for either Patient or Provider.
 * Handles language selection, transcript input, and speech-to-text.
 * Includes error handling for language selection and transcript updates.
 *
 * @param role - "Patient" or "Provider"
 * @param inputLang - Current input language code
 * @param setInputLang - Setter for input language
 * @param targetLang - Current target language code
 * @param setTargetLang - Setter for target language
 * @param isListening - Whether speech recognition is active
 * @param setIsListening - Setter for listening state
 * @param onSend - Callback to send the transcript
 * @param transcript - Current transcript text
 * @param setTranscript - Setter for transcript text
 */
export default function Panel({
  role,
  inputLang,
  setInputLang,
  targetLang,
  setTargetLang,
  isListening,
  setIsListening,
  onSend,
  transcript,
  setTranscript,
}: PanelProps) {
  /**
   * Handles changes to the input language dropdown.
   * Includes error handling for invalid language codes.
   */
  const handleInputLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!LANGUAGES.some(l => l.code === value)) {
      console.error(`Invalid input language code selected: ${value}`);
      return;
    }
    setInputLang(value);
  };

  /**
   * Handles changes to the target language dropdown.
   * Includes error handling for invalid language codes.
   */
  const handleTargetLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!LANGUAGES.some(l => l.code === value)) {
      console.error(`Invalid target language code selected: ${value}`);
      return;
    }
    setTargetLang(value);
  };

  return (
    <div className="flex flex-col gap-2 border rounded p-4 bg-white shadow min-w-0">
      {/* Panel header */}
      <div className="font-bold text-lg mb-2">{role}</div>

      {/* Input language selection */}
      <label className="font-semibold">Input Language</label>
      <select
        value={inputLang}
        onChange={handleInputLangChange}
        className="p-2 border rounded mb-2"
        aria-label="Select input language"
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>

      {/* Target language selection */}
      <label className="font-semibold">Target Language</label>
      <select
        value={targetLang}
        onChange={handleTargetLangChange}
        className="p-2 border rounded mb-2"
        aria-label="Select target language"
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>

      {/* Speech to text and transcript input */}
      <SpeechToText
        onTranscript={onSend}
        isListening={isListening}
        setIsListening={setIsListening}
        inputLang={inputLang}
        transcript={transcript}
        setTranscript={setTranscript}
      />
    </div>
  );
}
import { useState } from "react";
import SpeechToText from "./SpeechToText";
import { LANGUAGES } from "@/constants/languages"; // <-- Import here

type Role = "Patient" | "Provider";

interface Message {
  sender: Role;
  inputLang: string;
  targetLang: string;
  original: string;
  corrected: string;
  suggestions: string;
  translation: string;
}

function Panel({
  role,
  inputLang,
  setInputLang,
  targetLang,
  setTargetLang,
  isListening,
  setIsListening,
  onSend,
}: {
  role: Role;
  inputLang: string;
  setInputLang: (v: string) => void;
  targetLang: string;
  setTargetLang: (v: string) => void;
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  onSend: (text: string) => void;
}) {
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

export default function DualPanelChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  // Patient state
  const [patientInputLang, setPatientInputLang] = useState("en-US");
  const [patientTargetLang, setPatientTargetLang] = useState("es-ES");
  const [patientListening, setPatientListening] = useState(false);

  // Provider state
  const [providerInputLang, setProviderInputLang] = useState("es-ES");
  const [providerTargetLang, setProviderTargetLang] = useState("en-US");
  const [providerListening, setProviderListening] = useState(false);

  // Handle sending a message from either side
  const handleSend = async (
    sender: Role,
    text: string,
    inputLang: string,
    targetLang: string
  ) => {
    if (!text.trim()) return;
    // Call translation API
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: targetLang.split("-")[0] }),
    });
    if (!res.body) return;
    const reader = res.body.getReader();
    let resultText = "";
    let decoder = new TextDecoder();
    let corrected = "", suggestions = "", translation = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resultText += decoder.decode(value, { stream: true });
      const correctedMatch = resultText.match(/- Corrected Transcript:\s*([\s\S]*?)(?=- Suggestions:|$)/i);
      const suggestionsMatch = resultText.match(/- Suggestions:\s*([\s\S]*?)(?=- Translation:|$)/i);
      const translationMatch = resultText.match(/- Translation:\s*([\s\S]*)/i);
      corrected = correctedMatch ? correctedMatch[1].trim() : "";
      suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : "";
      translation = translationMatch ? translationMatch[1].trim() : "";
    }
    setMessages(msgs => [
      ...msgs,
      {
        sender,
        inputLang,
        targetLang,
        original: text,
        corrected,
        suggestions,
        translation,
      },
    ]);
  };

  // Responsive layout: stack on mobile, side-by-side on desktop
  return (
    <main className="min-h-screen p-2 sm:p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">Patient-Provider Translator</h1>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Patient Panel */}
        <Panel
          role="Patient"
          inputLang={patientInputLang}
          setInputLang={setPatientInputLang}
          targetLang={patientTargetLang}
          setTargetLang={setPatientTargetLang}
          isListening={patientListening}
          setIsListening={setPatientListening} // <-- Pass the setter directly
          onSend={text =>
            handleSend("Patient", text, patientInputLang, patientTargetLang)
          }
        />
        {/* Provider Panel */}
        <Panel
          role="Provider"
          inputLang={providerInputLang}
          setInputLang={setProviderInputLang}
          targetLang={providerTargetLang}
          setTargetLang={setProviderTargetLang}
          isListening={providerListening}
          setIsListening={setProviderListening} // <-- Pass the setter directly
          onSend={text =>
            handleSend("Provider", text, providerInputLang, providerTargetLang)
          }
        />
      </div>
      {/* Shared Conversation History */}
      <section className="mt-6 max-w-2xl mx-auto">
        <h2 className="font-semibold mb-2">Conversation</h2>
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded p-3 shadow-sm ${
                msg.sender === "Patient"
                  ? "bg-blue-50 border-l-4 border-blue-400"
                  : "bg-green-50 border-l-4 border-green-400"
              }`}
            >
              <div className="text-xs font-bold mb-1">
                {msg.sender} ({LANGUAGES.find(l => l.code === msg.inputLang)?.label} → {LANGUAGES.find(l => l.code === msg.targetLang)?.label})
              </div>
              <div>
                <strong>Original:</strong> {msg.original}
              </div>
              {msg.corrected && (
                <div>
                  <strong>Corrected:</strong> {msg.corrected}
                </div>
              )}
              {msg.suggestions && (
                <div>
                  <strong>Suggestions:</strong> {msg.suggestions}
                </div>
              )}
              {msg.translation && (
                <div>
                  <strong>Translation:</strong> {msg.translation}
                  <button
                    className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded"
                    onClick={() => {
                      const utter = new window.SpeechSynthesisUtterance(msg.translation);
                      utter.lang = msg.targetLang;
                      window.speechSynthesis.speak(utter);
                    }}
                  >
                    🔊
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
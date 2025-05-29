import { useState } from "react";
import Panel from "./Panel";
import { LANGUAGES } from "@/constants/languages";
import { Role, Message } from "@/types";
import { parseOpenAIResponse } from "@/utils/parseOpenAIResponse";

function getLanguageLabel(code: string) {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang ? lang.label : code;
}

export default function DualPanelChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [processing, setProcessing] = useState(false);

  // Patient state
  const [patientInputLang, setPatientInputLang] = useState("en-US");
  const [patientTargetLang, setPatientTargetLang] = useState("es-ES");
  const [patientListening, setPatientListening] = useState(false);

  // Provider state
  const [providerInputLang, setProviderInputLang] = useState("es-ES");
  const [providerTargetLang, setProviderTargetLang] = useState("en-US");
  const [providerListening, setProviderListening] = useState(false);

  // Add transcript state for each panel
  const [patientTranscript, setPatientTranscript] = useState("");
  const [providerTranscript, setProviderTranscript] = useState("");

  // Handle sending a message from either side
  const handleSend = async (
    sender: Role,
    text: string,
    inputLang: string,
    targetLang: string
  ) => {
    if (!text.trim()) return;
    setProcessing(true);
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        inputLang: inputLang.split("-")[0],
        targetLang: targetLang.split("-")[0],
        role: sender,
      }),
    });
    if (!res.body) {
      setProcessing(false);
      return;
    }
    const reader = res.body.getReader();
    let resultText = "";
    let decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resultText += decoder.decode(value, { stream: true });
    }

    // Parse the full response ONCE
    const parsed = parseOpenAIResponse(resultText);

    // Set corrected transcript in the input box (input language)
    if (parsed.correctedInput) {
      if (sender === "Patient") setPatientTranscript(parsed.correctedInput);
      else setProviderTranscript(parsed.correctedInput);
    } else {
      if (sender === "Patient") setPatientTranscript("");
      else setProviderTranscript("");
    }

    setMessages(msgs => [
      ...msgs,
      {
        sender,
        inputLang,
        targetLang,
        original: text,
        corrected: parsed.correctedTarget,
        suggestions: parsed.suggestions,
        translation: parsed.translation,
        correctedHeading: parsed.correctedTargetHeading,
        suggestionsHeading: parsed.suggestionsHeading,
        translationHeading: parsed.translationHeading,
      },
    ]);
    setProcessing(false);
  };

  function getRoleLabel(sender: Role) {
    return sender === "Patient" ? "Patient" : "Health Care Provider";
  }

  return (
    <main className="min-h-screen p-2 sm:p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">Patient & Health Care Provider Translator</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <Panel
          role="Patient"
          inputLang={patientInputLang}
          setInputLang={setPatientInputLang}
          targetLang={patientTargetLang}
          setTargetLang={setPatientTargetLang}
          isListening={patientListening}
          setIsListening={setPatientListening}
          onSend={text =>
            handleSend("Patient", text, patientInputLang, patientTargetLang)
          }
          transcript={patientTranscript}
          setTranscript={setPatientTranscript}
        />
        <Panel
          role="Provider"
          inputLang={providerInputLang}
          setInputLang={setProviderInputLang}
          targetLang={providerTargetLang}
          setTargetLang={setProviderTargetLang}
          isListening={providerListening}
          setIsListening={setProviderListening}
          onSend={text =>
            handleSend("Provider", text, providerInputLang, providerTargetLang)
          }
          transcript={providerTranscript}
          setTranscript={setProviderTranscript}
        />
      </div>
      <section className="mt-6 max-w-2xl mx-auto">
        <h2 className="font-semibold mb-2">Conversation</h2>
        <div className="flex flex-col gap-3">
          {processing && (
            <div className="flex items-center gap-2 text-blue-600">
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Processing...
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded p-3 shadow-sm ${
                msg.sender === "Patient"
                  ? "bg-blue-50 border-l-4 border-blue-400"
                  : "bg-green-50 border-l-4 border-green-400"
              }`}
            >
              <div className="mb-1 font-semibold">
                {getRoleLabel(msg.sender)} ({getLanguageLabel(msg.inputLang)} → {getLanguageLabel(msg.targetLang)})
              </div>
              {msg.corrected && (
                <div>
                  <strong>{msg.correctedHeading}</strong>: {msg.corrected}
                </div>
              )}
              {msg.suggestions && (
                <div>
                  <strong>{msg.suggestionsHeading}</strong>: {msg.suggestions}
                </div>
              )}
              {msg.translation && (
                <div>
                  <strong>{msg.translationHeading}</strong>: {msg.translation}
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
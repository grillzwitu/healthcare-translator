import { useState } from "react";
import Panel from "./Panel";
import { LANGUAGES } from "@/constants/languages";
import { Role, Message } from "@/types";
import { parseOpenAIResponse } from "@/utils/parseOpenAIResponse";
import ChatMessage from "./ChatMessage";

/**
 * Returns the display label for a language code.
 * @param code - The language code (e.g., "en-US").
 * @returns The language label or the code if not found.
 */
function getLanguageLabel(code: string) {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang ? lang.label : code;
}

/**
 * DualPanelChat component manages the state and logic for the dual-panel
 * patient/provider chat interface, including message handling, API calls,
 * and error handling.
 */
export default function DualPanelChat() {
  // State for all chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State for showing processing spinner
  const [processing, setProcessing] = useState(false);

  // Patient state
  const [patientInputLang, setPatientInputLang] = useState("en-US");
  const [patientTargetLang, setPatientTargetLang] = useState("es-ES");
  const [patientListening, setPatientListening] = useState(false);
  const [patientTranscript, setPatientTranscript] = useState("");

  // Provider state
  const [providerInputLang, setProviderInputLang] = useState("es-ES");
  const [providerTargetLang, setProviderTargetLang] = useState("en-US");
  const [providerListening, setProviderListening] = useState(false);
  const [providerTranscript, setProviderTranscript] = useState("");

  /**
   * Handles sending a message from either the patient or provider panel.
   * Calls the translation API and updates the chat state.
   * Includes detailed error handling for network and parsing errors.
   *
   * @param sender - "Patient" or "Provider"
   * @param text - The message text to send
   * @param inputLang - The input language code
   * @param targetLang - The target language code
   */
  const handleSend = async (
    sender: Role,
    text: string,
    inputLang: string,
    targetLang: string
  ) => {
    if (!text.trim()) return;
    setProcessing(true);

    let res: Response | undefined;
    try {
      res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          inputLang: inputLang.split("-")[0],
          targetLang: targetLang.split("-")[0],
          role: sender,
        }),
      });
    } catch (err) {
      // Network or fetch error
      setProcessing(false);
      console.error("Network error while sending message:", err);
      alert("Network error: Unable to reach the translation service.");
      return;
    }

    if (!res || !res.body) {
      setProcessing(false);
      console.error("No response body received from translation API.");
      alert("Error: No response from translation service.");
      return;
    }

    if (!res.ok) {
      setProcessing(false);
      // Try to read error message from response
      let errorMsg = "Translation service error.";
      try {
        errorMsg = await res.text();
      } catch (e) {
        // Ignore parsing error, use default message
      }
      console.error("Translation API error:", errorMsg);
      alert(errorMsg);
      return;
    }

    // Read the streamed response
    const reader = res.body.getReader();
    let resultText = "";
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resultText += decoder.decode(value, { stream: true });
      }
    } catch (err) {
      setProcessing(false);
      console.error("Error reading translation stream:", err);
      alert("Error reading translation response.");
      return;
    }

    // Parse the full response ONCE
    let parsed;
    try {
      parsed = parseOpenAIResponse(resultText);
    } catch (err) {
      setProcessing(false);
      console.error("Error parsing translation response:", err);
      alert("Error parsing translation response.");
      return;
    }

    // Set corrected transcript in the input box (input language)
    if (parsed.correctedInput) {
      if (sender === "Patient") setPatientTranscript(parsed.correctedInput);
      else setProviderTranscript(parsed.correctedInput);
    } else {
      if (sender === "Patient") setPatientTranscript("");
      else setProviderTranscript("");
    }

    // Add the new message to the chat history
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

  /**
   * Returns the display label for a role.
   * @param sender - The sender role ("Patient" or "Provider")
   * @returns The display label for the role.
   */
  function getRoleLabel(sender: Role) {
    return sender === "Patient" ? "Patient" : "Health Care Provider";
  }

  return (
    <main className="min-h-screen p-2 sm:p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Patient & Health Care Provider Translator
      </h1>
      {/* Input panels: do not change their position */}
      <div className="flex flex-col md:flex-row gap-4 md:justify-center">
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
      <section className="mt-6 max-w-4xl mx-auto w-full">
        <h2 className="font-semibold mb-2 text-center">Conversation</h2>
        {/* Processing animation always directly under heading */}
        {processing && (
          <div className="flex items-center gap-2 text-blue-600 justify-center mb-4">
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Processing...
          </div>
        )}
        {/* Chat messages: swap alignment for desktop, stack for mobile */}
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`
                flex
                ${msg.sender === "Provider"
                  ? "justify-end md:pr-[52%]"
                  : "justify-start md:pl-[52%]"
                }
              `}
            >
              <ChatMessage msg={msg} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
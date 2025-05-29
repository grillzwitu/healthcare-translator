import { useState } from "react";
import SpeechToText from "./SpeechToText";
import { LANGUAGES } from "@/constants/languages";
import { parseOpenAIResponse } from "@/utils/parseOpenAIResponse";

export default function Translator() {
  const [translatedText, setTranslatedText] = useState("");
  const [correction, setCorrection] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [targetLang, setTargetLang] = useState("en-US");
  const [inputLang, setInputLang] = useState("en-US");
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sections, setSections] = useState<{ heading: string; content: string }[]>([]);

  const handleTranslate = async (text: string) => {
    setCorrection("");
    setSuggestions("");
    setTranslatedText("");
    setSections([]);
    setProcessing(true);
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: targetLang.split("-")[0] }),
    });

    if (!res.body) {
      setTranslatedText("No response body");
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

      const parsed = parseOpenAIResponse(resultText);
      setSections(parsed.sections);
      setTranscript(parsed.corrected); // For input box
    }
    setProcessing(false);
  };

  const speak = () => {
    if (!translatedText) return;
    const utterance = new window.SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Translator</h1>
      {/* Input Section */}
      <section className="mb-8">
        <label htmlFor="input-lang" className="block mb-1 font-semibold">
          Input Language
        </label>
        <select
          id="input-lang"
          value={inputLang}
          onChange={(e) => setInputLang(e.target.value)}
          className="p-2 border rounded mb-4"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>

        <SpeechToText
          onTranscript={handleTranslate}
          isListening={isListening}
          setIsListening={setIsListening}
          inputLang={inputLang}
          transcript={transcript}
          setTranscript={setTranscript}
        />
      </section>

      {/* Output Section */}
      <section>
        <label htmlFor="output-lang" className="block mb-1 font-semibold">
          Output Language
        </label>
        <select
          id="output-lang"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="p-2 border rounded mb-4"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>

        {processing && (
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Processing...
          </div>
        )}

        {correction && (
          <div className="mt-4 p-2 border rounded bg-blue-50">
            <strong>Corrected Transcript:</strong>
            <div>{correction}</div>
          </div>
        )}
        {suggestions && (
          <div className="mt-2 p-2 border rounded bg-yellow-50">
            <strong>Suggestions:</strong>
            <div>{suggestions}</div>
          </div>
        )}
        {translatedText && (
          <div className="mt-2 p-2 border rounded bg-green-50">
            <strong>Translation:</strong>
            <div>{translatedText}</div>
            <button
              onClick={speak}
              className="mt-2 bg-green-500 text-white p-2 rounded"
            >
              Speak Translation
            </button>
          </div>
        )}
        {sections.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {sections.map(({ heading, content }) => (
              <div key={heading} className="p-2 border rounded">
                <strong>{heading}</strong>
                <div>{content}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
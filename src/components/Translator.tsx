import { useState } from "react";
import SpeechToText from "./SpeechToText";
import { LANGUAGES } from "@/constants/languages"; // <-- Import here

export default function Translator() {
  const [translatedText, setTranslatedText] = useState("");
  const [correction, setCorrection] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [targetLang, setTargetLang] = useState("en-US");
  const [inputLang, setInputLang] = useState("en-US");
  const [isListening, setIsListening] = useState(false);

  const handleTranslate = async (text: string) => {
    setCorrection("");
    setSuggestions("");
    setTranslatedText("");
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang: targetLang.split("-")[0] }),
    });

    if (!res.body) {
      setTranslatedText("No response body");
      return;
    }

    const reader = res.body.getReader();
    let resultText = "";
    let decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resultText += decoder.decode(value, { stream: true });

      // Parse the streamed text for sections
      // Use non-greedy matching and allow for streaming partials
      const correctedMatch = resultText.match(/- Corrected Transcript:\s*([\s\S]*?)(?=- Suggestions:|$)/i);
      const suggestionsMatch = resultText.match(/- Suggestions:\s*([\s\S]*?)(?=- Translation:|$)/i);
      const translationMatch = resultText.match(/- Translation:\s*([\s\S]*)/i);

      setCorrection(correctedMatch ? correctedMatch[1].trim() : "");
      setSuggestions(suggestionsMatch ? suggestionsMatch[1].trim() : "");
      setTranslatedText(translationMatch ? translationMatch[1].trim() : "");
    }
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
      </section>
    </main>
  );
}
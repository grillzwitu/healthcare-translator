"use client";
import SpeechToText from "@/components/SpeechToText";
import { translateText } from "@/lib/translate";
import { useState } from "react";

export default function Home() {
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("en-US"); // Default to English
  const [inputLang, setInputLang] = useState("en-US"); // Default to English
  const [isListening, setIsListening] = useState(false);
  const [correction, setCorrection] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const handleTranslate = async (text: string) => {
    const result = await translateText(text, targetLang.split("-")[0]);
    // Simple parsing (you can improve this as needed)
    const correctedMatch = result.match(/Corrected Transcript:\s*(.*)/i);
    const suggestionsMatch = result.match(/Suggestions:\s*(.*)/i);
    const translationMatch = result.match(/Translation:\s*(.*)/i);

    setCorrection(correctedMatch ? correctedMatch[1].trim() : "");
    setSuggestions(suggestionsMatch ? suggestionsMatch[1].trim() : "");
    setTranslatedText(translationMatch ? translationMatch[1].trim() : result);
  };

  const speak = () => {
    if (!translatedText) return;
    const utterance = new window.SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang; // e.g., "en-US", "es-ES", "fr-FR"
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
          <option value="en-US">English</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
          <option value="pt-PT">Portuguese</option>
          <option value="ru-RU">Russian</option>
          <option value="el-GR">Greek</option>
          <option value="la">Latin</option>
          <option value="he-IL">Hebrew</option>
          <option value="sv-SE">Swedish</option>
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
          <option value="en-US">English</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
          <option value="de-DE">German</option>
          <option value="pt-PT">Portuguese</option>
          <option value="ru-RU">Russian</option>
          <option value="el-GR">Greek</option>
          <option value="la">Latin</option>
          <option value="he-IL">Hebrew</option>
          <option value="sv-SE">Swedish</option>
        </select>

        {correction && (
          <div className="mt-4 p-2 border rounded">
            <strong>Corrected Transcript:</strong>
            <div>{correction}</div>
          </div>
        )}
        {suggestions && (
          <div className="mt-2 p-2 border rounded">
            <strong>Suggestions:</strong>
            <div>{suggestions}</div>
          </div>
        )}
        {translatedText && (
          <div className="mt-2 p-2 border rounded">
            <strong>Translation:</strong>
            <div>{translatedText}</div>
            <button onClick={speak} className="mt-2 bg-green-500 text-white p-2 rounded">
              Speak Translation
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

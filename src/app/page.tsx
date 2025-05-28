"use client";
import SpeechToText from "@/components/SpeechToText";
import { translateText } from "@/lib/translate";
import { useState } from "react";

export default function Home() {
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("en-US"); // Default to English
  const [isListening, setIsListening] = useState(false);

  const handleTranslate = async (text: string) => {
    const result = await translateText(text, targetLang.split("-")[0]);
    setTranslatedText(result);
  };

  const speak = () => {
    if (!translatedText) return;
    const utterance = new window.SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang; // e.g., "en-US", "es-ES", "fr-FR"
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Healthcare Translator</h1>
      <select 
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        className="p-2 border rounded mb-4"
      >
        <option value="en-US">English</option>
        <option value="es-ES">Spanish</option>
        <option value="fr-FR">French</option>
      </select>
      <SpeechToText
        onTranscript={handleTranslate}
        isListening={isListening}
        setIsListening={setIsListening}
      />
      {translatedText && (
        <div className="mt-6 p-4 border rounded">
          <p>{translatedText}</p>
          <button 
            onClick={speak}
            className="mt-2 bg-green-500 text-white p-2 rounded"
          >
            Speak Translation
          </button>
          <button
            onClick={() => setTranslatedText("This is a test translation.")}
            className="mt-2 bg-yellow-500 text-white p-2 rounded"
          >
            Set Test Translation
          </button>
        </div>
      )}
    </main>
  );
}

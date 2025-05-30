import { useState } from "react";
import SpeechToText from "./SpeechToText";
import { LANGUAGES } from "@/constants/languages";
import { parseOpenAIResponse } from "@/utils/parseOpenAIResponse";
import TranslationOutput from "./TranslationOutput";

/**
 * Translator component provides a simple translation interface
 * with speech-to-text input, language selection, and displays
 * corrected transcript, suggestions, and translation.
 * Includes detailed error handling and error codes for debugging.
 */
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

  /**
   * Handles translation by sending the transcript to the API,
   * reading the streamed response, and updating UI state.
   * Includes error handling with error codes and HTTP status codes for easier debugging.
   * @param text - The text to translate
   */
  const handleTranslate = async (text: string) => {
    setCorrection("");
    setSuggestions("");
    setTranslatedText("");
    setSections([]);
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
        }),
      });
    } catch (err) {
      setProcessing(false);
      console.error("[TR-001] Network error during translation fetch:", err);
      setTranslatedText("Network error: Unable to reach the translation service. [TR-001]");
      return;
    }

    if (!res || !res.body) {
      setProcessing(false);
      console.error("[TR-002] No response body received from translation API.");
      setTranslatedText("Error: No response from translation service. [TR-002]");
      return;
    }

    if (!res.ok) {
      setProcessing(false);
      let errorMsg = `Translation service error. [TR-003] (HTTP ${res.status})`;
      try {
        errorMsg = `[TR-003] (HTTP ${res.status}) ${await res.text()}`;
      } catch (e) {
        // Ignore parsing error, use default message
      }
      console.error("[TR-003] Translation API error:", errorMsg);
      setTranslatedText(errorMsg);
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

        // Try parsing the response as it streams in
        try {
          const parsed = parseOpenAIResponse(resultText);
          setCorrection(parsed.correctedTarget);
          setSuggestions(parsed.suggestions);
          setTranslatedText(parsed.translation);
          setTranscript(parsed.correctedInput);
        } catch (parseErr) {
          // It's normal for parse to fail until the stream is complete, so only log for debugging
          // console.debug("[TR-004] Partial stream parse error (may be expected):", parseErr);
        }
      }
    } catch (err) {
      setProcessing(false);
      console.error("[TR-005] Error reading translation stream:", err);
      setTranslatedText("Error reading translation response. [TR-005]");
      return;
    }

    // Final parse after stream is complete
    try {
      const parsed = parseOpenAIResponse(resultText);
      setCorrection(parsed.correctedTarget);
      setSuggestions(parsed.suggestions);
      setTranslatedText(parsed.translation);
      setTranscript(parsed.correctedInput);
      // If you want to show all sections, you can setSections here
      // setSections(parsed.sections || []);
    } catch (err) {
      setProcessing(false);
      console.error("[TR-006] Error parsing translation response:", err);
      setTranslatedText("Error parsing translation response. [TR-006]");
      return;
    }

    setProcessing(false);
  };

  /**
   * Plays the translated text using the browser's SpeechSynthesis API.
   * Includes error handling for unsupported browsers or failures.
   */
  const speak = () => {
    if (!translatedText) return;
    try {
      if (!("speechSynthesis" in window)) {
        console.error("[TR-007] Speech synthesis is not supported in this browser.");
        return;
      }
      const utterance = new window.SpeechSynthesisUtterance(translatedText);
      utterance.lang = targetLang;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("[TR-008] Failed to play translation audio:", err);
    }
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
      <TranslationOutput
        correction={correction}
        suggestions={suggestions}
        translatedText={translatedText}
        processing={processing}
        speak={speak}
        sections={sections}
      />
    </main>
  );
}
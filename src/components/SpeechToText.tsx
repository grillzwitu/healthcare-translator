"use client";
import { SpeechToTextProps } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEffect, useRef } from "react";

export default function SpeechToText({
  onTranscript,
  isListening: externalIsListening,
  setIsListening: externalSetIsListening,
  inputLang,
  transcript,         // <-- add
  setTranscript,      // <-- add
}: SpeechToTextProps & { transcript: string; setTranscript: (v: string) => void }) {
  const lastSubmittedTranscript = useRef<string>("");

  const handleFinalTranscript = (finalTranscript: string) => {
    if (
      finalTranscript.trim() &&
      finalTranscript.trim() !== lastSubmittedTranscript.current
    ) {
      lastSubmittedTranscript.current = finalTranscript.trim();
      onTranscript(finalTranscript.trim());
    }
  };

  const {
    transcript: localTranscript,
    speechDetected,
    error,
    isListening,
    setIsListening,
    startListening,
    stopListening,
  } = useSpeechRecognition(inputLang, handleFinalTranscript);

  // When the parent sets a new transcript (corrected), clear the local transcript
  useEffect(() => {
    if (transcript && transcript !== localTranscript) {
      setTranscript(transcript); // ensure parent state is synced
    }
    // If the corrected transcript is set, clear the local transcript
    // (so the input shows only the corrected, not the original)
    // Optionally, you can clear the local transcript here if needed
    // setTranscript(""); // Uncomment if you want to clear after correction
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  // When local transcript changes (from speech), update parent
  useEffect(() => {
    if (!transcript && localTranscript) {
      setTranscript(localTranscript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTranscript]);

  useEffect(() => {
    if (externalIsListening !== isListening) {
      externalSetIsListening(isListening);
    }
    if (isListening) {
      lastSubmittedTranscript.current = "";
    }
  }, [isListening, externalIsListening, externalSetIsListening]);

  return (
    <div className="p-4 flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={startListening}
          disabled={isListening}
          className="p-2 rounded bg-blue-500 text-white disabled:bg-blue-300"
        >
          {isListening ? "Listening..." : "Start Speaking"}
        </button>
        <button
          onClick={stopListening}
          disabled={!isListening}
          className="p-2 rounded bg-gray-500 text-white disabled:bg-gray-300"
        >
          Stop Listening
        </button>
        <button
          type="button"
          disabled={!isListening}
          className={`p-2 rounded text-white ${
            speechDetected ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {speechDetected ? "Speech Detected" : "No Speech"}
        </button>
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      <div className="mt-4 p-2 border rounded min-h-12">
        {transcript || <span className="text-gray-400">Transcript will appear here...</span>}
      </div>
    </div>
  );
}
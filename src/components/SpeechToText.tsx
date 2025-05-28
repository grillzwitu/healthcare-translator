"use client";
import { Dispatch, SetStateAction, useRef, useState } from "react";

interface SpeechToTextProps {
  onTranscript: (text: string) => void | Promise<void>;
  isListening: boolean;
  setIsListening: Dispatch<SetStateAction<boolean>>;
}

type MySpeechRecognitionEvent = {
  results: Array<Array<{ transcript: string }>>;
};

export default function SpeechToText({
  onTranscript,
  isListening,
  setIsListening,
}: SpeechToTextProps) {
  const [transcript, setTranscript] = useState("");
  const [speechDetected, setSpeechDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    try {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionConstructor) {
        throw new Error("Speech recognition is not supported in this browser.");
      }

      if (isListening) {
        throw new Error("Already listening. Stop current session first.");
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event: MySpeechRecognitionEvent) => {
        try {
          const spokenText = event.results[event.results.length - 1][0].transcript;
          setTranscript(spokenText);
          onTranscript(spokenText);
        } catch (e) {
          setError(`Error processing speech result: ${e instanceof Error ? e.message : String(e)}`);
        }
      };

      recognition.onerror = (event) => {
        let errorMessage = "Speech recognition error occurred";
        if (event.error === 'no-speech') {
          errorMessage = "No speech was detected";
        } else if (event.error === 'audio-capture') {
          errorMessage = "Audio capture failed - check microphone permissions";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone access was denied";
        }
        setError(errorMessage);
        setIsListening(false);
        setSpeechDetected(false);
      };

      recognition.onspeechstart = () => setSpeechDetected(true);
      recognition.onspeechend = () => setSpeechDetected(false);
      recognition.onend = () => {
        setIsListening(false);
        setSpeechDetected(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setError(null); // Clear previous errors on new session
    } catch (e) {
      setError(`Failed to start speech recognition: ${e instanceof Error ? e.message : String(e)}`);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    try {
      if (!recognitionRef.current) {
        throw new Error("No active recognition session");
      }
      
      recognitionRef.current.stop();
      setIsListening(false);
      setSpeechDetected(false);
      setError(null);
    } catch (e) {
      setError(`Error stopping recognition: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

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
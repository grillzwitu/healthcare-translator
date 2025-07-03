"use client";
import { SpeechToTextProps } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useEffect, useRef } from "react";

/**
 * SpeechToText component handles speech recognition, transcript display,
 * and error reporting for the chat panels.
 *
 * Error handling:
 * - All errors are logged with error codes for easier debugging.
 * - Web Speech API errors are surfaced from the custom hook with codes (e.g., [SR-004]).
 * - UI errors (state sync, transcript handling) use [STT-001]... codes.
 *
 * @param onTranscript - Callback when a final transcript is ready
 * @param isListening - External listening state
 * @param setIsListening - Setter for listening state
 * @param inputLang - Language code for recognition
 * @param transcript - Current transcript text
 * @param setTranscript - Setter for transcript text
 */
export default function SpeechToText({
  onTranscript,
  isListening: externalIsListening,
  setIsListening: externalSetIsListening,
  inputLang,
  transcript,
  setTranscript,
}: SpeechToTextProps & { transcript: string; setTranscript: (v: string) => void }) {
  // Ref to track the last submitted transcript to avoid duplicates
  const lastSubmittedTranscript = useRef<string>("");

  /**
   * Handles the final transcript from speech recognition.
   * Avoids submitting duplicate or empty transcripts.
   * Logs errors with [STT-001].
   */
  const handleFinalTranscript = (finalTranscript: string) => {
    try {
      if (
        finalTranscript.trim() &&
        finalTranscript.trim() !== lastSubmittedTranscript.current
      ) {
        lastSubmittedTranscript.current = finalTranscript.trim();
        onTranscript(finalTranscript.trim());
      }
    } catch (err) {
      // Log any unexpected errors for debugging
      console.error("[STT-001] Error handling final transcript:", err);
    }
  };

  // Custom speech recognition hook
  const {
    transcript: localTranscript,
    speechDetected,
    error,
    isListening,
    startListening,
    stopListening,
  } = useSpeechRecognition(inputLang, handleFinalTranscript);

  /**
   * Syncs the parent transcript state with the local transcript.
   * Ensures the displayed transcript is always up to date.
   * Logs errors with [STT-002].
   */
  useEffect(() => {
    try {
      if (transcript && transcript !== localTranscript) {
        setTranscript(transcript); // ensure parent state is synced
      }
      // Optionally clear the local transcript after correction
      // setTranscript(""); // Uncomment if you want to clear after correction
    } catch (err) {
      console.error("[STT-002] Error syncing transcript state:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  /**
   * Updates the parent transcript when the local transcript changes (from speech).
   * Logs errors with [STT-003].
   */
  useEffect(() => {
    try {
      if (!transcript && localTranscript) {
        setTranscript(localTranscript);
      }
    } catch (err) {
      console.error("[STT-003] Error updating parent transcript from local:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localTranscript]);

  /**
   * Keeps the external listening state in sync with the local state.
   * Resets the last submitted transcript when listening starts.
   * Logs errors with [STT-004].
   */
  useEffect(() => {
    try {
      if (externalIsListening !== isListening) {
        externalSetIsListening(isListening);
      }
      if (isListening) {
        lastSubmittedTranscript.current = "";
      }
    } catch (err) {
      console.error("[STT-004] Error syncing listening state:", err);
    }
  }, [isListening, externalIsListening, externalSetIsListening]);

  return (
    <div className="p-4 flex flex-col gap-2">
      {/* Speech control buttons */}
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
      {/* Error display */}
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
          {/* Error code for easier debugging */}
          Error: {error}
        </div>
      )}
      {/* Transcript display */}
      <div className="mt-4 p-2 border rounded min-h-12">
        {transcript || <span className="text-gray-400">Transcript will appear here...</span>}
      </div>
    </div>
  );
}
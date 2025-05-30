import { useRef, useState } from "react";
import { getSpeechRecognitionErrorMessage } from "./speechRecognitionErrors";

/**
 * Custom React hook for speech recognition using the Web Speech API.
 * Handles transcript accumulation, error reporting, and speech detection.
 * Includes detailed error handling, error codes, and Web Speech API error codes for debugging.
 *
 * @param inputLang - The language code for recognition (IETF BCP 47)
 * @param onFinalTranscript - Callback for when a final transcript is ready
 * @returns Speech recognition state and control functions
 */
export function useSpeechRecognition(
  inputLang: string,
  onFinalTranscript: (text: string) => void | Promise<void>
) {
  const [transcript, setTranscript] = useState("");
  const [speechDetected, setSpeechDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const fullTranscriptRef = useRef(""); // Accumulate all final results

  /**
   * Starts the speech recognition session.
   * Handles browser support, session state, and error reporting.
   * Uses Web Speech API error codes and custom error codes for debugging.
   */
  const startListening = () => {
    try {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        // Error code: SR-001
        setError("[SR-001] Speech recognition is not supported in this browser.");
        setIsListening(false);
        return;
      }

      if (isListening) {
        // Error code: SR-002
        setError("[SR-002] Already listening. Stop current session first.");
        return;
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = inputLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      fullTranscriptRef.current = "";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let newFinal = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptPiece = result[0].transcript;
          if (result.isFinal) {
            fullTranscriptRef.current += transcriptPiece + " ";
            newFinal = true;
          } else {
            interimTranscript += transcriptPiece;
          }
        }
        setTranscript(fullTranscriptRef.current + interimTranscript);

        // Debounce on each new final result
        if (newFinal) {
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
            if (fullTranscriptRef.current.trim()) {
              try {
                onFinalTranscript(fullTranscriptRef.current.trim());
              } catch (err) {
                // Error code: SR-003
                setError(
                  `[SR-003] Error in onFinalTranscript callback: ${
                    err instanceof Error ? err.message : String(err)
                  }`
                );
              }
              fullTranscriptRef.current = "";
              setTranscript("");
            }
          }, 1000); // 1 second after last final result
        }
      };

      recognition.onerror = (event) => {
        const errorMessage = getSpeechRecognitionErrorMessage(event.error);
        setError(errorMessage);
        setIsListening(false);
        setSpeechDetected(false);
      };

      recognition.onspeechstart = () => setSpeechDetected(true);

      recognition.onspeechend = () => setSpeechDetected(false);

      recognition.onend = () => {
        setIsListening(false);
        setSpeechDetected(false);
        // Flush any pending transcript on end
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        if (fullTranscriptRef.current.trim()) {
          try {
            onFinalTranscript(fullTranscriptRef.current.trim());
          } catch (err) {
            // Error code: SR-007
            setError(
              `[SR-007] Error in onFinalTranscript callback (onend): ${
                err instanceof Error ? err.message : String(err)
              }`
            );
          }
          fullTranscriptRef.current = "";
          setTranscript("");
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setError(null);
    } catch (e) {
      setError(
        `[SR-008] Failed to start speech recognition: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
      setIsListening(false);
    }
  };

  /**
   * Stops the speech recognition session.
   * Handles session state and error reporting.
   */
  const stopListening = () => {
    try {
      if (!recognitionRef.current) {
        // Error code: SR-009
        setError("[SR-009] No active recognition session");
        return;
      }
      recognitionRef.current.stop();
      setIsListening(false);
      setSpeechDetected(false);
      setError(null);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    } catch (e) {
      setError(
        `[SR-010] Error stopping recognition: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  };

  return {
    transcript,
    speechDetected,
    error,
    isListening,
    setIsListening,
    startListening,
    stopListening,
  };
}
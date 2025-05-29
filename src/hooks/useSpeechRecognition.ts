import { useRef, useState } from "react";

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
              onFinalTranscript(fullTranscriptRef.current.trim());
              fullTranscriptRef.current = "";
              setTranscript("");
            }
          }, 1500); // 1.5 seconds after last final result
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
        // Flush any pending transcript on end
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        if (fullTranscriptRef.current.trim()) {
          onFinalTranscript(fullTranscriptRef.current.trim());
          fullTranscriptRef.current = "";
          setTranscript("");
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setError(null);
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
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    } catch (e) {
      setError(`Error stopping recognition: ${e instanceof Error ? e.message : String(e)}`);
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
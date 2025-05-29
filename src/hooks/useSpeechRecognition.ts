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

      let fullTranscript = "";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptPiece = result[0].transcript;
          if (result.isFinal) {
            fullTranscript += transcriptPiece + " ";
            // Only call onFinalTranscript when a result is final
            onFinalTranscript(fullTranscript.trim());
          } else {
            interimTranscript += transcriptPiece;
          }
        }
        setTranscript(fullTranscript + interimTranscript);
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
        // Optionally, call onFinalTranscript here if you want to handle end-of-speech as final
        // onFinalTranscript(fullTranscript.trim());
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
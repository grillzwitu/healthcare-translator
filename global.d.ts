declare global {
  interface Window {
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }

  interface SpeechRecognition {
    start(): void;
    stop(): void;
    abort(): void;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onspeechstart: (() => void) | null;
    onspeechend: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    // ...other properties as needed
  }

  interface SpeechRecognitionEvent {
    results: Array<Array<{ transcript: string }>>;
  }
}

export {};

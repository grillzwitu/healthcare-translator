/**
 * Global TypeScript declarations for browser SpeechRecognition API.
 * 
 * Error handling notes:
 * - Always check for the existence of window.SpeechRecognition or window.webkitSpeechRecognition before use.
 *   Log errors with code [SR-001] if not available.
 * - All event handlers (onerror, onresult, etc.) should log errors with descriptive error codes for debugging.
 * - Web Speech API error codes should be surfaced in UI and logs (see [SR-004]... codes).
 * - If you extend these interfaces, document error handling expectations for new properties.
 */

declare global {
  interface Window {
    /**
     * Chrome and some browsers use webkitSpeechRecognition.
     * Always check for existence before instantiating.
     */
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
    /**
     * Standard SpeechRecognition constructor.
     * Always check for existence before instantiating.
     */
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }

  /**
   * SpeechRecognition interface for browser speech recognition.
   * All event handlers should log errors with error codes for easier debugging.
   */
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
    /**
     * onerror event handler receives an event with an error code string.
     * Always log the error code for debugging (see [SR-004]... codes).
     */
    onerror: ((event: { error: string }) => void) | null;
    // ...other properties as needed
  }

  /**
   * Represents a single recognition alternative.
   */
  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  /**
   * Represents a single recognition result (may have multiple alternatives).
   */
  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
  }

  /**
   * Represents a list of recognition results.
   */
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  /**
   * Event object passed to onresult and similar handlers.
   */
  interface SpeechRecognitionEvent {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }
}

export {};

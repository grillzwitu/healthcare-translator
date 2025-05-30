/**
 * Maps Web Speech API error codes to detailed error messages.
 * Use this function to provide user-friendly and debug-friendly error messages
 * in your speech recognition UI. Always log the error code for easier debugging.
 *
 * @param error - The error code from the SpeechRecognitionErrorEvent.
 * @returns A descriptive error message with error code.
 *
 * Web Speech API error codes:
 * - "no-speech"
 * - "audio-capture"
 * - "not-allowed"
 * - "aborted"
 * - "network"
 * - "service-not-allowed"
 * - "bad-grammar"
 * - "language-not-supported"
 *
 * If you encounter an unknown error code, it will return a generic error message with code [SR-004].
 */
export function getSpeechRecognitionErrorMessage(error: string): string {
  switch (error) {
    case "no-speech":
      // No speech detected from the user.
      return "[SR-004][no-speech] No speech was detected.";
    case "audio-capture":
      // Microphone not found or not accessible.
      return "[SR-005][audio-capture] Audio capture failed - check microphone permissions.";
    case "not-allowed":
      // User denied microphone access.
      return "[SR-006][not-allowed] Microphone access was denied.";
    case "aborted":
      // Speech input was aborted by the user or system.
      return "[SR-011][aborted] Speech input was aborted.";
    case "network":
      // Network communication failed.
      return "[SR-012][network] Network communication required for recognition failed.";
    case "service-not-allowed":
      // Speech recognition service is not allowed, possibly due to browser policy.
      return "[SR-013][service-not-allowed] Speech recognition service not allowed.";
    case "bad-grammar":
      // Provided grammar is invalid.
      return "[SR-014][bad-grammar] Grammar provided was invalid.";
    case "language-not-supported":
      // The requested language is not supported.
      return "[SR-015][language-not-supported] The language is not supported.";
    default:
      // Unknown error code, log for further investigation.
      console.error(`[SR-004][unknown] Unknown speech recognition error code: ${error}`);
      return `[SR-004][unknown] Speech recognition error occurred (code: ${error})`;
  }
}
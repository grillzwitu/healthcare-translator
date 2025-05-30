import { TranslationOutputProps } from "@/types";

/**
 * TranslationOutput component displays the results of the translation process,
 * including corrected transcript, suggestions, translation, and any additional sections.
 * Handles UI feedback for processing state and provides a button to play the translation audio.
 * Includes error handling and error codes for easier debugging.
 *
 * @param correction - The corrected transcript string
 * @param suggestions - Suggestions string
 * @param translatedText - The translated text string
 * @param processing - Whether the translation is in progress
 * @param speak - Function to play the translation audio
 * @param sections - Additional sections to display (optional)
 */
export default function TranslationOutput({
  correction,
  suggestions,
  translatedText,
  processing,
  speak,
  sections,
}: TranslationOutputProps) {
  /**
   * Handles click event for the "Speak Translation" button.
   * Catches and logs errors for debugging.
   */
  const handleSpeak = () => {
    try {
      speak();
    } catch (err) {
      // Error code: TO-001
      console.error("[TO-001] Error playing translation audio:", err);
      alert("An error occurred while trying to play the translation audio. [TO-001]");
    }
  };

  return (
    <section>
      {/* Processing spinner */}
      {processing && (
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Processing...
        </div>
      )}

      {/* Corrected transcript output */}
      {correction && (
        <div className="mt-4 p-2 border rounded bg-blue-50">
          <strong>Corrected Transcript:</strong>
          <div>{correction}</div>
        </div>
      )}

      {/* Suggestions output */}
      {suggestions && (
        <div className="mt-2 p-2 border rounded bg-yellow-50">
          <strong>Suggestions:</strong>
          <div>{suggestions}</div>
        </div>
      )}

      {/* Translation output with speak button and error handling */}
      {translatedText && (
        <div className="mt-2 p-2 border rounded bg-green-50">
          <strong>Translation:</strong>
          <div>{translatedText}</div>
          <button
            onClick={handleSpeak}
            className="mt-2 bg-green-500 text-white p-2 rounded"
            aria-label="Play translation audio"
          >
            Speak Translation
          </button>
        </div>
      )}

      {/* Additional sections output */}
      {sections.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {sections.map(({ heading, content }) => (
            <div key={heading} className="p-2 border rounded">
              <strong>{heading}</strong>
              <div>{content}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
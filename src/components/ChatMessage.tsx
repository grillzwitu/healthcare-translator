import { Message } from "@/types";
import { getLanguageLabel, getRoleLabel } from "@/utils/chatUtils";

/**
 * ChatMessage component displays a single chat message with suggestions,
 * corrected transcript, and translation, styled according to the sender.
 * Includes error handling for speech synthesis.
 *
 * @param msg - The message object containing sender, language info, and content.
 */
export default function ChatMessage({ msg }: { msg: Message }) {
  const isPatient = msg.sender === "Patient";

  /**
   * Handles playing the translation using the browser's SpeechSynthesis API.
   * Catches and logs errors if speech synthesis is not supported or fails.
   */
  const handleSpeak = () => {
    try {
      if (!("speechSynthesis" in window)) {
        // Speech synthesis not supported
        console.error("Speech synthesis is not supported in this browser.");
        return;
      }
      const utter = new window.SpeechSynthesisUtterance(msg.translation);
      utter.lang = msg.targetLang;
      window.speechSynthesis.speak(utter);
    } catch (err) {
      // Log any unexpected errors for debugging
      console.error("Failed to play translation audio:", err);
    }
  };

  return (
    <div
      className={`
        rounded p-3 shadow-sm text-left
        max-w-xl
        md:max-w-3xl
        ${isPatient
          ? "bg-blue-50 border-l-4 border-blue-400 ml-2 mr-auto md:ml-auto md:mr-[6vw] lg:mr-[10vw] md:self-end"
          : "bg-green-50 border-l-4 border-green-400 mr-2 ml-auto md:mr-auto md:ml-[6vw] lg:ml-[10vw] md:self-start"
        }
      `}
      style={{ width: "fit-content" }}
    >
      {/* Message header with sender and language info */}
      <div className="mb-1 text-xs text-gray-500 font-normal">
        {getRoleLabel(msg.sender)} ({getLanguageLabel(msg.inputLang)} → {getLanguageLabel(msg.targetLang)})
      </div>

      {/* Suggestions block, if present */}
      {msg.suggestions && (
        <div className="mb-2 p-2 rounded bg-yellow-50 border border-yellow-300">
          <div className="flex items-center gap-1 text-xs text-yellow-700 mb-1">
            <span>💡</span>
            <span>{msg.suggestionsHeading || "Suggestions"}</span>
          </div>
          <div className="text-xs text-yellow-900">
            {msg.suggestions}
          </div>
        </div>
      )}

      {/* Corrected transcript block, if present */}
      {msg.corrected && (
        <div className="mb-2">
          <div className="flex items-center gap-1 text-xs text-blue-700 mb-1">
            <span>✏️</span>
            <span>{msg.correctedHeading || "Corrected Transcript"}</span>
          </div>
          <div className="bg-white border border-blue-100 rounded px-3 py-2 font-mono text-sm">
            {msg.corrected}
          </div>
        </div>
      )}

      {/* Translation block, if present */}
      {msg.translation && (
        <div className="mb-1">
          <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
            <span>🌐</span>
            <span>{msg.translationHeading || "Translation"}</span>
          </div>
          <div className="bg-green-50 border border-green-100 rounded px-3 py-2 text-base">
            {msg.translation}
            <button
              className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded"
              aria-label="Play translation audio"
              onClick={handleSpeak}
            >
              🔊
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

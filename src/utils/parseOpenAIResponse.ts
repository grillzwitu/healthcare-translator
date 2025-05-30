import type { ParsedAIResponse, ParsedAIResponseSection } from "@/types";

/**
 * Parses the OpenAI response text (expected to be a JSON array of objects).
 * Handles invalid JSON, missing fields, and malformed objects gracefully.
 * Logs errors with error codes for easier debugging.
 *
 * Error codes:
 * - [PARSE-001]: Parsed response is not an array.
 * - [PARSE-002]: Failed to parse JSON.
 * - [PARSE-003]: Expected object at index is missing or malformed.
 * - [PARSE-004]: Object at index does not have exactly one key.
 *
 * @param resultText - The raw response text from OpenAI (should be a JSON array).
 * @returns ParsedAIResponse object with extracted fields or empty/defaults on error.
 */
export function parseOpenAIResponse(resultText: string): ParsedAIResponse {
  let parsed: Record<string, unknown>[] = [];
  try {
    const temp = JSON.parse(resultText);
    if (!Array.isArray(temp)) {
      console.error("[PARSE-001] Parsed OpenAI response is not an array.", temp);
    } else {
      parsed = temp as Record<string, unknown>[];
    }
  } catch (e) {
    console.error("[PARSE-002] Failed to parse OpenAI response as JSON.", e, resultText);
    return {
      correctedInput: "",
      correctedTarget: "",
      correctedTargetHeading: "",
      suggestions: "",
      suggestionsHeading: "",
      translation: "",
      translationHeading: "",
      sections: [],
    };
  }

  /**
   * Helper to extract key-value from an object at a given index.
   * Ensures content is always a string.
   */
  const getKV = (idx: number): ParsedAIResponseSection => {
    const obj = parsed[idx];
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      console.error(`[PARSE-003] Expected object at index ${idx} in OpenAI response array.`, obj);
      return { heading: "", content: "" };
    }
    const keys = Object.keys(obj);
    if (keys.length !== 1) {
      console.error(`[PARSE-004] Object at index ${idx} does not have exactly one key.`, obj);
      return { heading: "", content: "" };
    }
    const heading = keys[0];
    const content = typeof obj[heading] === "string" ? obj[heading] as string : "";
    return { heading, content };
  };

  // Extract expected sections
  const cInput = getKV(0);
  const cTarget = getKV(1);
  const sugg = getKV(2);
  const trans = getKV(3);

  return {
    correctedInput: cInput.content,
    correctedTarget: cTarget.content,
    correctedTargetHeading: cTarget.heading,
    suggestions: sugg.content,
    suggestionsHeading: sugg.heading,
    translation: trans.content,
    translationHeading: trans.heading,
    sections: [cInput, cTarget, sugg, trans],
  };
}
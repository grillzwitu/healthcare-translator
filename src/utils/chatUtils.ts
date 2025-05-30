import { LANGUAGES } from "@/constants/languages";
import { Role } from "@/types";

/**
 * Returns the human-readable label for a language code.
 * If the code is not found in LANGUAGES, logs an error with code [CHAT-001].
 *
 * @param code - The language code (IETF BCP 47)
 * @returns The language label or the code itself if not found.
 */
export function getLanguageLabel(code: string): string {
  const lang = LANGUAGES.find(l => l.code === code);
  if (!lang) {
    // Error code: CHAT-001
    console.error(`[CHAT-001] Invalid or unsupported language code: ${code}`);
    return code;
  }
  return lang.label;
}

/**
 * Returns the display label for a chat participant role.
 * If the role is not recognized, logs an error with code [CHAT-002].
 *
 * @param sender - The sender role ("Patient" or "Provider")
 * @returns The display label for the role.
 */
export function getRoleLabel(sender: Role): string {
  if (sender === "Patient") return "Patient";
  if (sender === "Provider") return "Health Care Provider";
  // Error code: CHAT-002
  console.error(`[CHAT-002] Invalid role: ${sender}`);
  return sender;
}
import { NextRequest } from "next/server";
import { AzureOpenAI } from "openai";
import { LANGUAGES } from "@/constants/languages";

/**
 * POST handler for translation and correction requests.
 * Accepts JSON with text, inputLang, targetLang, and role.
 * Returns a streamed response from Azure OpenAI with only the generated text.
 * 
 * Error handling:
 * - [API-001]: Invalid JSON in request body (400)
 * - [API-002]: Missing or invalid fields (400)
 * - [API-003]: Input text too long (413)
 * - [API-004]: Invalid language code (400)
 * - [API-005]: Malicious input detected (400)
 * - [API-006]: Azure OpenAI API error (propagates Azure error/status)
 * - [API-007]: Streaming error (502)
 * - [API-999]: Unexpected server error (500)
 */

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;
const apiVersion = "2024-04-01-preview";
const modelName = deployment;

const client = new AzureOpenAI({
  endpoint,
  apiKey,
  deployment,
  apiVersion,
});

/**
 * Sanitizes input to reduce prompt injection risk.
 * Removes common prompt delimiters and suspicious patterns.
 */
function sanitizeForPromptInjection(input: string): string {
  return input.replace(/```|---|###|system:|user:/gi, "");
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("[API-001] Failed to parse JSON body:", err);
      return new Response("Invalid JSON in request body [API-001]", { status: 400 });
    }

    const { text, inputLang, targetLang, role } = body || {};

    // Validate input types and presence
    if (
      typeof text !== "string" ||
      typeof inputLang !== "string" ||
      typeof targetLang !== "string" ||
      (role !== "Provider" && role !== "Patient")
    ) {
      console.error("[API-002] Missing or invalid fields in request body:", body);
      return new Response("Invalid request body: text, inputLang, targetLang, and role are required. [API-002]", { status: 400 });
    }

    // Limit text length (e.g., 2000 chars)
    if (text.length > 2000) {
      console.error("[API-003] Input text too long:", text.length);
      return new Response("Input text too long. Maximum 2000 characters allowed. [API-003]", { status: 413 });
    }

    // Whitelist language codes (use only the language part before '-')
    const allowedLangs = LANGUAGES.map(l => l.code.split("-")[0]);
    if (!allowedLangs.includes(inputLang) || !allowedLangs.includes(targetLang)) {
      console.error("[API-004] Invalid language code(s):", inputLang, targetLang);
      return new Response("Invalid language code. [API-004]", { status: 400 });
    }

    // Reject input with suspicious patterns (basic XSS/malicious input)
    if (/<script|<\/script|onerror=|onload=|<img|<iframe|<svg/i.test(text)) {
      console.error("[API-005] Malicious input detected:", text);
      return new Response("Malicious input detected. [API-005]", { status: 400 });
    }

    // Sanitize input for prompt injection
    const sanitizedText = sanitizeForPromptInjection(text);

    // Dynamic prompt based on role
    const rolePrompt =
      role === "Provider"
        ? `You are a medical transcription and translation assistant. The following transcript is from a healthcare provider speaking to a patient.
First, correct any errors in the transcript and clarify ambiguous or incorrect statements, preserving medical terms and intended meaning.
If there are multiple possible corrections, provide suggestions.
Then, translate the best/corrected version to ${targetLang} using patient-friendly language.

**Suggestions must help the patient understand what the provider is saying. Address the suggestions directly to the patient, never to yourself. Each suggestion must start with "I think the healthcare provider..." translated into ${targetLang}. Never refer to yourself as the provider or patient.**
**Suggestions and all headings must be written in ${targetLang} (the same language as the translation).**

Respond ONLY with a valid JSON array of objects, each with a single key (the heading in the target language) and value (the content). Do not include any extra text or explanation.

The format must be:

[
  { "Corrected Transcript in ${inputLang}": "<corrected transcript here in the input language>" },
  { "<translation of 'Corrected Transcript' in ${targetLang}>": "<corrected transcript here in the target language>" },
  { "<translation of 'Suggestions for Patient' in ${targetLang}>": "<each suggestion as a bullet point, or 'None' if there are no suggestions>" },
  { "<translation of 'Translation' in ${targetLang}>": "<translated text here>" }
]

Replace the keys with the correct headings in the target language, and fill in the values as described.
`
        : `You are a medical transcription and translation assistant. The following transcript is from a patient speaking to a healthcare provider.
First, correct any errors in the transcript and clarify ambiguous or incorrect statements, preserving medical terms and intended meaning.
If there are multiple possible corrections, provide suggestions.
Then, translate the best/corrected version to ${targetLang} using health care provider-friendly language.

**Suggestions must help the provider understand what the patient is saying. Address the suggestions directly to the provider, never to yourself. Each suggestion must start with "I think the patient..." translated into ${targetLang}. Never refer to yourself as the provider or patient.**
**Suggestions and all headings must be written in ${targetLang} (the same language as the translation).**

Respond ONLY with a valid JSON array of objects, each with a single key (the heading in the target language) and value (the content). Do not include any extra text or explanation.

The format must be:

[
  { "Corrected Transcript in ${inputLang}": "<corrected transcript here in the input language>" },
  { "<translation of 'Corrected Transcript' in ${targetLang}>": "<corrected transcript here in the target language>" },
  { "<translation of 'Suggestions for Health Care Provider' in ${targetLang}>": "<each suggestion as a bullet point, or 'None' if there are no suggestions>" },
  { "<translation of 'Translation' in ${targetLang}>": "<translated text here>" }
]

Replace the keys with the correct headings in the target language, and fill in the values as described.
`;

    // Call Azure OpenAI and stream the response
    let openaiStream;
    try {
      openaiStream = await client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: rolePrompt,
          },
          { role: "user", content: sanitizedText },
        ],
        max_completion_tokens: 800,
        temperature: 0.3,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        model: modelName,
        stream: true,
      });
    } catch (err: any) {
      // Azure OpenAI error handling
      if (err?.response) {
        // Azure OpenAI error with response
        const errorBody = await err.response.text();
        console.error("[API-006] Azure OpenAI API error:", err.response.status, errorBody);
        return new Response(
          `OpenAI API error (${err.response.status}) [API-006]: ${errorBody}`,
          { status: err.response.status }
        );
      }
      // Generic error
      console.error("[API-006] OpenAI API error:", err);
      return new Response("Failed to connect to OpenAI API [API-006]", { status: 502 });
    }

    // Transform the OpenAI stream to only send delta.content as text
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openaiStream) {
            // Each chunk is a JSON object
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          // Streaming error
          console.error("[API-007] Streaming error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    // Catch-all for unexpected errors
    console.error("[API-999] Unexpected error in /api/translate:", err);
    return new Response("Internal server error [API-999]", { status: 500 });
  }
}

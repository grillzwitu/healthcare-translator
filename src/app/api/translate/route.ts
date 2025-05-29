import { NextRequest } from "next/server";
import { AzureOpenAI } from "openai";

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

export async function POST(req: NextRequest) {
  const { text, inputLang, targetLang, role } = await req.json(); // <-- add inputLang here

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
  { "<translation of 'Suggestions for Patient' in ${targetLang}>": "<each suggestion as a bullet point, or 'None' if there are no suggestions>" },
  { "<translation of 'Translation' in ${targetLang}>": "<translated text here>" }
]

Replace the keys with the correct headings in the target language, and fill in the values as described.
`;

  const openaiStream = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: rolePrompt,
      },
      { role: "user", content: text },
    ],
    max_completion_tokens: 800,
    temperature: 0.3,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    model: modelName,
    stream: true,
  });

  // Transform the OpenAI stream to only send delta.content as text
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of openaiStream) {
        // Each chunk is a JSON object
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

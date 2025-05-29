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
  const { text, targetLang, role } = await req.json();

  // Dynamic prompt based on role
  const rolePrompt =
    role === "Provider"
      ? `You are a medical transcription and translation assistant. The following transcript is from a healthcare provider speaking to a patient. 
First, correct any errors in the transcript and clarify ambiguous or incorrect statements, preserving medical terms and intended meaning. 
If there are multiple possible corrections, provide suggestions. 
Then, translate the best/corrected version to ${targetLang} using patient-friendly language. 
**Suggestions should be written to help the patient better understand the provider's speech. Address the suggestions directly to the patient. Each suggestion must start with "I think".**
**Suggestions must be written in ${targetLang} (the same language as the translation).**
Respond in this format:
- Corrected Transcript: <text>
- Suggestions for Patient: <list, if any>
- Translation: <translated text>`
      : `You are a medical transcription and translation assistant. The following transcript is from a patient speaking to a healthcare provider. 
First, correct any errors in the transcript and clarify ambiguous or incorrect statements, preserving medical terms and intended meaning. 
If there are multiple possible corrections, provide suggestions. 
Then, translate the best/corrected version to ${targetLang} using health care provider-friendly language. 
**Suggestions should be written to help the provider better understand the patient's speech. Address the suggestions directly to the provider. Each suggestion must start with "I think".**
**Suggestions must be written in ${targetLang} (the same language as the translation).**
Respond in this format:
- Corrected Transcript: <text>
- Suggestions for Provider: <list, if any>
- Translation: <translated text>`;

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

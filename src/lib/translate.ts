// Async function to translate text using OpenAI API
import { AzureOpenAI } from "openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;
const apiVersion = "2024-04-01-preview";
const modelName = deployment; // Use deployment name as model

const client = new AzureOpenAI({
  endpoint,
  apiKey,
  dangerouslyAllowBrowser: true, // Allow browser usage
  deployment,
  apiVersion,
});

export async function translateText(text: string, targetLang: string) {
  const response = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a medical transcription and translation assistant. 
        First, correct any errors in the following transcript and clarify ambiguous or incorrect statements. 
        If there are multiple possible corrections, provide suggestions. 
        Then, translate the best/corrected version to ${targetLang} using patient-friendly language. 
        Respond in this format:
        - Corrected Transcript: <text>
        - Suggestions: <list, if any>
        - Translation: <translated text>`,
      },
      { role: "user", content: text },
    ],
    max_completion_tokens: 800,
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    model: modelName,
  });

  if (response?.error !== undefined && response.status !== "200") {
    throw response.error;
  }
  return response.choices[0]?.message?.content || "Translation failed";
}

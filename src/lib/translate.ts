// Async function to translate text using OpenAI API
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Enable browser usage
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultHeaders: {
    "api-key": process.env.AZURE_OPENAI_API_KEY!,
  },
  defaultQuery: {
    "api-version": "2025-03-01-preview",
  },
});

export async function translateText(text: string, targetLang: string) {
  const response = await openai.chat.completions.create({
    // Use your deployment name as the model
    model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
    messages: [
      {
        role: "system",
        content: `Translate the following medical phrase to ${targetLang}. Use patient-friendly language.`,
      },
      { role: "user", content: text },
    ],
  });
  return response.choices[0]?.message?.content || "Translation failed";
}

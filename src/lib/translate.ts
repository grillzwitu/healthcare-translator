// Async function to translate text using OpenAI API
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT, // e.g., https://YOUR-RESOURCE-NAME.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT-NAME
  defaultHeaders: {
    "api-key": process.env.AZURE_OPENAI_API_KEY!,
  },
  defaultQuery: {
    "api-version": "2024-02-15-preview", // or your Azure API version
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

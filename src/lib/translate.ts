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
  try {
    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Translate the following medical phrase to ${targetLang}. Use patient-friendly language.`,
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

    return response.choices[0]?.message?.content || "Translation failed";
  } catch (error) {
    throw new Error(`Translation failed: ${error}`);
  }
}

// Async function to translate text using OpenAI API
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true,
});

export async function translateText(text: string, targetLang: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
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

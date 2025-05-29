export function parseOpenAIResponse(resultText: string) {
  const correctedMatch = resultText.match(/- Corrected Transcript:\s*([\s\S]*?)(?=- Suggestions:|$)/i);
  const suggestionsMatch = resultText.match(/- Suggestions:\s*([\s\S]*?)(?=- Translation:|$)/i);
  const translationMatch = resultText.match(/- Translation:\s*([\s\S]*)/i);

  return {
    corrected: correctedMatch ? correctedMatch[1].trim() : "",
    suggestions: suggestionsMatch ? suggestionsMatch[1].trim() : "",
    translation: translationMatch ? translationMatch[1].trim() : "",
  };
}
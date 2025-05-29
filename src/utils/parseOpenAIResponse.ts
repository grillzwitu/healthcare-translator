export function parseOpenAIResponse(resultText: string) {
  // Capture [Heading]: content pairs, preserving heading text
  const sectionRegex = /\[([^\]]+)\]:\s*([\s\S]*?)(?=\n\[|$)/g;
  const sections: { heading: string; content: string }[] = [];
  let match;
  while ((match = sectionRegex.exec(resultText)) !== null) {
    sections.push({
      heading: match[1].trim(),
      content: match[2].trim(),
    });
  }
  // For the input box, use the first section's content as the corrected transcript
  return {
    sections,
    corrected: sections[0]?.content || "",
  };
}
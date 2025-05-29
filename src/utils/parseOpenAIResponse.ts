import type { ParsedAIResponse } from "@/types";

export function parseOpenAIResponse(resultText: string): ParsedAIResponse {
  let parsed: any[] = [];
  try {
    parsed = JSON.parse(resultText);
  } catch (e) {
    // Handle invalid JSON gracefully
    return {
      correctedInput: "",
      correctedTarget: "",
      correctedTargetHeading: "",
      suggestions: "",
      suggestionsHeading: "",
      translation: "",
      translationHeading: "",
      sections: [],
    };
  }

  // Each object has a single key-value pair
  const getKV = (idx: number) => {
    const obj = parsed[idx];
    if (!obj) return { heading: "", content: "" };
    const heading = Object.keys(obj)[0];
    const content = obj[heading];
    return { heading, content };
  };

  const cInput = getKV(0);
  const cTarget = getKV(1);
  const sugg = getKV(2);
  const trans = getKV(3);

  return {
    correctedInput: cInput.content,
    correctedTarget: cTarget.content,
    correctedTargetHeading: cTarget.heading,
    suggestions: sugg.content,
    suggestionsHeading: sugg.heading,
    translation: trans.content,
    translationHeading: trans.heading,
    sections: [cInput, cTarget, sugg, trans],
  };
}
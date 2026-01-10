// Helper to parse JSON from AI responses that might include markdown code blocks

export function parseAIJson<T>(text: string): T {
  let jsonText = text.trim();

  // Strip markdown code blocks if present
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith("```")) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  return JSON.parse(jsonText) as T;
}

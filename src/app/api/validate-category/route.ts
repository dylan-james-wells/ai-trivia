import { NextResponse } from "next/server";
import { getAnthropicClient, MODEL } from "@/lib/anthropic";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { parseAIJson } from "@/lib/parse-json";

export async function POST(request: Request) {
  // Rate limiting
  const ip = getClientIP(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again.", resetIn: rateLimit.resetIn },
      { status: 429 }
    );
  }

  try {
    const { category } = await request.json();

    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const trimmed = category.trim();
    if (trimmed.length === 0 || trimmed.length > 100) {
      return NextResponse.json({ error: "Category must be 1-100 characters" }, { status: 400 });
    }

    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are validating a category for a trivia game. The user entered: "${trimmed}"

Determine if this is a valid trivia category. A valid category:
1. Is recognizable as a coherent topic (not random gibberish like "asdfgh" or "dsjkdsalkj")
2. Could have trivia questions written about it

IMPORTANT: Be permissive! This is a trivia game for adults. Topics like history, war, weapons, alcohol, gambling, true crime, sexuality, and other mature subjects are perfectly acceptable. The only things to reject are:
- Pure gibberish/nonsense text
- Explicit sexual descriptions (but trivia about the adult entertainment industry is allowed)
- Content involving minors in sexual contexts
- Content promoting illegal activity against specific people

Respond in JSON format:
{
  "valid": true/false,
  "interpretation": "Your understanding of what this category means (1-2 sentences)",
  "reason": "If invalid, explain why briefly"
}

Only respond with the JSON, no other text.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result = parseAIJson<{ valid: boolean; interpretation: string; reason?: string }>(content.text);

    return NextResponse.json({
      valid: result.valid,
      interpretation: result.interpretation,
      reason: result.reason,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("Error validating category:", error);
    return NextResponse.json(
      { error: "Failed to validate category" },
      { status: 500 }
    );
  }
}

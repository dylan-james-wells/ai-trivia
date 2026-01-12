import { NextResponse } from "next/server";
import { getAnthropicClient, MODEL } from "@/lib/anthropic";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { parseAIJson } from "@/lib/parse-json";
import { TOTAL_CATEGORIES } from "@/types/game";

interface SuggestedCategory {
  name: string;
  interpretation: string;
}

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
    const { existingCategories } = await request.json();
    const existing = Array.isArray(existingCategories) ? existingCategories : [];
    const needed = TOTAL_CATEGORIES - existing.length;

    if (needed <= 0) {
      return NextResponse.json({ error: "All categories already selected" }, { status: 400 });
    }

    const client = getAnthropicClient();

    let prompt: string;

    if (existing.length === 0) {
      // No existing categories - generate diverse random categories
      prompt = `Generate ${needed} diverse trivia categories for a Jeopardy-style game.

The categories should:
- Be varied and interesting (mix of topics like history, science, pop culture, geography, sports, arts, etc.)
- Be specific enough to be interesting (e.g., "80s Action Movies" is better than just "Movies")
- Appeal to a general adult audience
- NOT be overly niche or obscure

Respond in JSON format:
{
  "categories": [
    { "name": "Category Name", "interpretation": "Brief description of what this category covers" },
    ...
  ]
}

Generate exactly ${needed} categories. Only respond with the JSON, no other text.`;
    } else {
      // Has existing categories - generate complementary ones
      const existingList = existing.map((c: { name: string }) => c.name).join(", ");
      prompt = `Generate ${needed} trivia categories that complement these existing categories: ${existingList}

The new categories should:
- Thematically relate to or complement the existing ones (e.g., if there's "80s Movies", suggest "80s Music" or "80s TV Shows")
- Maintain variety - don't just repeat the same theme with slight variations
- Be specific enough to be interesting
- Appeal to a general adult audience

Respond in JSON format:
{
  "categories": [
    { "name": "Category Name", "interpretation": "Brief description of what this category covers" },
    ...
  ]
}

Generate exactly ${needed} categories. Only respond with the JSON, no other text.`;
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result = parseAIJson<{ categories: SuggestedCategory[] }>(content.text);

    return NextResponse.json({
      categories: result.categories,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("Error suggesting categories:", error);
    return NextResponse.json(
      { error: "Failed to suggest categories" },
      { status: 500 }
    );
  }
}

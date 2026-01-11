import { NextResponse } from "next/server";
import { getAnthropicClient, MODEL } from "@/lib/anthropic";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { parseAIJson } from "@/lib/parse-json";
import { buildQuestionGenerationPrompt, Category } from "@/lib/prompts";

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
    const { categories } = await request.json();

    if (!Array.isArray(categories) || categories.length !== 6) {
      return NextResponse.json({ error: "Exactly 6 categories are required" }, { status: 400 });
    }

    const client = getAnthropicClient();
    const prompt = buildQuestionGenerationPrompt(categories as Category[]);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
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

    const result = parseAIJson<{ questions: Array<{ categoryIndex: number; difficulty: number; points: number; question: string; answer: string }> }>(content.text);

    // Add IDs and answered status to questions
    const questions = result.questions.map((q: { categoryIndex: number; difficulty: number; points: number; question: string; answer: string }, index: number) => ({
      ...q,
      id: `q-${index}`,
      answered: false,
    }));

    return NextResponse.json({
      questions,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}

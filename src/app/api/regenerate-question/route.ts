import { NextResponse } from "next/server";
import { getAnthropicClient, MODEL } from "@/lib/anthropic";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

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
    const { category, difficulty, points, oldQuestion } = await request.json();

    if (!category || !difficulty || !points) {
      return NextResponse.json({ error: "Category, difficulty, and points are required" }, { status: 400 });
    }

    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Generate a NEW trivia question for a Jeopardy-style game.

Category: ${category}
Difficulty: ${difficulty} out of 5 (1 = easiest, 5 = hardest)
Point value: ${points}

${oldQuestion ? `The previous question was: "${oldQuestion}" - please generate a DIFFERENT question.` : ""}

Respond in JSON format:
{
  "question": "The question text",
  "answer": "The correct answer (be specific but concise)"
}

Only respond with the JSON, no other text.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result = JSON.parse(content.text);

    return NextResponse.json({
      question: result.question,
      answer: result.answer,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error("Error regenerating question:", error);
    return NextResponse.json(
      { error: "Failed to regenerate question" },
      { status: 500 }
    );
  }
}

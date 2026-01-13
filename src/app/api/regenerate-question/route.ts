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

IMPORTANT RULES:
- Do NOT use Jeopardy-style "What is..." or "Who is..." answer format. Answers should be plain and direct (e.g., "Blade Runner" not "What is Blade Runner?").
- MEDIUM MATTERS: Movies and TV shows are DIFFERENT. If the category says "movies" or "films", only use theatrical films - never TV shows. If it says "TV" or "television", only use TV shows - never movies.
- SEQUEL NAMING: When a question refers to a specific film in a franchise, the answer must be unambiguous. Use distinctive subtitles or specify the sequel number. Do NOT use just the franchise name when asking about a specific installment.
- QUESTION VARIETY: Don't just ask "What movie/song/animal is this?" - also ask about specific scenes, characters, quotes, behavior, records, or trivia to test different types of knowledge.

Respond in JSON format:
{
  "question": "The question text",
  "answer": "The correct answer (be specific but concise)"
}

CRITICAL: Respond with ONLY the raw JSON object. Do NOT wrap it in markdown code blocks.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result = parseAIJson<{ question: string; answer: string }>(content.text);

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

import { NextResponse } from "next/server";
import { getAnthropicClient, MODEL } from "@/lib/anthropic";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { parseAIJson } from "@/lib/parse-json";
import { fuzzyMatchAnswer } from "@/lib/fuzzy-match";

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
    const { question, correctAnswer, userAnswer } = await request.json();

    if (!question || !correctAnswer || !userAnswer) {
      return NextResponse.json({ error: "Question, correct answer, and user answer are required" }, { status: 400 });
    }

    // First, try fuzzy text matching (fast, no API call)
    const fuzzyResult = fuzzyMatchAnswer(userAnswer, correctAnswer);

    if (fuzzyResult.isMatch) {
      // Fuzzy match succeeded - skip AI evaluation
      return NextResponse.json({
        correct: true,
        explanation: `Answer matched with ${fuzzyResult.score}% confidence.`,
        confidence: "high",
        correctAnswer,
        remaining: rateLimit.remaining,
        matchType: "fuzzy",
      });
    }

    // Fuzzy match failed - use AI to double-check
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are judging a trivia game answer. Be fair but reasonable - accept answers that are essentially correct even if not word-for-word.

Question: ${question}
Expected Answer: ${correctAnswer}
Player's Answer: ${userAnswer}

Determine if the player's answer is correct. Consider:
- Spelling variations and typos are OK if the answer is clearly the same
- Partial answers may be acceptable if they capture the key information
- Alternative correct answers should be accepted

Respond in JSON format:
{
  "correct": true/false,
  "explanation": "Brief explanation of your judgment (1-2 sentences)",
  "confidence": "high/medium/low"
}

CONFIDENCE GUIDE:
- "high": The answer clearly matches OR clearly doesn't match. No reasonable person would disagree.
- "medium": The answer is close but requires interpretation. A human moderator might rule differently.
- "low": This is a judgment call. The answer could reasonably be accepted or rejected.

If you're accepting an answer that doesn't exactly match (like accepting a character name for a movie title), confidence should be "medium" or "low", NOT "high".

Only respond with the JSON, no other text.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result = parseAIJson<{ correct: boolean; explanation: string; confidence: string }>(content.text);

    return NextResponse.json({
      correct: result.correct,
      explanation: result.explanation,
      confidence: result.confidence,
      correctAnswer,
      remaining: rateLimit.remaining,
      matchType: "ai",
    });
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}

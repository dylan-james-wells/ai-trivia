import { NextResponse } from "next/server";
import { getAnthropicClient, MODEL } from "@/lib/anthropic";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { parseAIJson } from "@/lib/parse-json";
import { getRandomLetterSets } from "@/lib/random-letters";
import { POINTS_PER_DIFFICULTY, QUESTIONS_PER_CATEGORY } from "@/types/game";

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

    const categoryList = categories.map((c: { name: string; aiInterpretation?: string }, i: number) =>
      `${i + 1}. ${c.name}${c.aiInterpretation ? ` (interpreted as: ${c.aiInterpretation})` : ""}`
    ).join("\n");

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Generate trivia questions for a Jeopardy-style game. Create ${QUESTIONS_PER_CATEGORY} questions for each of these 6 categories, with increasing difficulty:

Categories:
${categoryList}

Point values for each difficulty level: ${POINTS_PER_DIFFICULTY.join(", ")}

For each category, create questions ranging from easy (${POINTS_PER_DIFFICULTY[0]} points) to hard (${POINTS_PER_DIFFICULTY[QUESTIONS_PER_CATEGORY - 1]} points).

Respond in JSON format:
{
  "questions": [
    {
      "categoryIndex": 0,
      "difficulty": 1,
      "points": 200,
      "question": "The question text",
      "answer": "The correct answer (be specific but concise)"
    },
    ...
  ]
}

Generate exactly ${6 * QUESTIONS_PER_CATEGORY} questions total (${QUESTIONS_PER_CATEGORY} per category).
Each answer should be a clear, concise answer that a human moderator can judge.

IMPORTANT: Do NOT use Jeopardy-style "What is..." or "Who is..." answer format. Answers should be plain and direct (e.g., "Blade Runner" not "What is Blade Runner?").

VARIETY IS CRITICAL: For entertainment categories (music, movies, TV, books, etc.), actively resist defaulting to the most famous/canonical choices.

When you think of an answer, ask yourself: "Is this one of the top 5 most famous examples in this category?" If yes, give yourself only a 10% chance of using it - mentally roll a d10, and only use it on a 1. Otherwise, dig deeper and find something from the second or third tier of popularity - still recognizable, but not the obvious choice.

For example: If generating 70s movies and you think "Taxi Driver" - that's top 5 famous, so 90% of the time pick something else like Network, Dog Day Afternoon, or Chinatown instead. Same for Sound of Music (60s), Lion King (90s), Back to the Future (80s), etc.

The goal is "interesting trivia night" not "everyone's first guess." Second-tier well-known works make for better questions.

STARTING LETTER CONSTRAINT: For entertainment categories (music, movies, TV, books, etc.) AND nature/animal categories, you must follow these rules:
- At least 2 of the 5 answers must start with a letter from SET A: ${(() => { const sets = getRandomLetterSets(3); return `${sets.set1.join(", ")}\n- At least 2 of the 5 answers must start with a letter from SET B: ${sets.set2.join(", ")}`; })()}
This forces variety - if your first instinct doesn't match either set, find alternatives that do.

Random seed for this generation: ${Math.floor(Math.random() * 10000)}

CRITICAL: Respond with ONLY the raw JSON object. Do NOT wrap it in markdown code blocks. Do NOT include \`\`\`json or \`\`\` markers. Just the pure JSON starting with { and ending with }.`,
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

import { getRandomLetterSets } from "./random-letters";
import { POINTS_PER_DIFFICULTY, QUESTIONS_PER_CATEGORY } from "@/types/game";

export interface Category {
  name: string;
  aiInterpretation?: string;
}

export function buildQuestionGenerationPrompt(categories: Category[]): string {
  const categoryList = categories
    .map((c, i) => `${i + 1}. ${c.name}${c.aiInterpretation ? ` (interpreted as: ${c.aiInterpretation})` : ""}`)
    .join("\n");

  const sets = getRandomLetterSets(3);
  const letterConstraint = `${sets.set1.join(", ")}\n- At least 2 of the 5 answers must start with a letter from SET B: ${sets.set2.join(", ")}`;

  return `Generate trivia questions for a Jeopardy-style game. Create ${QUESTIONS_PER_CATEGORY} questions for each of these 6 categories, with increasing difficulty:

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

MEDIUM MATTERS: Movies and TV shows are DIFFERENT categories. If the category says "movies" or "films", only use theatrical films - never TV shows, miniseries, or streaming series. If it says "TV" or "television", only use TV shows - never movies. Breaking Bad is a TV show, not a movie. The Godfather is a movie, not a TV show.

VARIETY IS CRITICAL: For entertainment categories (music, movies, TV, books, etc.), actively resist defaulting to the most famous/canonical choices.

When you think of an answer, ask yourself: "Is this one of the top 5 most famous examples in this category?" If yes, give yourself only a 10% chance of using it - mentally roll a d10, and only use it on a 1. Otherwise, dig deeper and find something from the second or third tier of popularity - still recognizable, but not the obvious choice.

For example: If generating 70s movies and you think "Taxi Driver" - that's top 5 famous, so 90% of the time pick something else like Network, Dog Day Afternoon, or Chinatown instead. Same for Sound of Music (60s), Lion King (90s), Back to the Future (80s), etc.

The goal is "interesting trivia night" not "everyone's first guess." Second-tier well-known works make for better questions.

QUESTION TYPE VARIETY: Don't make every question the same format. Mix up the types of questions within each category:
- For movies: Instead of always "What movie is this?", also ask about specific scenes, characters, quotes, or trivia (e.g., "What did Doc use as a new fuel source at the end of Back to the Future?" answer: "Mr. Fusion/garbage")
- For animals: Instead of always "What animal is this?", also ask about behavior, records, or facts (e.g., "What is considered the most dangerous animal in Africa?" answer: "Hippo")
- For music: Instead of always "Who sang this?", also ask about albums, lyrics, band members, or music history
- Apply this principle to all categories - vary the angle of approach to keep questions interesting and test different types of knowledge.

STARTING LETTER CONSTRAINT: For entertainment categories (music, movies, TV, books, etc.) AND nature/animal categories, you must follow these rules:
- At least 2 of the 5 answers must start with a letter from SET A: ${letterConstraint}
This forces variety - if your first instinct doesn't match either set, find alternatives that do.

Random seed for this generation: ${Math.floor(Math.random() * 10000)}

CRITICAL: Respond with ONLY the raw JSON object. Do NOT wrap it in markdown code blocks. Do NOT include \`\`\`json or \`\`\` markers. Just the pure JSON starting with { and ending with }.`;
}

import * as fuzz from "fuzzball";

// Threshold for considering an answer correct (0-100)
// 85+ is a strong match accounting for minor typos and case differences
const FUZZY_THRESHOLD = 85;

/**
 * Normalize a string for comparison:
 * - lowercase
 * - remove leading articles (the, a, an)
 * - remove punctuation
 * - trim whitespace
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

/**
 * Check if user answer fuzzy matches the correct answer
 * Returns { isMatch: true, score } if it's a confident match
 * Returns { isMatch: false, score } if AI should verify
 */
export function fuzzyMatchAnswer(
  userAnswer: string,
  correctAnswer: string
): { isMatch: boolean; score: number } {
  const normalizedUser = normalize(userAnswer);
  const normalizedCorrect = normalize(correctAnswer);

  // Exact match after normalization
  if (normalizedUser === normalizedCorrect) {
    return { isMatch: true, score: 100 };
  }

  // Use fuzzball's ratio for simple comparison
  const simpleRatio = fuzz.ratio(normalizedUser, normalizedCorrect);

  // Also check partial ratio (good for when answer is substring)
  const partialRatio = fuzz.partial_ratio(normalizedUser, normalizedCorrect);

  // Token sort ratio handles word order differences
  const tokenSortRatio = fuzz.token_sort_ratio(normalizedUser, normalizedCorrect);

  // Take the best score
  const bestScore = Math.max(simpleRatio, partialRatio, tokenSortRatio);

  return {
    isMatch: bestScore >= FUZZY_THRESHOLD,
    score: bestScore,
  };
}

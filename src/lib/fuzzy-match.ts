import * as fuzz from "fuzzball";

// Threshold for considering an answer correct (0-100)
// 85+ is a strong match accounting for minor typos and case differences
const FUZZY_THRESHOLD = 85;

// If user answer is less than this fraction of the correct answer length,
// don't trust partial_ratio (it might be matching a substring)
const MIN_LENGTH_RATIO = 0.5;

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

  // If user answer is much shorter than correct answer, defer to AI
  // This prevents "Solomon" matching "King Lear & King Solomon"
  const lengthRatio = normalizedUser.length / normalizedCorrect.length;
  if (lengthRatio < MIN_LENGTH_RATIO) {
    return { isMatch: false, score: 0 };
  }

  // Use fuzzball's ratio for simple comparison
  const simpleRatio = fuzz.ratio(normalizedUser, normalizedCorrect);

  // Token sort ratio handles word order differences
  const tokenSortRatio = fuzz.token_sort_ratio(normalizedUser, normalizedCorrect);

  // Only use partial_ratio if the answer lengths are similar
  // This prevents short answers from matching as substrings
  let bestScore = Math.max(simpleRatio, tokenSortRatio);

  if (lengthRatio >= 0.7) {
    const partialRatio = fuzz.partial_ratio(normalizedUser, normalizedCorrect);
    bestScore = Math.max(bestScore, partialRatio);
  }

  return {
    isMatch: bestScore >= FUZZY_THRESHOLD,
    score: bestScore,
  };
}

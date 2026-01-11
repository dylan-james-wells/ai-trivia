// Valid letters for variety constraint (skip rare letters Q, U, V, X, Y, Z)
export const VALID_LETTERS = "ABCDEFGHIJKLMNOPRSTW".split("");

/**
 * Get two non-overlapping sets of random letters for variety constraint
 */
export function getRandomLetterSets(countPerSet: number): { set1: string[]; set2: string[] } {
  const shuffled = [...VALID_LETTERS].sort(() => Math.random() - 0.5);
  return {
    set1: shuffled.slice(0, countPerSet),
    set2: shuffled.slice(countPerSet, countPerSet * 2),
  };
}

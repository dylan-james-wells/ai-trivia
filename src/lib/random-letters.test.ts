import { describe, it, expect } from "vitest";
import { getRandomLetterSets, VALID_LETTERS } from "./random-letters";

describe("getRandomLetterSets", () => {
  describe("returns correct structure", () => {
    it("returns object with set1 and set2", () => {
      const result = getRandomLetterSets(3);
      expect(result).toHaveProperty("set1");
      expect(result).toHaveProperty("set2");
    });

    it("returns arrays for both sets", () => {
      const result = getRandomLetterSets(3);
      expect(Array.isArray(result.set1)).toBe(true);
      expect(Array.isArray(result.set2)).toBe(true);
    });
  });

  describe("returns correct count per set", () => {
    it("returns 3 letters per set when countPerSet is 3", () => {
      const result = getRandomLetterSets(3);
      expect(result.set1).toHaveLength(3);
      expect(result.set2).toHaveLength(3);
    });

    it("returns 5 letters per set when countPerSet is 5", () => {
      const result = getRandomLetterSets(5);
      expect(result.set1).toHaveLength(5);
      expect(result.set2).toHaveLength(5);
    });

    it("returns 1 letter per set when countPerSet is 1", () => {
      const result = getRandomLetterSets(1);
      expect(result.set1).toHaveLength(1);
      expect(result.set2).toHaveLength(1);
    });
  });

  describe("sets do not overlap", () => {
    it("set1 and set2 have no common letters", () => {
      // Run multiple times to account for randomness
      for (let i = 0; i < 10; i++) {
        const result = getRandomLetterSets(3);
        const set1Set = new Set(result.set1);
        const hasOverlap = result.set2.some((letter) => set1Set.has(letter));
        expect(hasOverlap).toBe(false);
      }
    });

    it("all letters in both sets are unique", () => {
      for (let i = 0; i < 10; i++) {
        const result = getRandomLetterSets(5);
        const allLetters = [...result.set1, ...result.set2];
        const uniqueLetters = new Set(allLetters);
        expect(uniqueLetters.size).toBe(allLetters.length);
      }
    });
  });

  describe("only includes valid letters", () => {
    it("all returned letters are from VALID_LETTERS", () => {
      for (let i = 0; i < 10; i++) {
        const result = getRandomLetterSets(5);
        const allLetters = [...result.set1, ...result.set2];
        allLetters.forEach((letter) => {
          expect(VALID_LETTERS).toContain(letter);
        });
      }
    });

    it("does not include rare letters (Q, U, V, X, Y, Z)", () => {
      const rareLetters = ["Q", "U", "V", "X", "Y", "Z"];
      for (let i = 0; i < 20; i++) {
        const result = getRandomLetterSets(5);
        const allLetters = [...result.set1, ...result.set2];
        allLetters.forEach((letter) => {
          expect(rareLetters).not.toContain(letter);
        });
      }
    });
  });

  describe("randomness", () => {
    it("produces different results on multiple calls", () => {
      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const result = getRandomLetterSets(3);
        results.add(result.set1.join("") + result.set2.join(""));
      }
      // Should have at least a few unique combinations
      expect(results.size).toBeGreaterThan(5);
    });
  });

  describe("edge cases", () => {
    it("handles countPerSet of 0", () => {
      const result = getRandomLetterSets(0);
      expect(result.set1).toHaveLength(0);
      expect(result.set2).toHaveLength(0);
    });

    it("handles maximum possible countPerSet", () => {
      // VALID_LETTERS has 20 letters, so max per set is 10
      const result = getRandomLetterSets(10);
      expect(result.set1).toHaveLength(10);
      expect(result.set2).toHaveLength(10);
    });
  });
});

describe("VALID_LETTERS", () => {
  it("does not include Q, U, V, X, Y, Z", () => {
    expect(VALID_LETTERS).not.toContain("Q");
    expect(VALID_LETTERS).not.toContain("U");
    expect(VALID_LETTERS).not.toContain("V");
    expect(VALID_LETTERS).not.toContain("X");
    expect(VALID_LETTERS).not.toContain("Y");
    expect(VALID_LETTERS).not.toContain("Z");
  });

  it("includes common letters", () => {
    expect(VALID_LETTERS).toContain("A");
    expect(VALID_LETTERS).toContain("B");
    expect(VALID_LETTERS).toContain("S");
    expect(VALID_LETTERS).toContain("T");
    expect(VALID_LETTERS).toContain("M");
  });

  it("has 20 letters total", () => {
    expect(VALID_LETTERS).toHaveLength(20);
  });
});

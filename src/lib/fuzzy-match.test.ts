import { describe, it, expect } from "vitest";
import { fuzzyMatchAnswer } from "./fuzzy-match";

describe("fuzzyMatchAnswer", () => {
  describe("exact matches", () => {
    it("returns 100 for exact match", () => {
      const result = fuzzyMatchAnswer("Blade Runner", "Blade Runner");
      expect(result.isMatch).toBe(true);
      expect(result.score).toBe(100);
    });

    it("returns 100 for case-insensitive exact match", () => {
      const result = fuzzyMatchAnswer("blade runner", "Blade Runner");
      expect(result.isMatch).toBe(true);
      expect(result.score).toBe(100);
    });

    it("returns 100 for exact match after article stripping", () => {
      const result = fuzzyMatchAnswer("The Beatles", "Beatles");
      expect(result.isMatch).toBe(true);
      expect(result.score).toBe(100);
    });

    it("strips 'a' article", () => {
      const result = fuzzyMatchAnswer("A Clockwork Orange", "Clockwork Orange");
      expect(result.isMatch).toBe(true);
      expect(result.score).toBe(100);
    });

    it("strips 'an' article", () => {
      const result = fuzzyMatchAnswer("An American Werewolf", "American Werewolf");
      expect(result.isMatch).toBe(true);
      expect(result.score).toBe(100);
    });
  });

  describe("near matches (typos, minor differences)", () => {
    it("accepts minor typos", () => {
      const result = fuzzyMatchAnswer("Beatels", "Beatles");
      expect(result.isMatch).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(85);
    });

    it("accepts slight misspellings", () => {
      const result = fuzzyMatchAnswer("Schwarzenegger", "Schwarzeneger");
      expect(result.isMatch).toBe(true);
    });

    it("accepts missing punctuation", () => {
      const result = fuzzyMatchAnswer("Whats up", "What's up");
      expect(result.isMatch).toBe(true);
    });
  });

  describe("partial matches", () => {
    it("accepts substring answers when they capture key info", () => {
      const result = fuzzyMatchAnswer("Witcher 3", "The Witcher 3: Wild Hunt");
      expect(result.isMatch).toBe(true);
    });

    it("accepts partial movie titles", () => {
      const result = fuzzyMatchAnswer("Back to the Future", "Back to the Future Part II");
      expect(result.isMatch).toBe(true);
    });
  });

  describe("word order variations", () => {
    it("handles word order differences", () => {
      const result = fuzzyMatchAnswer("Runner Blade", "Blade Runner");
      expect(result.score).toBeGreaterThanOrEqual(85);
    });
  });

  describe("clear mismatches", () => {
    it("rejects completely wrong answers", () => {
      const result = fuzzyMatchAnswer("Star Wars", "Blade Runner");
      expect(result.isMatch).toBe(false);
      expect(result.score).toBeLessThan(85);
    });

    it("rejects unrelated answers", () => {
      const result = fuzzyMatchAnswer("Pizza", "Giraffe");
      expect(result.isMatch).toBe(false);
    });

    it("rejects partial matches that are too short", () => {
      // Very short unrelated answers should be rejected
      const result = fuzzyMatchAnswer("Cat", "Tyrannosaurus Rex");
      expect(result.isMatch).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("handles numeric answers", () => {
      const result = fuzzyMatchAnswer("1984", "1984");
      expect(result.isMatch).toBe(true);
      expect(result.score).toBe(100);
    });

    it("handles single word answers", () => {
      const result = fuzzyMatchAnswer("Elephant", "Elephant");
      expect(result.isMatch).toBe(true);
    });

    it("handles answers with special characters", () => {
      const result = fuzzyMatchAnswer("E.T.", "E.T. the Extra-Terrestrial");
      expect(result.isMatch).toBe(true);
    });
  });
});

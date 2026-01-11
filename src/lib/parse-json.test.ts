import { describe, it, expect } from "vitest";
import { parseAIJson } from "./parse-json";

describe("parseAIJson", () => {
  describe("valid JSON parsing", () => {
    it("parses plain JSON object", () => {
      const json = '{"name": "test", "value": 123}';
      const result = parseAIJson<{ name: string; value: number }>(json);
      expect(result).toEqual({ name: "test", value: 123 });
    });

    it("parses JSON array", () => {
      const json = '[1, 2, 3]';
      const result = parseAIJson<number[]>(json);
      expect(result).toEqual([1, 2, 3]);
    });

    it("parses nested JSON", () => {
      const json = '{"questions": [{"id": 1, "text": "Q1"}]}';
      const result = parseAIJson<{ questions: { id: number; text: string }[] }>(json);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].text).toBe("Q1");
    });

    it("parses JSON with whitespace", () => {
      const json = `
        {
          "name": "test"
        }
      `;
      const result = parseAIJson<{ name: string }>(json);
      expect(result.name).toBe("test");
    });
  });

  describe("markdown code block handling", () => {
    it("strips ```json wrapper", () => {
      const json = '```json\n{"name": "test"}\n```';
      const result = parseAIJson<{ name: string }>(json);
      expect(result.name).toBe("test");
    });

    it("strips plain ``` wrapper", () => {
      const json = '```\n{"name": "test"}\n```';
      const result = parseAIJson<{ name: string }>(json);
      expect(result.name).toBe("test");
    });

    it("handles code block with extra whitespace", () => {
      const json = '```json\n  {"name": "test"}  \n```';
      const result = parseAIJson<{ name: string }>(json);
      expect(result.name).toBe("test");
    });

    it("handles code block without newlines", () => {
      const json = '```json{"name": "test"}```';
      const result = parseAIJson<{ name: string }>(json);
      expect(result.name).toBe("test");
    });
  });

  describe("error handling", () => {
    it("throws on invalid JSON", () => {
      const json = '{invalid json}';
      expect(() => parseAIJson(json)).toThrow();
    });

    it("throws on empty string", () => {
      expect(() => parseAIJson("")).toThrow();
    });

    it("throws on incomplete JSON", () => {
      const json = '{"name": "test"';
      expect(() => parseAIJson(json)).toThrow();
    });

    it("throws on non-JSON text", () => {
      const text = "Here is your answer: The Beatles";
      expect(() => parseAIJson(text)).toThrow();
    });
  });

  describe("type inference", () => {
    it("returns typed result for question response", () => {
      const json = JSON.stringify({
        questions: [
          { categoryIndex: 0, difficulty: 1, points: 200, question: "Q1", answer: "A1" }
        ]
      });
      type QuestionResponse = {
        questions: Array<{
          categoryIndex: number;
          difficulty: number;
          points: number;
          question: string;
          answer: string;
        }>;
      };
      const result = parseAIJson<QuestionResponse>(json);
      expect(result.questions[0].categoryIndex).toBe(0);
      expect(result.questions[0].answer).toBe("A1");
    });

    it("returns typed result for evaluation response", () => {
      const json = JSON.stringify({
        correct: true,
        explanation: "Good answer",
        confidence: "high"
      });
      type EvalResponse = {
        correct: boolean;
        explanation: string;
        confidence: string;
      };
      const result = parseAIJson<EvalResponse>(json);
      expect(result.correct).toBe(true);
      expect(result.confidence).toBe("high");
    });
  });
});

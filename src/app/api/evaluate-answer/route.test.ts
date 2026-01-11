import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock the dependencies
vi.mock("@/lib/anthropic", () => ({
  getAnthropicClient: vi.fn(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
  MODEL: "claude-sonnet-4-20250514",
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 29, resetIn: 60000 })),
  getClientIP: vi.fn(() => "127.0.0.1"),
}));

import { getAnthropicClient } from "@/lib/anthropic";
import { checkRateLimit } from "@/lib/rate-limit";

function createMockRequest(body: object): Request {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers(),
  } as unknown as Request;
}

describe("POST /api/evaluate-answer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 29, resetIn: 60000 });
  });

  describe("fuzzy matching", () => {
    it("returns fuzzy match for exact answer", async () => {
      const request = createMockRequest({
        question: "What is the capital of France?",
        correctAnswer: "Paris",
        userAnswer: "Paris",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.correct).toBe(true);
      expect(data.matchType).toBe("fuzzy");
      expect(data.score || data.explanation).toBeTruthy();
    });

    it("returns fuzzy match for case-insensitive answer", async () => {
      const request = createMockRequest({
        question: "What is the capital of France?",
        correctAnswer: "Paris",
        userAnswer: "paris",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.correct).toBe(true);
      expect(data.matchType).toBe("fuzzy");
    });

    it("returns fuzzy match for answer with minor typo", async () => {
      const request = createMockRequest({
        question: "What band sang Mr. Brightside?",
        correctAnswer: "The Killers",
        userAnswer: "The Killers",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.correct).toBe(true);
      expect(data.matchType).toBe("fuzzy");
    });
  });

  describe("AI fallback", () => {
    it("falls back to AI when fuzzy match fails", async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "text", text: '{"correct": true, "explanation": "Close enough", "confidence": "high"}' }],
          }),
        },
      };
      vi.mocked(getAnthropicClient).mockReturnValue(mockClient as ReturnType<typeof getAnthropicClient>);

      const request = createMockRequest({
        question: "What is the largest mammal?",
        correctAnswer: "Blue Whale",
        userAnswer: "dolphin", // Completely wrong, will fail fuzzy match
      });

      const response = await POST(request);
      const data = await response.json();

      expect(mockClient.messages.create).toHaveBeenCalled();
      expect(data.matchType).toBe("ai");
    });
  });

  describe("rate limiting", () => {
    it("returns 429 when rate limited", async () => {
      vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0, resetIn: 30000 });

      const request = createMockRequest({
        question: "Test?",
        correctAnswer: "Test",
        userAnswer: "Test",
      });

      const response = await POST(request);
      expect(response.status).toBe(429);

      const data = await response.json();
      expect(data.error).toContain("Too many requests");
    });
  });

  describe("validation", () => {
    it("returns 400 when question is missing", async () => {
      const request = createMockRequest({
        correctAnswer: "Test",
        userAnswer: "Test",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 400 when correctAnswer is missing", async () => {
      const request = createMockRequest({
        question: "Test?",
        userAnswer: "Test",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 400 when userAnswer is missing", async () => {
      const request = createMockRequest({
        question: "Test?",
        correctAnswer: "Test",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("response format", () => {
    it("includes correctAnswer in response", async () => {
      const request = createMockRequest({
        question: "Test?",
        correctAnswer: "Test Answer",
        userAnswer: "Test Answer",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.correctAnswer).toBe("Test Answer");
    });

    it("includes remaining rate limit in response", async () => {
      vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 15, resetIn: 30000 });

      const request = createMockRequest({
        question: "Test?",
        correctAnswer: "Test",
        userAnswer: "Test",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.remaining).toBe(15);
    });
  });
});

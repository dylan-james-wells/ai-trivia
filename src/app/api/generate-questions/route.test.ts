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

vi.mock("@/lib/random-letters", () => ({
  getRandomLetterSets: vi.fn(() => ({ set1: ["A", "B", "C"], set2: ["D", "E", "F"] })),
}));

import { getAnthropicClient } from "@/lib/anthropic";
import { checkRateLimit } from "@/lib/rate-limit";

const mockQuestions = {
  questions: Array.from({ length: 30 }, (_, i) => ({
    categoryIndex: Math.floor(i / 5),
    difficulty: (i % 5) + 1,
    points: ((i % 5) + 1) * 200,
    question: `Question ${i + 1}`,
    answer: `Answer ${i + 1}`,
  })),
};

function createMockRequest(body: object): Request {
  return {
    json: () => Promise.resolve(body),
    headers: new Headers(),
  } as unknown as Request;
}

describe("POST /api/generate-questions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 29, resetIn: 60000 });

    const mockClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: "text", text: JSON.stringify(mockQuestions) }],
        }),
      },
    };
    vi.mocked(getAnthropicClient).mockReturnValue(mockClient as ReturnType<typeof getAnthropicClient>);
  });

  describe("successful generation", () => {
    it("returns 30 questions for 6 categories", async () => {
      const categories = [
        { name: "Movies" },
        { name: "Music" },
        { name: "Science" },
        { name: "History" },
        { name: "Sports" },
        { name: "Geography" },
      ];

      const request = createMockRequest({ categories });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.questions).toHaveLength(30);
    });

    it("adds id and answered status to each question", async () => {
      const categories = Array.from({ length: 6 }, (_, i) => ({ name: `Category ${i + 1}` }));
      const request = createMockRequest({ categories });
      const response = await POST(request);
      const data = await response.json();

      data.questions.forEach((q: { id: string; answered: boolean }, i: number) => {
        expect(q.id).toBe(`q-${i}`);
        expect(q.answered).toBe(false);
      });
    });

    it("includes remaining rate limit in response", async () => {
      vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 15, resetIn: 30000 });

      const categories = Array.from({ length: 6 }, (_, i) => ({ name: `Category ${i + 1}` }));
      const request = createMockRequest({ categories });
      const response = await POST(request);
      const data = await response.json();

      expect(data.remaining).toBe(15);
    });

    it("includes aiInterpretation in prompt when provided", async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "text", text: JSON.stringify(mockQuestions) }],
          }),
        },
      };
      vi.mocked(getAnthropicClient).mockReturnValue(mockClient as ReturnType<typeof getAnthropicClient>);

      const categories = [
        { name: "80s Movies", aiInterpretation: "Films from 1980-1989" },
        { name: "Music" },
        { name: "Science" },
        { name: "History" },
        { name: "Sports" },
        { name: "Geography" },
      ];

      const request = createMockRequest({ categories });
      await POST(request);

      const callArg = mockClient.messages.create.mock.calls[0][0];
      expect(callArg.messages[0].content).toContain("Films from 1980-1989");
    });
  });

  describe("rate limiting", () => {
    it("returns 429 when rate limited", async () => {
      vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0, resetIn: 30000 });

      const categories = Array.from({ length: 6 }, (_, i) => ({ name: `Category ${i + 1}` }));
      const request = createMockRequest({ categories });
      const response = await POST(request);

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toContain("Too many requests");
      expect(data.resetIn).toBe(30000);
    });
  });

  describe("validation", () => {
    it("returns 400 when categories is not an array", async () => {
      const request = createMockRequest({ categories: "not an array" });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("6 categories");
    });

    it("returns 400 when fewer than 6 categories provided", async () => {
      const categories = [{ name: "Only One" }];
      const request = createMockRequest({ categories });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("returns 400 when more than 6 categories provided", async () => {
      const categories = Array.from({ length: 7 }, (_, i) => ({ name: `Category ${i + 1}` }));
      const request = createMockRequest({ categories });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe("error handling", () => {
    it("returns 500 when AI client throws", async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockRejectedValue(new Error("API Error")),
        },
      };
      vi.mocked(getAnthropicClient).mockReturnValue(mockClient as ReturnType<typeof getAnthropicClient>);

      const categories = Array.from({ length: 6 }, (_, i) => ({ name: `Category ${i + 1}` }));
      const request = createMockRequest({ categories });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain("Failed to generate");
    });

    it("returns 500 when AI returns non-text response", async () => {
      const mockClient = {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "image", data: "..." }],
          }),
        },
      };
      vi.mocked(getAnthropicClient).mockReturnValue(mockClient as ReturnType<typeof getAnthropicClient>);

      const categories = Array.from({ length: 6 }, (_, i) => ({ name: `Category ${i + 1}` }));
      const request = createMockRequest({ categories });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe("question structure", () => {
    it("questions have required fields", async () => {
      const categories = Array.from({ length: 6 }, (_, i) => ({ name: `Category ${i + 1}` }));
      const request = createMockRequest({ categories });
      const response = await POST(request);
      const data = await response.json();

      data.questions.forEach((q: {
        categoryIndex: number;
        difficulty: number;
        points: number;
        question: string;
        answer: string;
        id: string;
        answered: boolean;
      }) => {
        expect(q).toHaveProperty("categoryIndex");
        expect(q).toHaveProperty("difficulty");
        expect(q).toHaveProperty("points");
        expect(q).toHaveProperty("question");
        expect(q).toHaveProperty("answer");
        expect(q).toHaveProperty("id");
        expect(q).toHaveProperty("answered");
      });
    });

    it("questions cover all 6 categories", async () => {
      const categories = Array.from({ length: 6 }, (_, i) => ({ name: `Category ${i + 1}` }));
      const request = createMockRequest({ categories });
      const response = await POST(request);
      const data = await response.json();

      const categoryIndices = new Set(data.questions.map((q: { categoryIndex: number }) => q.categoryIndex));
      expect(categoryIndices.size).toBe(6);
    });

    it("each category has 5 questions", async () => {
      const categories = Array.from({ length: 6 }, (_, i) => ({ name: `Category ${i + 1}` }));
      const request = createMockRequest({ categories });
      const response = await POST(request);
      const data = await response.json();

      for (let i = 0; i < 6; i++) {
        const categoryQuestions = data.questions.filter((q: { categoryIndex: number }) => q.categoryIndex === i);
        expect(categoryQuestions).toHaveLength(5);
      }
    });
  });
});

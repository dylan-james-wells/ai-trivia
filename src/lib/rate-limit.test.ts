import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, getClientIP } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Reset rate limit state by using a unique IP for each test
    vi.useFakeTimers();
  });

  it("allows first request", () => {
    const result = checkRateLimit("test-ip-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29); // 30 - 1
  });

  it("tracks remaining requests", () => {
    const ip = "test-ip-2";
    checkRateLimit(ip);
    checkRateLimit(ip);
    const result = checkRateLimit(ip);
    expect(result.remaining).toBe(27); // 30 - 3
  });

  it("blocks after 30 requests", () => {
    const ip = "test-ip-3";
    for (let i = 0; i < 30; i++) {
      checkRateLimit(ip);
    }
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const ip = "test-ip-4";
    // Make 30 requests
    for (let i = 0; i < 30; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip).allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(61 * 1000);

    // Should be allowed again
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });

  it("returns resetIn time", () => {
    const ip = "test-ip-5";
    const result = checkRateLimit(ip);
    expect(result.resetIn).toBe(60 * 1000); // 1 minute
  });
});

describe("getClientIP", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const request = {
      headers: new Headers({
        "x-forwarded-for": "192.168.1.1",
      }),
    } as unknown as Request;
    expect(getClientIP(request)).toBe("192.168.1.1");
  });

  it("extracts first IP from multiple forwarded IPs", () => {
    const request = {
      headers: new Headers({
        "x-forwarded-for": "192.168.1.1, 10.0.0.1, 172.16.0.1",
      }),
    } as unknown as Request;
    expect(getClientIP(request)).toBe("192.168.1.1");
  });

  it("returns 'unknown' when no forwarded header", () => {
    const request = {
      headers: new Headers(),
    } as unknown as Request;
    expect(getClientIP(request)).toBe("unknown");
  });

  it("trims whitespace from IP", () => {
    const request = {
      headers: new Headers({
        "x-forwarded-for": "  192.168.1.1  ",
      }),
    } as unknown as Request;
    expect(getClientIP(request)).toBe("192.168.1.1");
  });
});

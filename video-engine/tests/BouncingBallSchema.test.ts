import { describe, it, expect } from "vitest";
import { BouncingBallSchema } from "../src/schemas/BouncingBallSchema";

describe("BouncingBallSchema", () => {
  // --- RED: must fail ---
  it("rejects ballSize of 2000 (exceeds max of 800)", () => {
    const result = BouncingBallSchema.safeParse({
      ballColor: "#FF0000",
      ballSize: 2000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects ballSize of 50 (below min of 100)", () => {
    const result = BouncingBallSchema.safeParse({
      ballColor: "#FF0000",
      ballSize: 50,
    });
    expect(result.success).toBe(false);
  });

  // --- GREEN: must pass ---
  it("accepts ballSize of 100 (at exact min boundary)", () => {
    const result = BouncingBallSchema.safeParse({
      ballColor: "#00FF00",
      ballSize: 100,
    });
    expect(result.success).toBe(true);
  });

  it("accepts ballSize of 800 (at exact max boundary)", () => {
    const result = BouncingBallSchema.safeParse({
      ballColor: "#0000FF",
      ballSize: 800,
    });
    expect(result.success).toBe(true);
  });

  it("accepts ballSize of 400 (mid-range)", () => {
    const result = BouncingBallSchema.safeParse({
      ballColor: "#AABBCC",
      ballSize: 400,
    });
    expect(result.success).toBe(true);
  });

  // --- Hex color validation ---
  it("rejects color without # prefix", () => {
    const result = BouncingBallSchema.safeParse({
      ballColor: "FF0000",
      ballSize: 200,
    });
    expect(result.success).toBe(false);
  });

  it("rejects 3-digit shorthand hex", () => {
    const result = BouncingBallSchema.safeParse({
      ballColor: "#F00",
      ballSize: 200,
    });
    expect(result.success).toBe(false);
  });

  it("accepts lowercase hex", () => {
    const result = BouncingBallSchema.safeParse({
      ballColor: "#ff5733",
      ballSize: 200,
    });
    expect(result.success).toBe(true);
  });
});

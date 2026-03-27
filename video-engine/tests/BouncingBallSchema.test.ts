import { describe, it, expect } from "vitest";
import { BouncingBallSchema } from "../src/schemas/BouncingBallSchema";

const validBase = { ballColor: "#FF0000", ballSize: 200, durationInFrames: 90 };

describe("BouncingBallSchema", () => {
  // --- ballSize ---
  it("rejects ballSize of 2000 (exceeds max of 800)", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, ballSize: 2000 });
    expect(result.success).toBe(false);
  });

  it("rejects ballSize of 50 (below min of 100)", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, ballSize: 50 });
    expect(result.success).toBe(false);
  });

  it("accepts ballSize of 100 (at exact min boundary)", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, ballSize: 100 });
    expect(result.success).toBe(true);
  });

  it("accepts ballSize of 800 (at exact max boundary)", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, ballSize: 800 });
    expect(result.success).toBe(true);
  });

  // --- ballColor ---
  it("rejects color without # prefix", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, ballColor: "FF0000" });
    expect(result.success).toBe(false);
  });

  it("rejects 3-digit shorthand hex", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, ballColor: "#F00" });
    expect(result.success).toBe(false);
  });

  it("accepts lowercase hex", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, ballColor: "#ff5733" });
    expect(result.success).toBe(true);
  });

  // --- durationInFrames ---
  it("rejects durationInFrames of 0", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, durationInFrames: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer durationInFrames", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, durationInFrames: 2.5 });
    expect(result.success).toBe(false);
  });

  it("accepts durationInFrames of 150 (5s at 30fps)", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, durationInFrames: 150 });
    expect(result.success).toBe(true);
  });
});

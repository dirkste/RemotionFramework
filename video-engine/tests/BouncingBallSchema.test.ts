import { describe, it, expect } from "vitest";
import { BouncingBallSchema } from "../src/schemas/BouncingBallSchema";

const validBase = {
  ballColor: "#FF0000",
  ballSize: 200,
  backgroundColor: "#FFFFFF",
  horizontalDrift: 0.5,
  durationInFrames: 90,
};

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

  // --- backgroundColor ---
  it("accepts a valid backgroundColor hex", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, backgroundColor: "#1A1A2E" });
    expect(result.success).toBe(true);
  });

  it("rejects backgroundColor without # prefix", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, backgroundColor: "FFFFFF" });
    expect(result.success).toBe(false);
  });

  // --- horizontalDrift ---
  it("accepts horizontalDrift of 0 (perfectly vertical)", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, horizontalDrift: 0 });
    expect(result.success).toBe(true);
  });

  it("accepts horizontalDrift of 1 (maximum drift)", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, horizontalDrift: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects horizontalDrift above 1", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, horizontalDrift: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects negative horizontalDrift", () => {
    const result = BouncingBallSchema.safeParse({ ...validBase, horizontalDrift: -0.1 });
    expect(result.success).toBe(false);
  });
});

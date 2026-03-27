import { z } from "zod";

export const BouncingBallSchema = z.object({
  ballColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex color string (e.g. #FF0000)"),
  ballSize: z
    .number()
    .min(100, "ballSize must be at least 100")
    .max(800, "ballSize must not exceed 800"),
});

export type BouncingBallProps = z.infer<typeof BouncingBallSchema>;

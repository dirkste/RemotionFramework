import { describe, it, expect } from "vitest";

/**
 * Physics simulation — mirrors the constants and loop in BouncingBall.tsx.
 * Kept here so the test runs without React or Remotion.
 */
const GRAVITY = 1.5;
const ELASTICITY = 0.75;
const FLOOR_Y = 1080;
const MAX_HORIZONTAL_VELOCITY = 8;

type Frame = { x: number; y: number; vy: number; vx: number };

function simulateTrajectory(
  ballSize: number,
  horizontalDrift: number,
  width: number,
  totalFrames: number
): Frame[] {
  const radius = ballSize / 2;
  const frames: Frame[] = [];
  let y = radius;
  let vy = 0;
  let x = width / 2;
  let vx = horizontalDrift * MAX_HORIZONTAL_VELOCITY;

  for (let f = 0; f < totalFrames; f++) {
    vy += GRAVITY;
    y += vy;
    x += vx;

    const maxY = FLOOR_Y - radius;
    if (y >= maxY) {
      y = maxY;
      vy = -Math.abs(vy) * ELASTICITY;
      vx = -vx; // direction flips — magnitude unchanged
    }

    if (x < radius) {
      x = radius;
      vx = Math.abs(vx);
    } else if (x > width - radius) {
      x = width - radius;
      vx = -Math.abs(vx);
    }

    frames.push({ x, y, vy, vx });
  }
  return frames;
}

// ---------------------------------------------------------------------------
// RED phase — this test currently FAILS because vx never decays.
//
// The physics loop flips vx on each bounce but applies no damping, so the
// ball keeps drifting indefinitely even as vertical motion settles.
// Green phase: introduce vx decay (e.g. floor friction) so the ball comes
// to a full stop when vy has settled.
// ---------------------------------------------------------------------------
describe("BouncingBall physics — resting state", () => {
  it("vx decays to near-zero when the ball reaches a resting position", () => {
    const ballSize = 100;
    const radius = ballSize / 2;
    const width = 1920;
    const horizontalDrift = 0.3;
    const totalFrames = 1200; // well beyond any realistic settle time
    const floorY = FLOOR_Y - radius;

    const trajectory = simulateTrajectory(ballSize, horizontalDrift, width, totalFrames);

    // Find the first frame where resting is satisfied:
    //   • y is at the floor position for 3 or more consecutive frames
    //   • abs(vy) < 0.5  (vertical micro-oscillation has settled)
    let restingFrame = -1;
    for (let f = 2; f < trajectory.length; f++) {
      const a = trajectory[f - 2];
      const b = trajectory[f - 1];
      const c = trajectory[f];

      const atFloor = (fr: Frame) => Math.abs(fr.y - floorY) < 0.01;

      if (atFloor(a) && atFloor(b) && atFloor(c) && Math.abs(c.vy) < 0.5) {
        restingFrame = f;
        break;
      }
    }

    expect(
      restingFrame,
      `Ball never reached a resting state within ${totalFrames} frames ` +
        "(y at floor for 3+ consecutive frames with |vy| < 0.5). " +
        "The vertical physics may need damping to fully settle."
    ).toBeGreaterThan(-1);

    const vxAtRest = Math.abs(trajectory[restingFrame].vx);

    expect(
      vxAtRest,
      `Expected |vx| < 0.5 at resting frame ${restingFrame}, but got ${vxAtRest.toFixed(3)}. ` +
        "vx must decay to near-zero when the ball settles — add floor friction."
    ).toBeLessThan(0.5);
  });
});

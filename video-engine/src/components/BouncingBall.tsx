import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo, useEffect } from "react";
import type { BouncingBallProps } from "../schemas/BouncingBallSchema";

// Physics constants — hard-coded to guarantee a "Perfect Bounce"
const GRAVITY = 1.5;               // px/frame²
const ELASTICITY = 0.75;           // velocity multiplier on floor collision
const FLOOR_Y = 1080;              // canvas height in px
const MAX_HORIZONTAL_VELOCITY = 8; // px/frame at horizontalDrift=1

export const BouncingBall: React.FC<BouncingBallProps> = ({
  ballColor,
  ballSize,
  backgroundColor,
  horizontalDrift,
}) => {
  const { width, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const radius = ballSize / 2;

  // Precompute the full trajectory so frames can be rendered out of order.
  // Remotion renders frames independently — stateful/iterative simulation breaks.
  const trajectory = useMemo(() => {
    const positions: { x: number; y: number; vy: number }[] = [];
    let y = radius;
    let vy = 0;
    let x = width / 2;
    let vx = horizontalDrift * MAX_HORIZONTAL_VELOCITY; // start drifting right

    for (let f = 0; f < durationInFrames; f++) {
      vy += GRAVITY;
      y += vy;
      x += vx;

      // Floor collision: reverse vertical velocity, alternate horizontal direction
      const maxY = FLOOR_Y - radius;
      if (y >= maxY) {
        y = maxY;
        vy = -Math.abs(vy) * ELASTICITY;
        vx = -vx;
      }

      // Wall clamping: keep ball within canvas bounds
      if (x < radius) {
        x = radius;
        vx = Math.abs(vx);
      } else if (x > width - radius) {
        x = width - radius;
        vx = -Math.abs(vx);
      }

      positions.push({ x, y, vy });
    }
    return positions;
  }, [radius, durationInFrames, horizontalDrift, width]);

  const pos = trajectory[frame] ?? trajectory[durationInFrames - 1];

  useEffect(() => {
    const f = String(frame).padStart(3, "0");
    console.log(
      `[Frame ${f}]  x: ${pos.x.toFixed(1).padStart(7)}  y: ${pos.y.toFixed(1).padStart(7)}  vy: ${pos.vy.toFixed(2).padStart(7)}`
    );
  }, [frame, pos]);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <svg width={width} height={FLOOR_Y} style={{ display: "block" }}>
        {/* Floor line */}
        <line
          x1={0}
          y1={FLOOR_Y}
          x2={width}
          y2={FLOOR_Y}
          stroke="#000000"
          strokeWidth={2}
        />
        {/* Ball */}
        <circle cx={pos.x} cy={pos.y} r={radius} style={{ fill: ballColor }} />
      </svg>
    </AbsoluteFill>
  );
};

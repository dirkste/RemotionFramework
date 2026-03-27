import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";
import type { BouncingBallProps } from "../schemas/BouncingBallSchema";

// Physics constants — hard-coded to guarantee a "Perfect Bounce"
const GRAVITY = 1.5; // px/frame²
const ELASTICITY = 0.75; // velocity multiplier on floor collision
const FLOOR_Y = 1080; // canvas height in px
const TOTAL_FRAMES = 90;

export const BouncingBall: React.FC<BouncingBallProps> = ({
  ballColor,
  ballSize,
}) => {
  const { width } = useVideoConfig();
  const frame = useCurrentFrame();
  const radius = ballSize / 2;

  // Precompute the full trajectory so frames can be rendered out of order.
  // Remotion renders frames independently — stateful/iterative simulation breaks.
  const trajectory = useMemo(() => {
    const positions: number[] = [];
    let y = radius; // start with ball resting on the "ceiling" edge
    let vy = 0;

    for (let f = 0; f < TOTAL_FRAMES; f++) {
      vy += GRAVITY;
      y += vy;

      // Floor collision: ball bottom = y + radius; cap at floor
      const maxY = FLOOR_Y - radius;
      if (y >= maxY) {
        y = maxY;
        vy = -Math.abs(vy) * ELASTICITY;
      }

      positions.push(y);
    }
    return positions;
  }, [radius]);

  const centerX = width / 2;
  const centerY = trajectory[frame] ?? trajectory[TOTAL_FRAMES - 1];

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      <svg
        width={width}
        height={FLOOR_Y}
        style={{ display: "block" }}
      >
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
        <circle cx={centerX} cy={centerY} r={radius} fill={ballColor} />
      </svg>
    </AbsoluteFill>
  );
};

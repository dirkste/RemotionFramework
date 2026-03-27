import { useEffect, useState } from "react";
import { BouncingBall } from "../components/BouncingBall";
import type { BouncingBallProps } from "../schemas/BouncingBallSchema";

type LiveProps = Pick<BouncingBallProps, "ballColor" | "ballSize">;

const POLL_INTERVAL_MS = 2000;

export const BouncingBallComposition: React.FC<BouncingBallProps> = (schemaProps) => {
  const [liveProps, setLiveProps] = useState<LiveProps>({
    ballColor: schemaProps.ballColor,
    ballSize: schemaProps.ballSize,
  });

  useEffect(() => {
    const fetchProps = async () => {
      try {
        // Cache-bust so the browser always fetches the latest file write.
        const res = await fetch(`/public/props.json?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        setLiveProps({
          ballColor: data.ballColor ?? schemaProps.ballColor,
          ballSize: data.ballSize ?? schemaProps.ballSize,
        });
      } catch {
        // Keep current liveProps on network/parse error.
      }
    };

    fetchProps();
    const id = setInterval(fetchProps, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [schemaProps.ballColor, schemaProps.ballSize]);

  // durationInFrames is intentionally not hot-reloaded here:
  // Remotion's calculateMetadata (and therefore the timeline length) is set
  // at composition launch time and cannot be changed from inside a component.
  return <BouncingBall {...schemaProps} {...liveProps} />;
};

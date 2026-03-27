import { useEffect, useState } from "react";
import { BouncingBall } from "../components/BouncingBall";
import type { BouncingBallProps } from "../schemas/BouncingBallSchema";

type LiveProps = Pick<BouncingBallProps, "ballColor" | "ballSize">;

const POLL_INTERVAL_MS = 2000;
const PROPS_URL = "/public/props.json";

export const BouncingBallComposition: React.FC<BouncingBallProps> = (schemaProps) => {
  const [liveProps, setLiveProps] = useState<LiveProps>({
    ballColor: schemaProps.ballColor,
    ballSize: schemaProps.ballSize,
  });

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await fetch(`${PROPS_URL}?t=${Date.now()}`);
        if (!res.ok) {
          console.warn(`[BouncingBall] props.json fetch failed: HTTP ${res.status} ${res.url}`);
          return;
        }
        const data = await res.json();
        console.log("[BouncingBall] props loaded:", data);
        setLiveProps({
          ballColor: data.ballColor ?? schemaProps.ballColor,
          ballSize: data.ballSize ?? schemaProps.ballSize,
        });
      } catch (err) {
        console.error("[BouncingBall] props.json fetch error:", err);
      }
    };

    fetchProps();
    const id = setInterval(fetchProps, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally runs once on mount

  // durationInFrames is intentionally not hot-reloaded here:
  // Remotion's calculateMetadata (and therefore the timeline length) is set
  // at composition launch time and cannot be changed from inside a component.
  return <BouncingBall {...schemaProps} {...liveProps} />;
};

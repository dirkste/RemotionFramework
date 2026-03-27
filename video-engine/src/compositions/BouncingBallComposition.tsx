import { useEffect, useState } from "react";
import { staticFile, watchStaticFile } from "remotion";
import { BouncingBall } from "../components/BouncingBall";
import type { BouncingBallProps } from "../schemas/BouncingBallSchema";

type LiveProps = Pick<BouncingBallProps, "ballColor" | "ballSize">;

async function loadPropsFile(): Promise<Partial<LiveProps>> {
  const res = await fetch(`${staticFile("props.json")}?t=${Date.now()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const BouncingBallComposition: React.FC<BouncingBallProps> = (schemaProps) => {
  const [liveProps, setLiveProps] = useState<LiveProps>({
    ballColor: schemaProps.ballColor,
    ballSize: schemaProps.ballSize,
  });

  useEffect(() => {
    const applyProps = async () => {
      try {
        const data = await loadPropsFile();
        console.log("[BouncingBall] props loaded:", data);
        setLiveProps({
          ballColor: data.ballColor ?? schemaProps.ballColor,
          ballSize: data.ballSize ?? schemaProps.ballSize,
        });
      } catch (err) {
        console.error("[BouncingBall] failed to load props.json:", err);
      }
    };

    // Initial load
    applyProps();

    // watchStaticFile is Remotion's own file-watcher — it triggers a proper
    // composition re-render in Studio whenever the file changes on disk,
    // which is more reliable than polling with setInterval + setState.
    const { cancel } = watchStaticFile("props.json", applyProps);
    return cancel;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <BouncingBall {...schemaProps} {...liveProps} />;
};

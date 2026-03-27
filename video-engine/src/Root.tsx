import { Composition } from "remotion";
import { BouncingBallComposition } from "./compositions/BouncingBallComposition";
import { BouncingBallSchema } from "./schemas/BouncingBallSchema";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BouncingBall"
      component={BouncingBallComposition}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
      schema={BouncingBallSchema}
      defaultProps={{
        ballColor: "#FF0000",
        ballSize: 100,
      }}
    />
  );
};

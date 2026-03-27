import { BouncingBall } from "../components/BouncingBall";
import type { BouncingBallProps } from "../schemas/BouncingBallSchema";

export const BouncingBallComposition: React.FC<BouncingBallProps> = (props) => {
  return <BouncingBall {...props} />;
};

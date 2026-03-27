# PRD: AI-Video Framework (Phase 0: The Bouncing Ball)

## 1. Objective

To demonstrate a vertical slice where an AI-generated Visual Intent (Color and Size) is injected into a deterministic physics engine to produce a high-fidelity video.

## 2. Success Criteria

- **Size Scaling:** The ball's radius is dynamically set by the JSON input without breaking the collision logic.
- **Color Accuracy:** The ball renders in the exact hex code provided by the AI.
- **Text Constraint:** To maintain a high-signal aesthetic, any labels or data overlays remain Black Text (`#000000`).

## 3. The "Thin Slice" Scope

- **Input:** A JSON object containing exactly two variables.
- **Scene Class:** A `BouncingBall` React component.
- **Physics Method:** A gravity-based animation that calculates the Y position for 90 frames.

## 4. Functional Requirements

### 4.1. Intent Schema (The Contract)

The AI provides only the following:

- `ballColor`: String (Hex code, e.g., `#FF0000`)
- `ballSize`: Number (Diameter in pixels, e.g., `100` to `800`)

### 4.2. Framework Logic (The Class)

- **Hard-Coded Physics:** Gravity, Elasticity, and Floor Position are constants within the framework to ensure a "Perfect Bounce" every time.
- **Dynamic Rendering:** The component draws a circle using the `ballSize` and `ballColor` props.
- **Collision Detection:** The "Floor" is set at 1080px; the framework must subtract `ballSize/2` to ensure the ball touches the floor rather than sinking into it.

## 5. Technical Stack

| Layer | Technology | Notes |
|---|---|---|
| Orchestration | Python | Generates JSON via LLM |
| LLM | Anthropic API — `claude-haiku-4-5-20251001` | JSON intent generation |
| Video Engine | Remotion + React | Executes the React render |
| Validation | Zod | Ensures props are within safe range |
| Preview | Remotion Studio (browser) | No MP4 export in Phase 0 |

## 6. Monorepo Structure

```
RemotionFramework/
├── PRD.md
├── orchestrator/          # Python — LLM → JSON intent
│   ├── orchestrate.py
│   └── requirements.txt
└── video-engine/          # Remotion + React — renders the video
    ├── package.json
    ├── tsconfig.json
    ├── remotion.config.ts
    └── src/
        ├── index.ts
        ├── Root.tsx
        ├── schemas/
        │   └── BouncingBallSchema.ts
        ├── components/
        │   └── BouncingBall.tsx
        └── compositions/
            └── BouncingBallComposition.tsx
```

## 7. Video Spec

- **Resolution:** 1920 × 1080
- **FPS:** 30
- **Duration:** 90 frames (3 seconds)
- **Output:** Browser preview only (Remotion Studio)

## 8. Zod Validation Constraints

```ts
ballColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
ballSize:  z.number().min(100).max(800)
```

## 9. Physics Constants

```ts
const GRAVITY     = 1.5;   // px/frame²
const ELASTICITY  = 0.75;  // velocity multiplier on bounce
const FLOOR_Y     = 1080;  // canvas height in px
```

**Note on frame-independent physics:** Remotion renders frames out of order. Physics must be precomputed into a full trajectory array via `useMemo`, then indexed by `useCurrentFrame()`. Stateful/iterative simulation will produce corrupted output.

## 10. TDD Alignment

| Phase | Action | Expected Result |
|---|---|---|
| Red | Pass `ballSize: 2000` | Zod validation fails |
| Green | Constraint `.min(100).max(800)` | `ballSize: 100–800` passes |
| Refactor | Ensure bounce height is proportional | Larger ball doesn't feel weightless |

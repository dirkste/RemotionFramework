"""
orchestrate.py — Phase 0: Bouncing Ball

Reads intent_config.json for videoLengthSeconds, calls claude-haiku to generate
a Visual Intent JSON (ballColor + ballSize), merges in durationInFrames, validates,
then opens Remotion Studio in the browser for preview.
"""

import json
import os
import subprocess
import sys

import anthropic

# ---------------------------------------------------------------------------
# Schema constants (mirror Zod constraints in video-engine)
# ---------------------------------------------------------------------------
BALL_SIZE_MIN = 100
BALL_SIZE_MAX = 800
HEX_COLOR_PATTERN = r"^#[0-9A-Fa-f]{6}$"
FPS = 30

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "intent_config.json")

SYSTEM_PROMPT = (
    "You are a creative director generating visual parameters for an animation. "
    "Return ONLY a valid JSON object — no markdown, no explanation. "
    "The object must have exactly two keys:\n"
    f'  "ballColor": a 6-digit hex color string (e.g. "#FF5733")\n'
    f'  "ballSize": an integer between {BALL_SIZE_MIN} and {BALL_SIZE_MAX} (diameter in pixels)\n'
    "Be creative with color. Vary the size meaningfully."
)

VIDEO_ENGINE_DIR = os.path.join(os.path.dirname(__file__), "..", "video-engine")


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
def load_config() -> dict:
    with open(CONFIG_PATH) as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# LLM
# ---------------------------------------------------------------------------
def generate_intent() -> dict:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=128,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": "Generate the visual intent for today's bouncing ball.",
            }
        ],
    )
    raw = message.content[0].text.strip()
    print(f"[LLM raw output]\n{raw}\n")
    return json.loads(raw)


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def validate_intent(props: dict) -> None:
    import re

    color = props.get("ballColor")
    if not isinstance(color, str) or not re.match(HEX_COLOR_PATTERN, color):
        raise ValueError(f"Invalid ballColor: {color!r}. Expected 6-digit hex e.g. #FF0000")

    size = props.get("ballSize")
    if not isinstance(size, (int, float)):
        raise ValueError(f"ballSize must be numeric, got: {type(size).__name__}")
    if not (BALL_SIZE_MIN <= size <= BALL_SIZE_MAX):
        raise ValueError(
            f"ballSize {size} out of range [{BALL_SIZE_MIN}, {BALL_SIZE_MAX}]"
        )


# ---------------------------------------------------------------------------
# Launch Remotion Studio (browser preview — no MP4 export)
# ---------------------------------------------------------------------------
def launch_studio(props: dict) -> None:
    props_json = json.dumps(props)
    cmd = ["npx", "remotion", "studio", "--props", props_json]
    print(f"[Launching Remotion Studio]\nProps: {props_json}\n")
    subprocess.run(cmd, cwd=os.path.abspath(VIDEO_ENGINE_DIR), check=True)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
def main() -> None:
    if "ANTHROPIC_API_KEY" not in os.environ:
        print("ERROR: ANTHROPIC_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    config = load_config()
    video_length_seconds = config["videoLengthSeconds"]
    duration_in_frames = int(video_length_seconds * FPS)
    print(f"[Config] videoLengthSeconds={video_length_seconds} → durationInFrames={duration_in_frames}\n")

    props = generate_intent()
    props["durationInFrames"] = duration_in_frames
    print(f"[Generated intent]\n{json.dumps(props, indent=2)}\n")

    validate_intent(props)
    print("[Validation passed]\n")

    launch_studio(props)


if __name__ == "__main__":
    main()

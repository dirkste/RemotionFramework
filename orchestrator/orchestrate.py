"""
orchestrate.py — Phase 0: Bouncing Ball

Reads intent_config.json, calls claude-haiku to convert color descriptions to
hex values, then writes all resolved props to video-engine/public/props.json
and opens Remotion Studio. The component watches props.json and hot-reloads
on every write.
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
HORIZONTAL_DRIFT_MIN = 0.0
HORIZONTAL_DRIFT_MAX = 1.0
HEX_COLOR_PATTERN = r"^#[0-9A-Fa-f]{6}$"
FPS = 30

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "intent_config.json")
VIDEO_ENGINE_DIR = os.path.join(os.path.dirname(__file__), "..", "video-engine")
PROPS_FILE = os.path.join(VIDEO_ENGINE_DIR, "public", "props.json")


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
def load_config() -> dict:
    with open(CONFIG_PATH) as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# LLM — converts plain-English color descriptions to hex values
# ---------------------------------------------------------------------------
def resolve_colors(color_description: str, background_description: str) -> dict:
    system_prompt = (
        "You are a color converter. Given plain-English color descriptions, "
        "return ONLY a valid JSON object — no markdown, no explanation. "
        "The object must have exactly two keys:\n"
        f'  "ballColor": the hex code for "{color_description}" (e.g. "#7B2FBE")\n'
        f'  "backgroundColor": the hex code for "{background_description}" (e.g. "#FFFFFF")\n'
        "Use visually accurate, vivid hex codes."
    )

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=64,
        system=system_prompt,
        messages=[{"role": "user", "content": "Convert the colors."}],
    )
    raw = message.content[0].text.strip()
    print(f"[LLM raw output]\n{raw}\n")

    # Strip markdown code fences the model sometimes adds (```json ... ```)
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    if not raw:
        raise ValueError("LLM returned an empty response — retry or check your API key.")

    return json.loads(raw)


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def validate_props(props: dict) -> None:
    import re

    for key in ("ballColor", "backgroundColor"):
        val = props.get(key)
        if not isinstance(val, str) or not re.match(HEX_COLOR_PATTERN, val):
            raise ValueError(f"Invalid {key}: {val!r}. Expected 6-digit hex e.g. #FF0000")

    size = props.get("ballSize")
    if not isinstance(size, (int, float)):
        raise ValueError(f"ballSize must be numeric, got: {type(size).__name__}")
    if not (BALL_SIZE_MIN <= size <= BALL_SIZE_MAX):
        raise ValueError(f"ballSize {size} out of range [{BALL_SIZE_MIN}, {BALL_SIZE_MAX}]")

    drift = props.get("horizontalDrift")
    if not isinstance(drift, (int, float)):
        raise ValueError(f"horizontalDrift must be numeric, got: {type(drift).__name__}")
    if not (HORIZONTAL_DRIFT_MIN <= drift <= HORIZONTAL_DRIFT_MAX):
        raise ValueError(f"horizontalDrift {drift} out of range [0, 1]")


# ---------------------------------------------------------------------------
# Write props to public/props.json (hot-reload source for the component)
# ---------------------------------------------------------------------------
def write_props_file(props: dict) -> None:
    dest = os.path.abspath(PROPS_FILE)
    with open(dest, "w") as f:
        json.dump(props, f, indent=2)
    print(f"[Props written] {dest}\n")


# ---------------------------------------------------------------------------
# Launch Remotion Studio (browser preview — no MP4 export)
# ---------------------------------------------------------------------------
def launch_studio(duration_in_frames: int) -> None:
    # durationInFrames must be passed via --props so Remotion's calculateMetadata
    # can set the composition timeline length at launch.
    props_json = json.dumps({"durationInFrames": duration_in_frames})
    cmd = ["npx", "remotion", "studio", "--props", props_json]
    print(f"[Launching Remotion Studio] durationInFrames={duration_in_frames}\n")
    subprocess.run(cmd, cwd=os.path.abspath(VIDEO_ENGINE_DIR), check=True, shell=True)


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

    # Resolve color descriptions to hex via LLM
    colors = resolve_colors(
        color_description=config.get("colorDescription", "red"),
        background_description=config.get("backgroundColor", "white"),
    )

    props = {
        "ballColor": colors["ballColor"],
        "backgroundColor": colors["backgroundColor"],
        "ballSize": config.get("ballSize", 100),
        "horizontalDrift": config.get("horizontalDrift", 0),
        "durationInFrames": duration_in_frames,
    }
    print(f"[Resolved props]\n{json.dumps(props, indent=2)}\n")

    validate_props(props)
    print("[Validation passed]\n")

    write_props_file(props)
    launch_studio(duration_in_frames)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[Stopped]")
        sys.exit(0)

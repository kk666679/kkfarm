"""Strategic hashtag generation — 3-5 max across platforms."""
from __future__ import annotations


def generate_hashtags(topic: str, platform: str) -> list[str]:
    base = topic.lower().replace(" ", "")
    return [f"#{base}", "#2026trends", "#fyp"][: _limit(platform)]


def _limit(platform: str) -> int:
    return {"x": 2, "threads": 0, "facebook": 2}.get(platform, 5)

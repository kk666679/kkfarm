"""Validate content against platform policies."""
from __future__ import annotations

LIMITS = {
    "x": 280, "instagram": 2200, "tiktok": 4000,
    "facebook": 63206, "linkedin": 3000, "threads": 500,
}


def validate(text: str, hashtags: list[str], platform: str) -> None:
    limit = LIMITS.get(platform, 2200)
    if len(text) > limit:
        raise ValueError(f"text exceeds {platform} limit ({limit})")
    if len(hashtags) > 5:
        raise ValueError("too many hashtags (max 5)")

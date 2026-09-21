"""Adaptive scheduling — see skills/schedule-adaptive.md."""
from __future__ import annotations

PEAKS = {
    "tiktok":    {"window": "18:00-23:00", "best_day": "saturday"},
    "instagram": {"window": "18:00-23:00", "best_day": "wednesday"},
    "youtube":   {"window": "07:00-10:00", "best_day": "sunday"},
}


def optimal_window(platform: str, timezone: str = "UTC") -> dict:
    p = PEAKS.get(platform, {})
    return {"platform": platform, "timezone": timezone, **p}

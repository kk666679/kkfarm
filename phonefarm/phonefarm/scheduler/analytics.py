"""Historical performance review."""
from __future__ import annotations


def by_hour(post_history: list[dict]) -> dict[int, float]:
    buckets: dict[int, list[float]] = {}
    for post in post_history:
        buckets.setdefault(post["hour"], []).append(post["engagement_velocity"])
    return {h: sum(v) / len(v) for h, v in buckets.items()}

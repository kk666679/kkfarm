"""Post generation entry point."""
from __future__ import annotations
from typing import Any

from .platforms import get_platform
from .hashtags import generate_hashtags
from .brand_voice import apply_voice
from .validator import validate


def generate_post(topic: str, platform: str, **kwargs: Any) -> dict[str, Any]:
    plat = get_platform(platform)
    body = plat.format_text(topic, **kwargs)
    tags = generate_hashtags(topic, platform)
    body = apply_voice(body, platform)
    validate(body, tags, platform)
    return {"platform": platform, "text": body, "hashtags": tags}

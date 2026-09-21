from .base import Platform
from .tiktok import TikTok
from .instagram import Instagram
from .youtube import YouTube
from .x import X
from .linkedin import LinkedIn
from .facebook import Facebook
from .threads import Threads

_REGISTRY = {
    "tiktok": TikTok, "instagram": Instagram, "youtube": YouTube,
    "x": X, "linkedin": LinkedIn, "facebook": Facebook, "threads": Threads,
}


def get_platform(name: str) -> Platform:
    try:
        return _REGISTRY[name.lower()]()
    except KeyError as exc:
        raise ValueError(f"unknown platform: {name}") from exc

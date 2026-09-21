"""Platform interface."""
from __future__ import annotations
from typing import Any


class Platform:
    name = "base"
    char_limit = 2200
    hashtag_limit = 5

    def format_text(self, topic: str, **kwargs: Any) -> str:
        return topic

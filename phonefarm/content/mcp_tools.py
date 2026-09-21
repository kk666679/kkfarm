"""MCP tool registration for phonefarm.content.*"""
from __future__ import annotations
from .generator import generate_post
from .video import generate_video_script

TOOLS = {
    "phonefarm.content.generate-post": generate_post,
    "phonefarm.content.generate-video-script": generate_video_script,
}


def register(registry) -> None:
    for name, fn in TOOLS.items():
        registry.register(name, fn)

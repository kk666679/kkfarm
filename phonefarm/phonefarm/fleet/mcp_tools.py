"""MCP tool registration for phonefarm.fleet.*"""
from __future__ import annotations
from .health import check_all

TOOLS = {"phonefarm.fleet.check-health": check_all}


def register(registry) -> None:
    for name, fn in TOOLS.items():
        registry.register(name, fn)

"""MCP tool registration for phonefarm.scheduler.*"""
from __future__ import annotations
from .adaptive import optimal_window

TOOLS = {"phonefarm.scheduler.schedule-adaptive": optimal_window}


def register(registry) -> None:
    for name, fn in TOOLS.items():
        registry.register(name, fn)

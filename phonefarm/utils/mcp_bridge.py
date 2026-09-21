"""MCP bridge — loads skill markdown and registers all tools."""
from __future__ import annotations
from pathlib import Path


class MCPRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, callable] = {}

    def register(self, name: str, fn: callable) -> None:
        self._tools[name] = fn

    def list(self) -> list[str]:
        return sorted(self._tools)


def load_skills(root: str | Path = "skills") -> list[Path]:
    return sorted(Path(root).glob("*.md"))


def bootstrap() -> MCPRegistry:
    reg = MCPRegistry()
    from phonefarm.content import mcp_tools as content_tools
    from phonefarm.device import mcp_tools as device_tools
    from phonefarm.scheduler import mcp_tools as scheduler_tools
    from phonefarm.fleet import mcp_tools as fleet_tools
    for mod in (content_tools, device_tools, scheduler_tools, fleet_tools):
        mod.register(reg)
    return reg

"""Proxy pool with ≤3 devices per endpoint."""
from __future__ import annotations
from collections import defaultdict

MAX_PER_ENDPOINT = 3


class ProxyPool:
    def __init__(self) -> None:
        self._assignments: dict[str, list[str]] = defaultdict(list)

    def assign(self, endpoint: str, serial: str) -> None:
        if len(self._assignments[endpoint]) >= MAX_PER_ENDPOINT:
            raise RuntimeError(f"proxy {endpoint} already at max capacity")
        self._assignments[endpoint].append(serial)

    def load(self, endpoint: str) -> int:
        return len(self._assignments[endpoint])

"""Retry helper."""
from __future__ import annotations
import time
from typing import Callable, TypeVar

T = TypeVar("T")


def retry(fn: Callable[[], T], attempts: int = 3, delay: float = 0.5) -> T:
    last: Exception | None = None
    for _ in range(attempts):
        try:
            return fn()
        except Exception as exc:
            last = exc
            time.sleep(delay)
    assert last is not None
    raise last

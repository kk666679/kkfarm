"""Fleet health aggregation."""
from __future__ import annotations
from phonefarm.device.diagnose import diagnose_device


def check_all(serials: list[str]) -> dict[str, dict]:
    return {s: diagnose_device(s) for s in serials}

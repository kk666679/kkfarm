"""Android 16+ Trade-in mode."""
from __future__ import annotations
import json
from .adb import run


def tradein_status(serial: str, challenge: str | None = None) -> dict:
    args = ["shell", "tradeinmode", "getstatus"]
    if challenge:
        args += ["--challenge", challenge]
    try:
        out = run(serial, *args)
    except RuntimeError as exc:
        return {"ok": False, "error": str(exc)}
    try:
        return {"ok": True, **json.loads(out)}
    except json.JSONDecodeError:
        return {"ok": True, "raw": out}

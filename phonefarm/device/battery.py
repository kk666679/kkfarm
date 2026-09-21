"""Battery health — prefers trade-in mode on Android 16+."""
from __future__ import annotations
from .adb import run
from .tradein import tradein_status


def battery_status(serial: str) -> dict:
    ti = tradein_status(serial)
    if ti.get("ok"):
        return {"source": "tradein", **ti}
    dumpsys = run(serial, "shell", "dumpsys", "batterystats")
    return {"source": "batterystats", "raw_len": len(dumpsys)}

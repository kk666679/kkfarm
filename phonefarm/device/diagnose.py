"""Diagnostic entry point — see skills/diagnose-device.md."""
from __future__ import annotations
from .adb import run
from .thermal import read_thermal_zones
from .battery import battery_status


def diagnose_device(serial: str) -> dict:
    return {
        "serial": serial,
        "thermal": read_thermal_zones(serial),
        "battery": battery_status(serial),
        "connectivity": run(serial, "shell", "dumpsys", "connectivity")[:200],
    }

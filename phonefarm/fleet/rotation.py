"""Airplane-mode IP rotation."""
from __future__ import annotations
import time
from phonefarm.device.adb import run


def rotate_ip(serial: str, hold_s: int = 3) -> None:
    run(serial, "shell", "settings", "put", "global", "airplane_mode_on", "1")
    time.sleep(hold_s)
    run(serial, "shell", "settings", "put", "global", "airplane_mode_on", "0")

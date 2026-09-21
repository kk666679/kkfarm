"""Minimal ADB wrapper."""
from __future__ import annotations
import subprocess


def run(serial: str, *args: str, timeout: int = 30) -> str:
    cmd = ["adb", "-s", serial, *args]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    if out.returncode != 0:
        raise RuntimeError(f"adb failed: {out.stderr.strip()}")
    return out.stdout


def list_devices() -> list[str]:
    out = subprocess.run(["adb", "devices"], capture_output=True, text=True)
    return [line.split()[0] for line in out.stdout.splitlines()[1:] if line.strip()]

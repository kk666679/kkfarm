"""Remediation ladder — see skills/remediate-device.md."""
from __future__ import annotations
from .adb import run

LADDER = ["cache", "restart_app", "reboot", "reinstall", "network_reset", "factory"]


def remediate_device(serial: str, issue: str, level: str = "cache") -> dict:
    if level not in LADDER:
        raise ValueError(f"unknown remediation level: {level}")
    return {"serial": serial, "issue": issue, "level": level, "status": "applied"}

"""Provision entry point — see skills/provision-device.md."""
from __future__ import annotations
from .rkp import check_rkp_support
from .tradein import tradein_status
from .adb import run


def provision_device(serial: str) -> dict:
    rkp = check_rkp_support(serial)
    if not rkp.get("supported"):
        raise RuntimeError(f"device {serial} fails RKP attestation")
    return {
        "serial": serial,
        "rkp": rkp,
        "tradein": tradein_status(serial),
        "sdk": run(serial, "shell", "getprop", "ro.build.version.sdk").strip(),
    }

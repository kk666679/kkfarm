"""Remote Key Provisioning attestation."""
from __future__ import annotations
from .adb import run


def check_rkp_support(serial: str) -> dict:
    try:
        out = run(serial, "shell", "cmd", "remote_provisioning", "dump")
    except RuntimeError as exc:
        return {"supported": False, "error": str(exc)}
    return {
        "supported": "rpcAuthorName" in out,
        "raw": out[:400],
    }


def certify(serial: str) -> dict:
    out = run(serial, "shell", "cmd", "remote_provisioning", "certify", "default")
    return {"ok": "certificate" in out.lower(), "raw": out[:400]}

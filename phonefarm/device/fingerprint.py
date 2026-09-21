"""Coherent fingerprint generation — coherence over randomness."""
from __future__ import annotations
from typing import Any


def build_profile(device_model: str, carrier: str, locale: str) -> dict[str, Any]:
    return {
        "device_model": device_model,
        "carrier": carrier,
        "locale": locale,
        "coherent": True,
    }

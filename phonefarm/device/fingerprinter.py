"""
phonefarm/device/fingerprinter.py — Device fingerprinting with multiple signals

Hashes:
- Canvas fingerprint (WebGL rendering variation)
- WebGL fingerprint (GPU vendor/model)
- Timezone
- Hardware specs (CPU cores, RAM)
- User agent
- Accept language
- Platform string

Produces SHA256 hash for collision detection.
"""

import hashlib
import json
from typing import Dict, Any, Optional


class DeviceFingerprinter:
    """
    Generates device fingerprints for deduplication and fraud detection.
    
    Uses multiple signals:
    - Canvas fingerprint (WebGL rendering)
    - WebGL fingerprint (GPU info)
    - Timezone
    - Hardware specs
    - Browser strings
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config

    def fingerprint(
        self,
        device_id: str,
        canvas_fingerprint: Optional[str] = None,
        webgl_fingerprint: Optional[str] = None,
        timezone: Optional[str] = None,
        user_agent: Optional[str] = None,
        hardware_spec: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate device fingerprint hash.
        
        Returns SHA256 hash for comparison.
        """
        payload = {
            "device_id": device_id,
            "canvas": canvas_fingerprint or "unknown",
            "webgl": webgl_fingerprint or "unknown",
            "timezone": timezone or "UTC",
            "user_agent": user_agent or "unknown",
            "hardware": hardware_spec or {},
        }

        # Create deterministic JSON
        fingerprint_str = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(fingerprint_str.encode()).hexdigest()

    def canvas_fingerprint(self, canvas_data: str) -> str:
        """Hash Canvas rendering output"""
        return hashlib.md5(canvas_data.encode()).hexdigest()

    def webgl_fingerprint(self, webgl_data: Dict[str, Any]) -> str:
        """Hash WebGL GPU info"""
        webgl_str = json.dumps(webgl_data, sort_keys=True)
        return hashlib.md5(webgl_str.encode()).hexdigest()

    def hardware_fingerprint(self, specs: Dict[str, Any]) -> str:
        """Hash hardware specs"""
        specs_str = json.dumps(specs, sort_keys=True)
        return hashlib.md5(specs_str.encode()).hexdigest()

    def compare(self, fingerprint1: str, fingerprint2: str) -> float:
        """Compare fingerprints (0-1 similarity)"""
        if fingerprint1 == fingerprint2:
            return 1.0
        return 0.0  # Binary match for now

"""phonefarm/account/audit_recorder.py — Audit trail recording"""

from typing import Dict, Any, Optional
from datetime import datetime


class AuditRecorder:
    """Records account creation events to immutable audit trail"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.audit_log = []

    async def record_creation(
        self,
        account: Dict[str, Any],
        device_id: str,
        actor_id: str,
        verification: str,
        fingerprint_hash: str,
        warmup_days: int
    ):
        """Record account creation event"""
        entry = {
            "event": "account.created",
            "account_id": account.get("id"),
            "platform": account.get("platform"),
            "device_id": device_id,
            "actor_id": actor_id,
            "verification_method": verification,
            "fingerprint_hash": fingerprint_hash,
            "warmup_days": warmup_days,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.audit_log.append(entry)

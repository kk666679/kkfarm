"""phonefarm/account/verification.py — Email/phone/OTP coordination"""

from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class VerificationResult:
    ready: bool
    method: str
    reason: Optional[str] = None
    otp_sent_at: Optional[float] = None


class VerificationCoordinator:
    """Coordinates email, phone, and OTP verifications"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config

    async def prepare(
        self,
        platform: str,
        email: str,
        phone: Optional[str],
        method: str = "auto"
    ) -> VerificationResult:
        """Prepare verification methods"""
        # In production: Send OTP, prepare verification
        return VerificationResult(ready=True, method=method or "email")

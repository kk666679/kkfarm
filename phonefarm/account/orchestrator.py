"""
phonefarm/account/orchestrator.py — Central account creation orchestrator

Coordinates multi-platform account creation with:
- Per-platform rules enforcement
- Rate limit checking
- Device fingerprint validation
- Warmup scheduling
- Anti-pattern detection
- Audit trail recording
"""

import asyncio
import hashlib
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path

from .creator import AccountCreator
from .warmer import WarmupScheduler
from .health_checker import AccountHealthChecker
from .anti_pattern_detector import AntiPatternDetector
from .audit_recorder import AuditRecorder
from .verification import VerificationCoordinator

# Platform rules (from references/platforms.md)
PLATFORM_LIMITS = {
    "tiktok": {"daily_cap": 3, "gap_minutes": 30, "category": "social"},
    "instagram": {"daily_cap": 2, "gap_minutes": 45, "category": "social", "meta": True},
    "youtube": {"daily_cap": 1, "gap_minutes": 60, "category": "social"},
    "linkedin": {"daily_cap": 1, "gap_minutes": 120, "category": "professional"},
    "threads": {"daily_cap": 3, "gap_minutes": 30, "category": "social", "meta": True},
    "facebook": {"daily_cap": 1, "gap_minutes": 120, "category": "social", "meta": True},
    "shopee": {"daily_cap": 1, "gap_minutes": 60, "category": "ecommerce"},
    "shopify": {"daily_cap": 1, "gap_minutes": 120, "category": "ecommerce"},
    "n8n": {"daily_cap": None, "gap_minutes": 0, "category": "automation"},
    "zeppy": {"daily_cap": None, "gap_minutes": 0, "category": "automation"},
}


@dataclass
class AccountCreationRequest:
    """Account creation request"""
    platform: str
    device_id: str
    email: str
    phone: Optional[str] = None
    profile_data: Dict[str, Any] = None
    verification_method: str = "auto"  # auto, email, phone, oauth
    force: bool = False  # Skip rate limits
    actor_id: str = "phonefarm-operator"


@dataclass
class AccountCreationResult:
    """Account creation result"""
    success: bool
    account_id: Optional[str] = None
    platform: str = None
    created_at: datetime = None
    warmup_scheduled: bool = False
    warmup_end_at: Optional[datetime] = None
    errors: List[str] = None
    warnings: List[str] = None


class AccountOrchestrator:
    """
    Central orchestrator for multi-platform account creation.
    
    Enforces:
    - Rate limits per device/platform
    - Device fingerprint uniqueness
    - Anti-pattern detection
    - Verification coordination
    - Warmup scheduling
    - Audit trail recording
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.creator = AccountCreator(config)
        self.warmer = WarmupScheduler(config)
        self.health_checker = AccountHealthChecker(config)
        self.detector = AntiPatternDetector(config)
        self.recorder = AuditRecorder(config)
        self.verifier = VerificationCoordinator(config)
        
        # In-memory counters (production: use Redis)
        self.daily_counters: Dict[str, Dict[str, int]] = {}  # device_id -> platform -> count
        self.last_creation_times: Dict[str, Dict[str, datetime]] = {}  # device_id -> platform -> time

    async def create_account(self, request: AccountCreationRequest) -> AccountCreationResult:
        """
        Create account on platform with full validation.
        
        Process:
        1. Pre-flight checks (rate limits, fingerprint, anti-patterns)
        2. Verification readiness
        3. Create account
        4. Schedule warmup
        5. Record audit
        6. Emit event
        """
        result = AccountCreationResult(
            success=False,
            platform=request.platform,
            errors=[],
            warnings=[]
        )

        try:
            # 1. Pre-flight checks
            await self._preflight_checks(request, result)
            if result.errors and not request.force:
                return result

            # 2. Verification readiness
            verification = await self.verifier.prepare(
                platform=request.platform,
                email=request.email,
                phone=request.phone,
                method=request.verification_method
            )
            if not verification.ready:
                result.errors.append(f"Verification not ready: {verification.reason}")
                return result

            # 3. Create account
            account = await self.creator.create(
                platform=request.platform,
                device_id=request.device_id,
                email=request.email,
                phone=request.phone,
                profile_data=request.profile_data or {},
                verification=verification
            )

            if not account:
                result.errors.append("Account creation failed")
                return result

            result.account_id = account["id"]
            result.created_at = datetime.utcnow()

            # 4. Schedule warmup
            warmup_days = await self._get_warmup_days(request.platform)
            if warmup_days > 0:
                warmup_end = datetime.utcnow() + timedelta(days=warmup_days)
                scheduled = await self.warmer.schedule(
                    account_id=account["id"],
                    platform=request.platform,
                    duration_days=warmup_days,
                    device_id=request.device_id
                )
                result.warmup_scheduled = scheduled
                result.warmup_end_at = warmup_end

            # 5. Record audit
            await self.recorder.record_creation(
                account=account,
                device_id=request.device_id,
                actor_id=request.actor_id,
                verification=verification.method,
                fingerprint_hash=await self._get_device_fingerprint(request.device_id),
                warmup_days=warmup_days
            )

            # 6. Update counters
            self._update_counters(request.device_id, request.platform)

            # 7. Emit event
            await self._emit_event("phonefarm.account.created", {
                "account_id": account["id"],
                "platform": request.platform,
                "device_id": request.device_id,
                "warmup_days": warmup_days
            })

            result.success = True
            return result

        except Exception as e:
            result.errors.append(f"Exception: {str(e)}")
            return result

    async def _preflight_checks(self, request: AccountCreationRequest, result: AccountCreationResult):
        """Run all pre-flight checks"""
        
        # Check platform exists
        if request.platform not in PLATFORM_LIMITS:
            result.errors.append(f"Unknown platform: {request.platform}")
            return

        limits = PLATFORM_LIMITS[request.platform]

        # Rate limit check
        if not request.force:
            daily_count = self.daily_counters.get(request.device_id, {}).get(request.platform, 0)
            if limits["daily_cap"] and daily_count >= limits["daily_cap"]:
                result.errors.append(
                    f"Daily cap reached ({daily_count}/{limits['daily_cap']})"
                )
                return

            # Minimum gap check
            if limits["gap_minutes"] > 0:
                last_creation = self.last_creation_times.get(request.device_id, {}).get(request.platform)
                if last_creation:
                    elapsed = (datetime.utcnow() - last_creation).total_seconds() / 60
                    if elapsed < limits["gap_minutes"]:
                        result.errors.append(
                            f"Gap too short: {elapsed:.0f}m < {limits['gap_minutes']}m"
                        )
                        return

        # Fingerprint check
        fingerprint = await self._get_device_fingerprint(request.device_id)
        existing = await self.detector.check_fingerprint_collision(
            fingerprint=fingerprint,
            platform=request.platform,
            category=limits["category"]
        )
        if existing:
            result.errors.append(f"Fingerprint collision with {existing}")
            return

        # Anti-pattern detection
        antipatterns = await self.detector.detect(
            device_id=request.device_id,
            platform=request.platform,
            email=request.email,
            phone=request.phone
        )
        if antipatterns:
            for pattern in antipatterns:
                result.errors.append(f"Anti-pattern: {pattern}")

    async def _get_warmup_days(self, platform: str) -> int:
        """Get warmup duration for platform"""
        warmup_map = {
            "tiktok": 5,
            "instagram": 7,
            "youtube": 14,
            "linkedin": 14,
            "threads": 4,
            "facebook": 14,
            "shopee": 7,
            "shopify": 10,
            "n8n": 1,
            "zeppy": 1,
        }
        return warmup_map.get(platform, 0)

    async def _get_device_fingerprint(self, device_id: str) -> str:
        """Get device fingerprint hash"""
        # In production: call device/fingerprinter.py
        return hashlib.sha256(device_id.encode()).hexdigest()

    def _update_counters(self, device_id: str, platform: str):
        """Update daily counter and last creation time"""
        if device_id not in self.daily_counters:
            self.daily_counters[device_id] = {}
        if device_id not in self.last_creation_times:
            self.last_creation_times[device_id] = {}
        
        self.daily_counters[device_id][platform] = \
            self.daily_counters[device_id].get(platform, 0) + 1
        self.last_creation_times[device_id][platform] = datetime.utcnow()

    async def _emit_event(self, event_type: str, payload: Dict[str, Any]):
        """Emit event to hook system"""
        # In production: call hooks/bus.py
        pass

    async def get_device_status(self, device_id: str) -> Dict[str, Any]:
        """Get device account creation status"""
        return {
            "device_id": device_id,
            "daily_counts": self.daily_counters.get(device_id, {}),
            "last_creations": {
                k: v.isoformat()
                for k, v in self.last_creation_times.get(device_id, {}).items()
            }
        }

    async def reset_daily_counters(self):
        """Reset daily counters (call at midnight)"""
        self.daily_counters = {}

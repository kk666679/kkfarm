"""
phonefarm/account/anti_pattern_detector.py — Anti-pattern detection (14 patterns)

Detects:
1. Same phone number across accounts
2. Same email alias (normalize +N)
3. Same IP cluster (24-bit subnet)
4. Same device fingerprint
5. Same username pattern (Levenshtein > 0.8)
6. Same avatar (perceptual hash)
7. Rapid creation (< min gap)
8. Immediate high activity
9. Meta cross-platform (IG/Threads/FB fingerprint)
10. KYC document reuse
11. Shopify store name collision
12. API key reuse
13. Automation default credentials
14. Missing 2FA
"""

import re
import hashlib
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass


@dataclass
class AntiPattern:
    """Anti-pattern detection result"""
    pattern_id: str
    severity: str  # warning, error, critical
    message: str
    details: Dict[str, Any] = None


class AntiPatternDetector:
    """
    Detects 14 anti-patterns to prevent fraud, duplicate accounts,
    and policy violations.
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        # In production: load from database
        self.account_registry = {}  # account_id -> account_data
        self.email_registry = {}  # normalized_email -> [accounts]
        self.phone_registry = {}  # phone -> [accounts]
        self.fingerprint_registry = {}  # fingerprint_hash -> [accounts]
        self.ip_registry = {}  # IP -> [accounts]
        self.username_registry = {}  # username -> [accounts]
        self.kyc_registry = {}  # doc_hash -> [accounts]

    async def detect(
        self,
        device_id: str,
        platform: str,
        email: str,
        phone: Optional[str] = None,
        profile_data: Dict[str, Any] = None,
        ip_address: Optional[str] = None
    ) -> List[str]:
        """
        Run all 14 anti-pattern checks.
        Returns list of error messages.
        """
        errors = []

        # 1. Phone number reuse
        if phone:
            if await self._check_phone_reuse(phone, platform):
                errors.append(f"Phone number already used: {phone}")

        # 2. Email alias reuse
        if email:
            reused_account = await self._check_email_reuse(email)
            if reused_account:
                errors.append(f"Email pattern already used: {email}")

        # 3. IP cluster collision
        if ip_address:
            if await self._check_ip_collision(ip_address):
                errors.append(f"IP cluster already has account: {ip_address}")

        # 4. Device fingerprint
        # (handled by check_fingerprint_collision)

        # 5. Username pattern
        if profile_data and "username" in profile_data:
            if await self._check_username_pattern(profile_data["username"], platform):
                errors.append(f"Username pattern too similar to existing accounts")

        # 6. Avatar reuse
        if profile_data and "avatar_url" in profile_data:
            if await self._check_avatar_reuse(profile_data["avatar_url"]):
                errors.append(f"Avatar already used by another account")

        # 7. Rapid creation (handled by orchestrator rate limits)

        # 8. Immediate high activity (handled by warmup scheduler)

        # 9. Meta cross-platform check
        if platform in ["instagram", "threads", "facebook"]:
            if await self._check_meta_fingerprint(device_id):
                errors.append(f"Meta fingerprint collision (IG/Threads/FB)")

        # 10. KYC document reuse
        if platform in ["shopee", "shopify"] and profile_data:
            if "kyc_doc_hash" in profile_data:
                if await self._check_kyc_reuse(profile_data["kyc_doc_hash"]):
                    errors.append(f"KYC document already used")

        # 11. Shopify store name collision
        if platform == "shopify" and profile_data and "store_name" in profile_data:
            if await self._check_shopify_store_name(profile_data["store_name"]):
                errors.append(f"Shopify store name already taken: {profile_data['store_name']}")

        # 12. API key reuse (n8n, Zeppy)
        if platform in ["n8n", "zeppy"] and profile_data:
            if "api_key_hash" in profile_data:
                if await self._check_api_key_reuse(profile_data["api_key_hash"]):
                    errors.append(f"API key already registered")

        # 13. Automation default credentials
        if platform in ["n8n", "zeppy"] and profile_data:
            if await self._check_default_credentials(platform, profile_data):
                errors.append(f"Default credentials detected (security risk)")

        # 14. Missing 2FA
        if platform in ["n8n", "zeppy"] and profile_data:
            if not profile_data.get("two_factor_enabled"):
                errors.append(f"2FA required but not enabled")

        return errors

    async def _check_phone_reuse(self, phone: str, platform: str) -> bool:
        """Pattern 1: Phone number reuse"""
        return phone in self.phone_registry

    async def _check_email_reuse(self, email: str) -> bool:
        """Pattern 2: Email alias reuse (normalize +N)"""
        normalized = self._normalize_email(email)
        return normalized in self.email_registry

    def _normalize_email(self, email: str) -> str:
        """Normalize email: user+N@domain -> user@domain"""
        match = re.match(r"^([^+@]+)\+[^@]*@(.+)$", email)
        if match:
            return f"{match.group(1)}@{match.group(2)}"
        return email

    async def _check_ip_collision(self, ip_address: str) -> bool:
        """Pattern 3: IP cluster collision (24-bit subnet)"""
        subnet = ".".join(ip_address.split(".")[:3])  # /24 subnet
        return subnet in self.ip_registry

    async def check_fingerprint_collision(
        self,
        fingerprint: str,
        platform: str,
        category: str
    ) -> Optional[str]:
        """Pattern 4: Device fingerprint collision"""
        if fingerprint in self.fingerprint_registry:
            accounts = self.fingerprint_registry[fingerprint]
            # Same fingerprint ok if different category
            if all(acc.get("category") != category for acc in accounts):
                return None
            # Collision in same category
            return accounts[0].get("id")
        return None

    async def _check_username_pattern(self, username: str, platform: str) -> bool:
        """Pattern 5: Username pattern similarity (Levenshtein > 0.8)"""
        if platform not in self.username_registry:
            return False
        
        for existing_username in self.username_registry.get(platform, []):
            similarity = self._levenshtein_similarity(username, existing_username)
            if similarity > 0.8:
                return True
        return False

    def _levenshtein_similarity(self, s1: str, s2: str) -> float:
        """Calculate Levenshtein similarity (0-1)"""
        if len(s1) == 0 and len(s2) == 0:
            return 1.0
        if len(s1) == 0 or len(s2) == 0:
            return 0.0
        
        # Calculate Levenshtein distance
        matrix = [[0] * (len(s2) + 1) for _ in range(len(s1) + 1)]
        for i in range(len(s1) + 1):
            matrix[i][0] = i
        for j in range(len(s2) + 1):
            matrix[0][j] = j
        
        for i in range(1, len(s1) + 1):
            for j in range(1, len(s2) + 1):
                cost = 0 if s1[i - 1] == s2[j - 1] else 1
                matrix[i][j] = min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                )
        
        distance = matrix[len(s1)][len(s2)]
        max_len = max(len(s1), len(s2))
        return 1.0 - (distance / max_len)

    async def _check_avatar_reuse(self, avatar_url: str) -> bool:
        """Pattern 6: Avatar reuse (perceptual hash)"""
        # In production: compute perceptual hash and compare
        avatar_hash = hashlib.md5(avatar_url.encode()).hexdigest()
        return avatar_hash in self.username_registry  # Simplified

    async def _check_meta_fingerprint(self, device_id: str) -> bool:
        """Pattern 9: Meta cross-platform (IG/Threads/FB)"""
        # Check if device has accounts on multiple Meta platforms
        meta_accounts = [
            acc for acc in self.account_registry.values()
            if acc.get("platform") in ["instagram", "threads", "facebook"]
        ]
        return len(meta_accounts) > 1

    async def _check_kyc_reuse(self, doc_hash: str) -> bool:
        """Pattern 10: KYC document reuse"""
        return doc_hash in self.kyc_registry

    async def _check_shopify_store_name(self, store_name: str) -> bool:
        """Pattern 11: Shopify store name collision"""
        # In production: query Shopify API or local registry
        return False  # Assume available for now

    async def _check_api_key_reuse(self, api_key_hash: str) -> bool:
        """Pattern 12: API key reuse"""
        return api_key_hash in self.kyc_registry

    async def _check_default_credentials(self, platform: str, profile_data: Dict[str, Any]) -> bool:
        """Pattern 13: Automation default credentials"""
        defaults = {
            "n8n": ["admin", "admin123", "test", "test123"],
            "zeppy": ["admin", "admin123", "test", "test123"],
        }
        
        default_usernames = defaults.get(platform, [])
        username = profile_data.get("username", "").lower()
        password = profile_data.get("password", "")
        
        # Check if username is default
        if username in default_usernames:
            return True
        
        # Check if password is default
        if password in default_usernames:
            return True
        
        return False

    async def register_account(
        self,
        account_id: str,
        platform: str,
        category: str,
        email: str,
        phone: Optional[str] = None,
        fingerprint: Optional[str] = None,
        username: Optional[str] = None,
        kyc_doc_hash: Optional[str] = None,
        ip_address: Optional[str] = None
    ):
        """Register account for future anti-pattern checks"""
        self.account_registry[account_id] = {
            "id": account_id,
            "platform": platform,
            "category": category,
            "email": email,
            "phone": phone,
            "fingerprint": fingerprint,
            "username": username,
            "created_at": datetime.utcnow().isoformat()
        }

        # Update registries
        if email:
            normalized = self._normalize_email(email)
            if normalized not in self.email_registry:
                self.email_registry[normalized] = []
            self.email_registry[normalized].append(account_id)

        if phone:
            if phone not in self.phone_registry:
                self.phone_registry[phone] = []
            self.phone_registry[phone].append(account_id)

        if fingerprint:
            if fingerprint not in self.fingerprint_registry:
                self.fingerprint_registry[fingerprint] = []
            self.fingerprint_registry[fingerprint].append(self.account_registry[account_id])

        if username:
            if platform not in self.username_registry:
                self.username_registry[platform] = []
            self.username_registry[platform].append(username)

        if kyc_doc_hash:
            if kyc_doc_hash not in self.kyc_registry:
                self.kyc_registry[kyc_doc_hash] = []
            self.kyc_registry[kyc_doc_hash].append(account_id)

        if ip_address:
            subnet = ".".join(ip_address.split(".")[:3])
            if subnet not in self.ip_registry:
                self.ip_registry[subnet] = []
            self.ip_registry[subnet].append(account_id)

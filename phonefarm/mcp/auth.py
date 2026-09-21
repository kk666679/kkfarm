"""
MCP Authentication - OAuth 2.0 / OIDC support.

Per MCP 2026-07-28, authentication is handled at the transport layer.
This module provides utilities for token validation and authorization.
"""

from typing import Optional, Dict, List
from dataclasses import dataclass
import jwt
import time
from functools import wraps


@dataclass
class TokenClaims:
    """Parsed JWT claims."""
    sub: str
    client_id: str
    scopes: List[str]
    exp: int
    iat: int
    iss: str


class MCPAuth:
    """OAuth 2.0 / OIDC authentication for MCP."""

    def __init__(
        self,
        jwks_url: str = None,
        issuer: str = None,
        audience: str = None,
        public_key: str = None,
    ):
        self.jwks_url = jwks_url
        self.issuer = issuer
        self.audience = audience
        self.public_key = public_key
        self._jwks_cache = None
        self._jwks_cache_time = 0

    async def validate_token(self, token: str) -> Optional[TokenClaims]:
        """Validate JWT token."""
        try:
            if self.public_key:
                # Validate with local public key
                payload = jwt.decode(
                    token,
                    self.public_key,
                    algorithms=["RS256"],
                    audience=self.audience,
                    issuer=self.issuer,
                )
            else:
                # In production, fetch JWKS from jwks_url
                # For now, decode without verification (dev only)
                payload = jwt.decode(
                    token,
                    options={"verify_signature": False},
                    audience=self.audience,
                    issuer=self.issuer,
                )

            return TokenClaims(
                sub=payload.get("sub", ""),
                client_id=payload.get("client_id", payload.get("azp", "")),
                scopes=payload.get("scope", "").split() if isinstance(payload.get("scope"), str) else payload.get("scopes", []),
                exp=payload.get("exp", 0),
                iat=payload.get("iat", 0),
                iss=payload.get("iss", ""),
            )
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def has_scope(self, claims: TokenClaims, required_scope: str) -> bool:
        """Check if token has required scope."""
        return required_scope in claims.scopes

    def require_scope(self, scope: str):
        """Decorator to require specific scope."""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Extract token from context (implementation depends on transport)
                token = kwargs.get("_mcp_token") or getattr(args[0], "_mcp_token", None) if args else None
                if not token:
                    raise PermissionError("Missing authentication token")

                claims = await self.validate_token(token)
                if not claims:
                    raise PermissionError("Invalid or expired token")

                if not self.has_scope(claims, scope):
                    raise PermissionError(f"Missing required scope: {scope}")

                return await func(*args, **kwargs)
            return wrapper
        return decorator


# Default scopes for phonefarm
SCOPES = {
    "phonefarm:devices:read": "Read device information",
    "phonefarm:devices:write": "Register and command devices",
    "phonefarm:accounts:read": "Read account information",
    "phonefarm:accounts:write": "Register and manage accounts",
    "phonefarm:tasks:read": "Read task status",
    "phonefarm:tasks:write": "Create and manage tasks",
    "phonefarm:admin": "Administrative access",
}


def create_dev_token(client_id: str = "dev-client", scopes: List[str] = None) -> str:
    """Create a development token (NOT for production)."""
    payload = {
        "sub": "dev-user",
        "client_id": client_id,
        "scopes": scopes or list(SCOPES.keys()),
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()),
        "iss": "phonefarm-dev",
    }
    # In production, sign with private key
    return jwt.encode(payload, "dev-secret", algorithm="HS256")
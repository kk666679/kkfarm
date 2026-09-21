"""Zero-touch enrollment helpers."""
from __future__ import annotations


def enrollment_url(account: str) -> str:
    return f"https://enterprise.google.com/android/enroll?account={account}"

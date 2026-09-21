"""phonefarm/account/warmer.py — Warmup scheduling and execution"""

from typing import Dict, Any


class WarmupScheduler:
    """Schedules and executes warmup activities per platform"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.warmup_tasks = {}

    async def schedule(
        self,
        account_id: str,
        platform: str,
        duration_days: int,
        device_id: str
    ) -> bool:
        """Schedule warmup for account"""
        self.warmup_tasks[account_id] = {
            "platform": platform,
            "duration_days": duration_days,
            "device_id": device_id,
            "status": "scheduled"
        }
        return True

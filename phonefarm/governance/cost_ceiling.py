"""
Governance: Cost Ceiling Enforcement.

Enforces per-run, per-agent, per-day cost limits.
"""

from typing import Dict, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import time
import threading


@dataclass
class CostLimit:
    per_run: float = 1.00
    per_agent_day: float = 50.00
    global_day: float = 500.00


class CostCeilingExceeded(Exception):
    """Raised when cost ceiling is exceeded."""
    pass


class DailyCeilingExceeded(CostCeilingExceeded):
    """Raised when daily ceiling for agent is exceeded."""
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        super().__init__(f"Daily ceiling exceeded for agent {agent_id}")


class GlobalCeilingExceeded(CostCeilingExceeded):
    """Raised when global daily ceiling is exceeded."""
    pass


class CostCeiling:
    """Enforce per-run, per-agent, per-day cost limits."""

    def __init__(self, limits: CostLimit = None):
        self.limits = limits or CostLimit()
        self.usage: Dict[str, float] = defaultdict(float)
        self.daily_reset: Dict[str, float] = {}
        self._lock = threading.Lock()

    def check(self, agent_id: str, run_cost: float) -> None:
        """Check if cost is within limits. Raises if exceeded."""
        with self._lock:
            self._reset_daily_if_needed(agent_id)

            if run_cost > self.limits.per_run:
                raise CostCeilingExceeded(
                    f"Run cost {run_cost:.2f} exceeds per-run limit {self.limits.per_run:.2f}"
                )

            agent_daily = self.usage[agent_id]
            if agent_daily + run_cost > self.limits.per_agent_day:
                raise DailyCeilingExceeded(agent_id)

            global_daily = sum(self.usage.values())
            if global_daily + run_cost > self.limits.global_day:
                raise GlobalCeilingExceeded(
                    f"Global daily ceiling {self.limits.global_day:.2f} would be exceeded"
                )

            # Record usage
            self.usage[agent_id] += run_cost

    def _reset_daily_if_needed(self, agent_id: str) -> None:
        now = time.time()
        day_start = now - (now % 86400)  # Start of current day

        if agent_id not in self.daily_reset or self.daily_reset[agent_id] < day_start:
            self.usage[agent_id] = 0.0
            self.daily_reset[agent_id] = day_start

    def get_usage(self, agent_id: str = None) -> Dict[str, float]:
        """Get current usage."""
        with self._lock:
            if agent_id:
                self._reset_daily_if_needed(agent_id)
                return {agent_id: self.usage.get(agent_id, 0.0)}
            # Reset all
            for aid in list(self.usage.keys()):
                self._reset_daily_if_needed(aid)
            return dict(self.usage)

    def get_limits(self) -> CostLimit:
        return self.limits

    def reset_agent(self, agent_id: str) -> None:
        """Reset usage for specific agent."""
        with self._lock:
            self.usage[agent_id] = 0.0
            self.daily_reset[agent_id] = time.time() - (time.time() % 86400)


# Global instance
cost_ceiling = CostCeiling()
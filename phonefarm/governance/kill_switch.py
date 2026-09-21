"""
Governance: Kill Switch.

Emergency halt for all agents.
"""

import threading
import logging
from typing import Callable, Dict, List, Optional
from dataclasses import dataclass
import time


logger = logging.getLogger(__name__)


@dataclass
class KillSwitchState:
    active: bool = False
    reason: str = ""
    activated_at: float = 0.0
    activated_by: str = ""


class KillSwitch:
    """Emergency halt for all agents."""

    _state = KillSwitchState()
    _lock = threading.Lock()
    _callbacks: List[Callable] = []

    @classmethod
    def activate(cls, reason: str, activated_by: str = "system") -> None:
        """Activate the kill switch."""
        with cls._lock:
            if cls._state.active:
                logger.warning(f"Kill switch already active: {cls._state.reason}")
                return

            cls._state.active = True
            cls._state.reason = reason
            cls._state.activated_at = time.time()
            cls._state.activated_by = activated_by

            logger.critical(f"KILL SWITCH ACTIVATED by {activated_by}: {reason}")

            # Notify callbacks
            for callback in cls._callbacks:
                try:
                    callback(cls._state)
                except Exception as e:
                    logger.error(f"Kill switch callback failed: {e}")

    @classmethod
    def deactivate(cls, deactivated_by: str = "system") -> None:
        """Deactivate the kill switch."""
        with cls._lock:
            if not cls._state.active:
                logger.warning("Kill switch not active")
                return

            logger.critical(f"KILL SWITCH DEACTIVATED by {deactivated_by}")
            cls._state = KillSwitchState()

    @classmethod
    def check(cls) -> None:
        """Check if kill switch is active. Raises if active."""
        with cls._lock:
            if cls._state.active:
                raise AgentHalted(f"Kill switch active: {cls._state.reason}")

    @classmethod
    def is_active(cls) -> bool:
        with cls._lock:
            return cls._state.active

    @classmethod
    def get_state(cls) -> KillSwitchState:
        with cls._lock:
            return KillSwitchState(
                active=cls._state.active,
                reason=cls._state.reason,
                activated_at=cls._state.activated_at,
                activated_by=cls._state.activated_by,
            )

    @classmethod
    def register_callback(cls, callback: Callable) -> None:
        """Register callback for kill switch activation."""
        with cls._lock:
            cls._callbacks.append(callback)

    @classmethod
    def unregister_callback(cls, callback: Callable) -> None:
        with cls._lock:
            if callback in cls._callbacks:
                cls._callbacks.remove(callback)


class AgentHalted(Exception):
    """Raised when agent is halted by kill switch."""
    pass


def with_kill_switch(func):
    """Decorator to check kill switch before execution."""
    def wrapper(*args, **kwargs):
        KillSwitch.check()
        return func(*args, **kwargs)
    return wrapper


async def with_kill_switch_async(func):
    """Async decorator to check kill switch before execution."""
    async def wrapper(*args, **kwargs):
        KillSwitch.check()
        return await func(*args, **kwargs)
    return wrapper
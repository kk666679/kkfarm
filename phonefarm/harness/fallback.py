from dataclasses import dataclass
from typing import Any, Dict, List, Optional
import asyncio


@dataclass
class FallbackConfig:
    """Configuration for fallback behavior."""
    max_retries: int = 3
    retry_delay: float = 1.0
    exponential_backoff: bool = True
    same_bar_threshold: float = 0.8


class ModelFallback:
    """Same-bar model fallback handler."""

    def __init__(self, primary_model, fallback_models: List = None, config: FallbackConfig = None):
        self.primary = primary_model
        self.fallbacks = fallback_models or []
        self.config = config or FallbackConfig()

    async def invoke_with_fallback(self, *args, **kwargs) -> Any:
        """Invoke primary model with automatic fallback."""
        last_error = None

        for attempt in range(self.config.max_retries):
            try:
                return await self.primary.invoke_async(*args, **kwargs)
            except Exception as e:
                last_error = e
                if attempt < self.config.max_retries - 1:
                    delay = self.config.retry_delay * (2 ** attempt if self.config.exponential_backoff else 1)
                    await asyncio.sleep(delay)

        for fallback in self.fallbacks:
            try:
                result = await fallback.invoke_async(*args, **kwargs)
                if hasattr(result, "confidence") and result.confidence >= self.config.same_bar_threshold:
                    return result
            except Exception:
                continue

        raise last_error or Exception("All models failed")


class CircuitBreaker:
    """Circuit breaker for model failures."""

    def __init__(self, failure_threshold: int = 5, timeout: float = 60.0):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = 0
        self.state = "closed"

    def record_success(self) -> None:
        self.failures = 0
        self.state = "closed"

    def record_failure(self) -> None:
        import time
        self.failures += 1
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.state = "open"

    def can_execute(self) -> bool:
        import time
        if self.state == "closed":
            return True
        if self.state == "open":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "half-open"
                return True
            return False
        return True


class FallbackManager:
    """Manages fallback strategies across the system."""

    def __init__(self):
        self.fallbacks: Dict[str, ModelFallback] = {}
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}

    def register_fallback(self, name: str, primary, fallbacks: List, config: FallbackConfig = None) -> None:
        self.fallbacks[name] = ModelFallback(primary, fallbacks, config)
        self.circuit_breakers[name] = CircuitBreaker()

    async def invoke(self, name: str, *args, **kwargs) -> Any:
        breaker = self.circuit_breakers.get(name)
        if breaker and not breaker.can_execute():
            raise Exception(f"Circuit breaker open for {name}")

        fallback = self.fallbacks.get(name)
        if not fallback:
            raise ValueError(f"No fallback registered for {name}")

        try:
            result = await fallback.invoke_with_fallback(*args, **kwargs)
            if breaker:
                breaker.record_success()
            return result
        except Exception as e:
            if breaker:
                breaker.record_failure()
            raise
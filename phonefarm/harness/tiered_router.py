from dataclasses import dataclass
from typing import Any, Dict, Optional, List
from abc import ABC, abstractmethod
import asyncio


@dataclass
class RouteResult:
    success: bool
    result: Any = None
    confidence: float = 0.0
    tier: str = "primary"
    metadata: Dict = None


class Tier(ABC):
    """Abstract base class for routing tiers."""

    @abstractmethod
    async def check(self, task: Dict) -> Optional[RouteResult]:
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        pass


class DeterministicTier(Tier):
    """Tier 0: Deterministic checks (regex, rules, cache)."""

    def __init__(self, rules: Dict = None, cache: Any = None):
        self.rules = rules or {}
        self.cache = cache

    @property
    def name(self) -> str:
        return "deterministic"

    async def check(self, task: Dict) -> Optional[RouteResult]:
        task_type = task.get("type", "")
        query = task.get("query", "")

        for pattern, handler in self.rules.items():
            if pattern in task_type or pattern in query.lower():
                result = handler(task)
                if result is not None:
                    return RouteResult(
                        success=True,
                        result=result,
                        confidence=1.0,
                        tier=self.name,
                        metadata={"pattern": pattern}
                    )

        if self.cache:
            cached = await self.cache.get(query)
            if cached:
                return RouteResult(
                    success=True,
                    result=cached,
                    confidence=1.0,
                    tier=self.name,
                    metadata={"cached": True}
                )

        return None


class SmallModelTier(Tier):
    """Tier 1: Small model for classification, extraction."""

    def __init__(self, model, threshold: float = 0.85):
        self.model = model
        self.threshold = threshold

    @property
    def name(self) -> str:
        return "small_model"

    async def check(self, task: Dict) -> Optional[RouteResult]:
        task_type = task.get("type", "")

        if task_type not in ["classify", "extract", "summarize"]:
            return None

        try:
            result = await self.model.invoke_async(
                input=task.get("query", ""),
                max_turns=3,
                token_budget=1000,
            )

            confidence = getattr(result, "confidence", 0.9)

            if confidence >= self.threshold:
                return RouteResult(
                    success=True,
                    result=result,
                    confidence=confidence,
                    tier=self.name,
                    metadata={"model": "small"}
                )
        except Exception:
            pass

        return None


class PrimaryModelTier(Tier):
    """Tier 2: Primary model for full reasoning."""

    def __init__(self, model):
        self.model = model

    @property
    def name(self) -> str:
        return "primary"

    async def check(self, task: Dict) -> Optional[RouteResult]:
        try:
            result = await self.model.invoke_async(
                input=task.get("query", ""),
                context=task.get("context", {}),
                max_turns=task.get("max_turns", 10),
                token_budget=task.get("token_budget", 8000),
            )
            return RouteResult(
                success=True,
                result=result,
                confidence=0.8,
                tier=self.name,
                metadata={"model": "primary"}
            )
        except Exception as e:
            return RouteResult(
                success=False,
                result=None,
                confidence=0.0,
                tier=self.name,
                metadata={"error": str(e)}
            )


class TieredRouter:
    """Route tasks: deterministic → small model → primary model."""

    def __init__(
        self,
        deterministic_tier: DeterministicTier = None,
        small_model_tier: SmallModelTier = None,
        primary_model_tier: PrimaryModelTier = None,
    ):
        self.tiers: List[Tier] = []

        if deterministic_tier:
            self.tiers.append(deterministic_tier)
        if small_model_tier:
            self.tiers.append(small_model_tier)
        if primary_model_tier:
            self.tiers.append(primary_model_tier)

    async def route(self, task: Dict) -> RouteResult:
        """Route task through tiers until one succeeds."""
        for tier in self.tiers:
            result = await tier.check(task)
            if result and result.success:
                return result

        return RouteResult(
            success=False,
            result=None,
            confidence=0.0,
            tier="none",
            metadata={"error": "All tiers failed"}
        )

    def add_tier(self, tier: Tier, position: int = None) -> None:
        """Add a tier at specified position or append."""
        if position is not None:
            self.tiers.insert(position, tier)
        else:
            self.tiers.append(tier)

    async def route_with_fallback(self, task: Dict, fallback_models: List = None) -> RouteResult:
        """Route with same-bar model fallback."""
        result = await self.route(task)

        if not result.success and fallback_models:
            for fallback in fallback_models:
                fallback_tier = PrimaryModelTier(fallback)
                fallback_result = await fallback_tier.check(task)
                if fallback_result and fallback_result.success:
                    fallback_result.metadata["fallback"] = True
                    return fallback_result

        return result
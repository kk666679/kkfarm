from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Callable
import asyncio
import json
from pathlib import Path
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@dataclass
class EvalDimension:
    name: str
    weight: float
    scorer: Callable


@dataclass
class EvalResult:
    dimension_scores: Dict[str, float]
    weighted_score: float
    passed: bool
    metadata: Dict = field(default_factory=dict)


class PhoneFarmEvalHarness:
    """Multi-dimensional agent evaluation harness."""

    DIMENSIONS = {
        "task_completion": 0.30,
        "tool_correctness": 0.20,
        "termination": 0.15,
        "resource_efficiency": 0.15,
        "output_quality": 0.10,
        "safety": 0.10,
    }

    def __init__(self, custom_dimensions: Dict[str, float] = None, scorers: Dict = None):
        self.dimensions = custom_dimensions or self.DIMENSIONS
        self.scorers = scorers or {}
        self._register_default_scorers()

    def _register_default_scorers(self):
        from eval.scorers import (
            TaskCompletionScorer,
            ToolCorrectnessScorer,
            TerminationScorer,
            ResourceEfficiencyScorer,
            OutputQualityScorer,
            SafetyScorer,
        )
        self.scorers.setdefault("task_completion", TaskCompletionScorer())
        self.scorers.setdefault("tool_correctness", ToolCorrectnessScorer())
        self.scorers.setdefault("termination", TerminationScorer())
        self.scorers.setdefault("resource_efficiency", ResourceEfficiencyScorer())
        self.scorers.setdefault("output_quality", OutputQualityScorer())
        self.scorers.setdefault("safety", SafetyScorer())

    async def evaluate(
        self,
        agent,
        task: Dict[str, Any],
        trace: Any,
        ground_truth: Any = None,
    ) -> EvalResult:
        """Run multi-dimensional evaluation."""
        scores = {}

        for dim, weight in self.dimensions.items():
            scorer = self.scorers.get(dim)
            if scorer:
                try:
                    scores[dim] = await scorer.score(agent, task, trace, ground_truth)
                except Exception as e:
                    scores[dim] = 0.0
                    print(f"Scorer {dim} failed: {e}")
            else:
                scores[dim] = 0.0

        weighted = sum(scores[d] * w for d, w in self.dimensions.items())
        passed = weighted >= 0.7  # 70% threshold

        return EvalResult(
            dimension_scores=scores,
            weighted_score=weighted,
            passed=passed,
            metadata={"dimensions": self.dimensions},
        )

    async def evaluate_batch(
        self,
        agent,
        tasks: List[Dict[str, Any]],
        traces: List[Any],
        ground_truths: List[Any] = None,
    ) -> List[EvalResult]:
        """Evaluate multiple tasks."""
        results = []
        for i, task in enumerate(tasks):
            trace = traces[i] if i < len(traces) else None
            gt = ground_truths[i] if ground_truths and i < len(ground_truths) else None
            result = await self.evaluate(agent, task, trace, gt)
            results.append(result)
        return results

    def aggregate_results(self, results: List[EvalResult]) -> Dict[str, Any]:
        """Aggregate batch results."""
        if not results:
            return {}

        dim_scores = {dim: [] for dim in self.dimensions}
        for r in results:
            for dim, score in r.dimension_scores.items():
                dim_scores[dim].append(score)

        return {
            "mean_weighted_score": sum(r.weighted_score for r in results) / len(results),
            "pass_rate": sum(1 for r in results if r.passed) / len(results),
            "dimension_means": {
                dim: sum(scores) / len(scores) if scores else 0
                for dim, scores in dim_scores.items()
            },
            "dimension_stds": {
                dim: (sum((s - sum(scores)/len(scores))**2 for s in scores) / len(scores))**0.5 if scores else 0
                for dim, scores in dim_scores.items()
            },
        }


class EvalFixture:
    """Test fixture for evaluation."""

    def __init__(self, name: str, task: Dict, expected: Any, metadata: Dict = None):
        self.name = name
        self.task = task
        self.expected = expected
        self.metadata = metadata or {}


class FixtureLoader:
    """Loads evaluation fixtures from files."""

    def __init__(self, fixtures_dir: str = "eval/fixtures"):
        self.fixtures_dir = Path(fixtures_dir)

    def load_golden(self, skill_name: str = None) -> List[EvalFixture]:
        """Load golden set fixtures."""
        fixtures = []
        pattern = f"{skill_name}/*.jsonl" if skill_name else "golden/*.jsonl"
        for file in self.fixtures_dir.glob(pattern):
            with open(file, "r") as f:
                for line in f:
                    if line.strip():
                        data = json.loads(line)
                        fixtures.append(EvalFixture(
                            name=file.stem,
                            task=data.get("input", {}),
                            expected=data.get("expected", {}),
                            metadata=data.get("metadata", {}),
                        ))
        return fixtures

    def load_adversarial(self) -> List[EvalFixture]:
        """Load adversarial fixtures."""
        fixtures = []
        for file in self.fixtures_dir.glob("adversarial/*.jsonl"):
            with open(file, "r") as f:
                for line in f:
                    if line.strip():
                        data = json.loads(line)
                        fixtures.append(EvalFixture(
                            name=file.stem,
                            task=data.get("input", {}),
                            expected=data.get("expected", {}),
                            metadata=data.get("metadata", {}),
                        ))
        return fixtures
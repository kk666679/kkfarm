from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
import json
import time
from pathlib import Path


@dataclass
class Baseline:
    """Baseline performance metrics."""
    name: str
    version: str
    metrics: Dict[str, float]
    timestamp: float = field(default_factory=time.time)
    metadata: Dict = field(default_factory=dict)


class RegressionTracker:
    """Tracks performance regression against baselines."""

    def __init__(self, baseline_dir: str = "eval/baselines"):
        self.baseline_dir = Path(baseline_dir)
        self.baseline_dir.mkdir(parents=True, exist_ok=True)
        self.baselines: Dict[str, Baseline] = {}
        self._load_baselines()

    def _load_baselines(self) -> None:
        for file in self.baseline_dir.glob("*.json"):
            with open(file, "r") as f:
                data = json.load(f)
                self.baselines[data["name"]] = Baseline(**data)

    def save_baseline(self, baseline: Baseline) -> None:
        """Save a new baseline."""
        self.baselines[baseline.name] = baseline
        file_path = self.baseline_dir / f"{baseline.name}.json"
        with open(file_path, "w") as f:
            json.dump({
                "name": baseline.name,
                "version": baseline.version,
                "metrics": baseline.metrics,
                "timestamp": baseline.timestamp,
                "metadata": baseline.metadata,
            }, f, indent=2)

    def compare(self, current_metrics: Dict[str, float], baseline_name: str) -> Dict[str, Any]:
        """Compare current metrics against baseline."""
        baseline = self.baselines.get(baseline_name)
        if not baseline:
            return {"error": f"Baseline {baseline_name} not found"}

        results = {}
        for metric, current_value in current_metrics.items():
            baseline_value = baseline.metrics.get(metric)
            if baseline_value is None:
                results[metric] = {"current": current_value, "baseline": None, "change": None}
                continue

            if baseline_value == 0:
                change_pct = 100.0 if current_value > 0 else 0.0
            else:
                change_pct = ((current_value - baseline_value) / baseline_value) * 100

            results[metric] = {
                "current": current_value,
                "baseline": baseline_value,
                "change_pct": change_pct,
                "regressed": change_pct < -5.0,  # 5% regression threshold
            }

        return {
            "baseline": baseline_name,
            "version": baseline.version,
            "results": results,
            "overall_regression": any(r.get("regressed", False) for r in results.values()),
        }

    def get_baseline(self, name: str) -> Optional[Baseline]:
        return self.baselines.get(name)

    def list_baselines(self) -> List[str]:
        return list(self.baselines.keys())
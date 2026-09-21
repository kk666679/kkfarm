from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from pathlib import Path


@dataclass
class SkillComposition:
    """A composed sequence of skills."""
    name: str
    skills: List[str]
    dependencies: Dict[str, List[str]] = None
    parallel: bool = False


class SkillComposer:
    """Composes multiple skills into workflows."""

    def __init__(self, registry):
        self.registry = registry

    def compose(self, name: str, skill_names: List[str], dependencies: Dict = None) -> SkillComposition:
        """Create a skill composition."""
        for skill_name in skill_names:
            if not self.registry.get_skill(skill_name):
                raise ValueError(f"Skill not found: {skill_name}")

        return SkillComposition(
            name=name,
            skills=skill_names,
            dependencies=dependencies or {},
        )

    def compose_from_goal(self, goal: str, available_skills: List[str]) -> SkillComposition:
        """Auto-compose skills based on goal (placeholder for LLM-based composition)."""
        # This would use an LLM to determine which skills to compose
        # For now, return a simple composition
        return SkillComposition(
            name=f"auto_{goal[:30]}",
            skills=available_skills[:3],
        )

    def execute_composition(
        self,
        composition: SkillComposition,
        context: Dict[str, Any],
        executor,
    ) -> Dict[str, Any]:
        """Execute a composed skill workflow."""
        results = {}

        if composition.parallel:
            # Execute in parallel (placeholder)
            for skill_name in composition.skills:
                results[skill_name] = executor.execute(skill_name, context)
        else:
            # Execute sequentially with dependency resolution
            executed = set()
            remaining = set(composition.skills)

            while remaining:
                for skill_name in list(remaining):
                    deps = composition.dependencies.get(skill_name, [])
                    if all(d in executed for d in deps):
                        # Merge previous results into context
                        context["skill_results"] = results
                        results[skill_name] = executor.execute(skill_name, context)
                        executed.add(skill_name)
                        remaining.remove(skill_name)
                        break
                else:
                    raise RuntimeError("Circular dependency detected")

        return {
            "composition": composition.name,
            "results": results,
        }


class SkillChain:
    """A linear chain of skills."""

    def __init__(self, skills: List[str]):
        self.skills = skills

    def execute(self, context: Dict, executor) -> Dict[str, Any]:
        results = {}
        for skill_name in self.skills:
            context["previous_result"] = results.get(self.skills[self.skills.index(skill_name) - 1]) if skill_name != self.skills[0] else None
            results[skill_name] = executor.execute(skill_name, context)
        return {"chain": self.skills, "results": results}


class SkillGraph:
    """A DAG of skills with dependencies."""

    def __init__(self):
        self.nodes: Dict[str, Dict] = {}
        self.edges: Dict[str, List[str]] = {}

    def add_skill(self, skill_name: str, config: Dict = None):
        self.nodes[skill_name] = config or {}
        self.edges[skill_name] = []

    def add_dependency(self, from_skill: str, to_skill: str):
        if from_skill not in self.edges:
            self.edges[from_skill] = []
        self.edges[from_skill].append(to_skill)

    def topological_sort(self) -> List[str]:
        """Return skills in execution order."""
        visited = set()
        temp = set()
        order = []

        def visit(node):
            if node in temp:
                raise ValueError("Cycle detected")
            if node in visited:
                return
            temp.add(node)
            for dep in self.edges.get(node, []):
                visit(dep)
            temp.remove(node)
            visited.add(node)
            order.append(node)

        for node in self.nodes:
            if node not in visited:
                visit(node)

        return order

    def execute(self, context: Dict, executor) -> Dict[str, Any]:
        order = self.topological_sort()
        results = {}
        for skill_name in order:
            context["skill_results"] = results
            results[skill_name] = executor.execute(skill_name, context)
        return {"graph": order, "results": results}
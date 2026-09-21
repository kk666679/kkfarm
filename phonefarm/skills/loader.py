from typing import Dict, List, Any, Optional, Callable
from pathlib import Path
import importlib.util
import yaml
import json


class SkillLoader:
    """Loads SKILL.md + scripts + references for skill execution."""

    def __init__(self, skills_root: str = "skills"):
        self.skills_root = Path(skills_root)
        self._script_cache: Dict[str, Any] = {}

    def load_skill_definition(self, skill_path: Path) -> Dict[str, Any]:
        """Load complete skill definition."""
        skill_md = skill_path / "SKILL.md"
        if not skill_md.exists():
            raise FileNotFoundError(f"SKILL.md not found in {skill_path}")

        with open(skill_md, "r") as f:
            content = f.read()

        frontmatter, body = self._parse_frontmatter(content)
        body_parsed = self._parse_body(body)

        definition = {
            **frontmatter,
            "body": body_parsed,
            "scripts": self._list_scripts(skill_path),
            "references": self._list_references(skill_path),
            "evals": self._list_evals(skill_path),
        }

        return definition

    def _parse_frontmatter(self, content: str) -> tuple:
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter = yaml.safe_load(parts[1]) or {}
                body = parts[2].strip()
                return frontmatter, body
        return {}, content

    def _parse_body(self, body: str) -> Dict[str, Any]:
        sections = {}
        current_section = None
        current_content = []

        for line in body.split("\n"):
            if line.startswith("## "):
                if current_section:
                    sections[current_section] = "\n".join(current_content).strip()
                current_section = line[3:].strip().lower().replace(" ", "_")
                current_content = []
            else:
                current_content.append(line)

        if current_section:
            sections[current_section] = "\n".join(current_content).strip()

        return sections

    def _list_scripts(self, skill_path: Path) -> List[str]:
        scripts_dir = skill_path / "scripts"
        if scripts_dir.exists():
            return [f.name for f in scripts_dir.glob("*.py")]
        return []

    def _list_references(self, skill_path: Path) -> List[str]:
        refs_dir = skill_path / "references"
        if refs_dir.exists():
            return [f.name for f in refs_dir.glob("*.md")]
        return []

    def _list_evals(self, skill_path: Path) -> List[str]:
        evals_dir = skill_path / "evals"
        if evals_dir.exists():
            return [f.name for f in evals_dir.glob("*.jsonl")]
        return []

    def load_script(self, skill_name: str, script_name: str) -> Callable:
        """Load and execute a skill script."""
        cache_key = f"{skill_name}/{script_name}"
        if cache_key in self._script_cache:
            return self._script_cache[cache_key]

        script_path = self.skills_root / skill_name / "scripts" / script_name
        if not script_path.exists():
            raise FileNotFoundError(f"Script not found: {script_path}")

        spec = importlib.util.spec_from_file_location(script_name, script_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        self._script_cache[cache_key] = module
        return module

    def load_reference(self, skill_name: str, ref_name: str) -> str:
        """Load a reference document."""
        ref_path = self.skills_root / skill_name / "references" / ref_name
        if not ref_path.exists():
            raise FileNotFoundError(f"Reference not found: {ref_path}")

        with open(ref_path, "r") as f:
            return f.read()

    def load_evals(self, skill_name: str) -> List[Dict]:
        """Load evaluation fixtures."""
        evals_dir = self.skills_root / skill_name / "evals"
        if not evals_dir.exists():
            return []

        results = []
        for eval_file in evals_dir.glob("*.jsonl"):
            with open(eval_file, "r") as f:
                for line in f:
                    if line.strip():
                        results.append(json.loads(line))
        return results


class SkillExecutor:
    """Executes a skill with its scripts and context."""

    def __init__(self, loader: SkillLoader):
        self.loader = loader

    def execute(self, skill_name: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute skill with given context."""
        definition = self.loader.load_skill_definition(
            self.loader.skills_root / skill_name
        )

        scripts = definition.get("scripts", [])
        results = {}

        for script_name in scripts:
            module = self.loader.load_script(skill_name, script_name)
            if hasattr(module, "run"):
                result = module.run(context)
                results[script_name] = result

        return {
            "skill": skill_name,
            "results": results,
            "definition": definition,
        }
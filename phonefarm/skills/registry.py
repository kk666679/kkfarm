from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from pathlib import Path
import yaml
import json


@dataclass
class SkillMetadata:
    """L1: Minimal skill metadata (name + description only)."""
    name: str
    description: str
    version: str = "1.0.0"
    author: str = ""
    license: str = "Apache-2.0"
    compatibility: str = ""
    allowed_tools: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)


@dataclass
class SkillBody:
    """L2: Full skill body from SKILL.md."""
    name: str
    description: str
    procedure: List[str] = field(default_factory=list)
    anti_patterns: List[str] = field(default_factory=list)
    examples: List[Dict] = field(default_factory=list)
    references: List[str] = field(default_factory=list)
    raw_content: str = ""


@dataclass
class Skill:
    """Complete skill with all progressive disclosure levels."""
    metadata: SkillMetadata
    body: Optional[SkillBody] = None
    resources: Dict[str, Any] = field(default_factory=dict)
    path: str = ""


class SkillRegistry:
    """Registry with progressive loading (L1/L2/L3)."""

    def __init__(self, skills_root: str = "skills"):
        self.skills_root = Path(skills_root)
        self._skills: Dict[str, Skill] = {}
        self._l1_loaded = False

    def discover(self) -> List[SkillMetadata]:
        """Discover all skills and load L1 metadata."""
        if self._l1_loaded:
            return [s.metadata for s in self._skills.values()]

        for skill_dir in self.skills_root.rglob("SKILL.md"):
            try:
                skill = self._load_skill(skill_dir.parent)
                self._skills[skill.metadata.name] = skill
            except Exception as e:
                print(f"Failed to load skill from {skill_dir}: {e}")

        self._l1_loaded = True
        return [s.metadata for s in self._skills.values()]

    def _load_skill(self, skill_dir: Path) -> Skill:
        skill_md = skill_dir / "SKILL.md"
        with open(skill_md, "r") as f:
            content = f.read()

        frontmatter, body = self._parse_skill_md(content)
        metadata = SkillMetadata(**frontmatter)

        skill = Skill(metadata=metadata, path=str(skill_dir))
        return skill

    def _parse_skill_md(self, content: str) -> tuple:
        """Parse SKILL.md with YAML frontmatter."""
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter = yaml.safe_load(parts[1])
                body = parts[2].strip()
                return frontmatter, body

        return {}, content

    def load_metadata(self) -> List[Dict[str, str]]:
        """L1: Return name + description only (~50 tokens each)."""
        if not self._l1_loaded:
            self.discover()
        return [
            {"name": s.metadata.name, "description": s.metadata.description}
            for s in self._skills.values()
        ]

    def load_body(self, skill_name: str) -> Optional[SkillBody]:
        """L2: Load full SKILL.md when task matches."""
        skill = self._skills.get(skill_name)
        if not skill:
            return None

        if skill.body:
            return skill.body

        skill_md = Path(skill.path) / "SKILL.md"
        with open(skill_md, "r") as f:
            content = f.read()

        _, body = self._parse_skill_md(content)
        skill.body = self._parse_body(body)
        return skill.body

    def _parse_body(self, body: str) -> SkillBody:
        """Parse skill body into structured format."""
        lines = body.split("\n")
        procedure = []
        anti_patterns = []
        examples = []
        current_section = None

        for line in lines:
            line = line.strip()
            if line.startswith("## Procedure") or line.startswith("## Steps"):
                current_section = "procedure"
            elif line.startswith("## Anti-patterns") or line.startswith("## Anti-pattern"):
                current_section = "anti_patterns"
            elif line.startswith("## Examples"):
                current_section = "examples"
            elif line.startswith("#") or line.startswith("##"):
                current_section = None
            elif line.startswith("- ") or line.startswith("1. "):
                content = line[2:].strip()
                if current_section == "procedure":
                    procedure.append(content)
                elif current_section == "anti_patterns":
                    anti_patterns.append(content)

        return SkillBody(
            name="",
            description="",
            procedure=procedure,
            anti_patterns=anti_patterns,
            examples=examples,
        )

    def load_resource(self, skill_name: str, resource: str) -> Optional[Any]:
        """L3: Load scripts/references on demand."""
        skill = self._skills.get(skill_name)
        if not skill:
            return None

        resource_path = Path(skill.path) / resource
        if not resource_path.exists():
            return None

        if resource_path.suffix == ".py":
            with open(resource_path, "r") as f:
                return f.read()
        elif resource_path.suffix in [".md", ".txt"]:
            with open(resource_path, "r") as f:
                return f.read()
        elif resource_path.suffix == ".json":
            with open(resource_path, "r") as f:
                return json.load(f)

        return None

    def get_skill(self, skill_name: str) -> Optional[Skill]:
        return self._skills.get(skill_name)

    def list_skills(self) -> List[str]:
        if not self._l1_loaded:
            self.discover()
        return list(self._skills.keys())

    def search(self, query: str) -> List[SkillMetadata]:
        """Search skills by name/description/tags."""
        if not self._l1_loaded:
            self.discover()

        query = query.lower()
        results = []
        for skill in self._skills.values():
            if (query in skill.metadata.name.lower() or
                query in skill.metadata.description.lower() or
                any(query in tag.lower() for tag in skill.metadata.tags)):
                results.append(skill.metadata)
        return results
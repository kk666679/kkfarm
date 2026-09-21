from typing import Any, Dict, List, Optional
from dataclasses import dataclass
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from memory.stm.working_set import WorkingSet
from memory.ltm.semantic import SemanticMemory
from memory.ltm.episodic import EpisodicMemory
from memory.ltm.procedural import ProceduralMemory


@dataclass
class RetrievalResult:
    """Result from hybrid retrieval."""
    stm_results: List[Any] = None
    semantic_results: List[Any] = None
    episodic_results: List[Any] = None
    procedural_results: List[Any] = None

    def __post_init__(self):
        self.stm_results = self.stm_results or []
        self.semantic_results = self.semantic_results or []
        self.episodic_results = self.episodic_results or []
        self.procedural_results = self.procedural_results or []

    def all(self) -> List[Any]:
        return self.stm_results + self.semantic_results + self.episodic_results + self.procedural_results


class HybridRetrieval:
    """Hybrid search across STM and all LTM types."""

    def __init__(
        self,
        stm: WorkingSet,
        semantic: SemanticMemory,
        episodic: EpisodicMemory,
        procedural: ProceduralMemory,
    ):
        self.stm = stm
        self.semantic = semantic
        self.episodic = episodic
        self.procedural = procedural

    async def search(
        self,
        query: str,
        stm_limit: int = 5,
        semantic_limit: int = 5,
        episodic_limit: int = 3,
        procedural_limit: int = 3,
        embed_fn=None,
        session_id: str = None,
    ) -> RetrievalResult:
        """Search across all memory systems."""
        # STM search (fast, recent)
        stm_results = self.stm.search(query, stm_limit)

        # Semantic search (facts)
        semantic_results = await self.semantic.search(query, semantic_limit, embed_fn)

        # Episodic search (events)
        episodic_results = await self.episodic.search(
            event_type=None,
            session_id=session_id,
            limit=episodic_limit,
        )

        # Procedural search (patterns)
        procedural_results = await self.procedural.search(
            pattern_type=None,
            min_success_rate=0.5,
            limit=procedural_limit,
        )

        return RetrievalResult(
            stm_results=stm_results,
            semantic_results=semantic_results,
            episodic_results=episodic_results,
            procedural_results=procedural_results,
        )

    def format_for_context(self, result: RetrievalResult, max_tokens: int = 4000) -> str:
        """Format retrieval results for LLM context."""
        parts = []
        tokens_used = 0

        def add_section(title: str, items: List[Any], formatter):
            nonlocal tokens_used
            if not items:
                return
            section = [title]
            for item in items:
                text = formatter(item)
                est_tokens = len(text) // 4
                if tokens_used + est_tokens > max_tokens:
                    break
                section.append(f"  - {text}")
                tokens_used += est_tokens
            parts.append("\n".join(section))

        add_section(
            "Recent Context (STM)",
            result.stm_results,
            lambda x: str(x.content)[:200]
        )

        add_section(
            "Known Facts (Semantic)",
            result.semantic_results,
            lambda x: x.content[:200]
        )

        add_section(
            "Past Events (Episodic)",
            result.episodic_results,
            lambda x: f"{x.event_type}: {str(x.content)[:150]}"
        )

        add_section(
            "Known Patterns (Procedural)",
            result.procedural_results,
            lambda x: f"{x.name}: {x.description[:150]}"
        )

        return "\n\n".join(parts)
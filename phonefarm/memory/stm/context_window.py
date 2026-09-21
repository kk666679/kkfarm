from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from memory.stm.working_set import WorkingSet, STMEntry, Attention


@dataclass
class ContextWindowConfig:
    max_tokens: int = 8000
    reserve_tokens: int = 1000
    include_recent: int = 5
    include_relevant: int = 10
    relevance_threshold: float = 0.3


class ContextWindow:
    """Manages token budget for LLM context assembly."""

    def __init__(self, working_set: WorkingSet, config: ContextWindowConfig = None):
        self.working_set = working_set
        self.config = config or ContextWindowConfig()

    def assemble(self, query: str = None, system_prompt: str = None) -> Dict[str, Any]:
        """Assemble context within token budget."""
        available = self.config.max_tokens - self.config.reserve_tokens
        if system_prompt:
            available -= self._estimate_tokens(system_prompt)

        context = {
            "system_prompt": system_prompt,
            "recent": [],
            "relevant": [],
            "total_tokens": 0,
        }

        # Add recent entries
        recent = self.working_set.get_recent(self.config.include_recent)
        for entry in recent:
            tokens = self._estimate_tokens(str(entry.content))
            if context["total_tokens"] + tokens <= available:
                context["recent"].append(entry)
                context["total_tokens"] += tokens

        # Add relevant entries
        if query:
            relevant = self.working_set.search(query, self.config.include_relevant)
            for entry in relevant:
                if entry in context["recent"]:
                    continue
                score = Attention.composite_score(entry, query)
                if score >= self.config.relevance_threshold:
                    tokens = self._estimate_tokens(str(entry.content))
                    if context["total_tokens"] + tokens <= available:
                        context["relevant"].append(entry)
                        context["total_tokens"] += tokens

        return context

    def _estimate_tokens(self, text: str) -> int:
        """Rough token estimation (4 chars ≈ 1 token)."""
        return max(1, len(text) // 4)

    def format_for_llm(self, context: Dict[str, Any]) -> List[Dict[str, str]]:
        """Format context for LLM consumption."""
        messages = []

        if context.get("system_prompt"):
            messages.append({"role": "system", "content": context["system_prompt"]})

        if context.get("recent"):
            recent_text = "Recent context:\n" + "\n".join(
                f"- {e.content}" for e in context["recent"]
            )
            messages.append({"role": "user", "content": recent_text})

        if context.get("relevant"):
            relevant_text = "Relevant context:\n" + "\n".join(
                f"- {e.content}" for e in context["relevant"]
            )
            messages.append({"role": "user", "content": relevant_text})

        return messages
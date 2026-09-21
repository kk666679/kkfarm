from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import time
import uuid


@dataclass
class STMEntry:
    """Single entry in short-term memory."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content: Any = None
    metadata: Dict = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    access_count: int = 0
    salience: float = 1.0
    tokens: int = 0


class WorkingSet:
    """Session-scoped short-term memory. Dies on restart."""

    def __init__(
        self,
        max_size: int = 200,
        token_budget: int = 8000,
        ttl_seconds: float = 1800.0,
    ):
        self.max_size = max_size
        self.token_budget = token_budget
        self.ttl = ttl_seconds
        self.items: List[STMEntry] = []

    def write(self, entry: STMEntry) -> None:
        """Add entry to working set."""
        self.items.append(entry)
        self._evict()

    def write_content(
        self,
        content: Any,
        metadata: Dict = None,
        salience: float = 1.0,
        tokens: int = 0,
    ) -> STMEntry:
        """Convenience method to write content directly."""
        entry = STMEntry(
            content=content,
            metadata=metadata or {},
            salience=salience,
            tokens=tokens,
        )
        self.write(entry)
        return entry

    def read(self, entry_id: str) -> Optional[STMEntry]:
        """Read entry by ID."""
        for entry in self.items:
            if entry.id == entry_id:
                entry.access_count += 1
                return entry
        return None

    def search(self, query: str, limit: int = 10) -> List[STMEntry]:
        """Search entries by content similarity (simple text match)."""
        scored = []
        query_lower = query.lower()
        for entry in self.items:
            if self._is_expired(entry):
                continue
            content_str = str(entry.content).lower()
            if query_lower in content_str:
                score = entry.salience * (1 + entry.access_count * 0.1)
                scored.append((score, entry))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [e for _, e in scored[:limit]]

    def get_recent(self, limit: int = 10) -> List[STMEntry]:
        """Get most recent entries."""
        valid = [e for e in self.items if not self._is_expired(e)]
        return valid[-limit:]

    def get_context_window(self, max_tokens: int = None) -> List[STMEntry]:
        """Get entries fitting in token budget."""
        budget = max_tokens or self.token_budget
        result = []
        used = 0
        for entry in reversed(self.items):
            if self._is_expired(entry):
                continue
            if used + entry.tokens <= budget:
                result.append(entry)
                used += entry.tokens
            else:
                break
        return list(reversed(result))

    def _evict(self) -> None:
        """Evict entries based on TTL, LRU, and token budget."""
        now = time.time()

        # Remove expired
        self.items = [e for e in self.items if not self._is_expired(e)]

        # Remove excess by LRU + low salience
        while len(self.items) > self.max_size:
            self.items.sort(key=lambda e: (e.salience, e.access_count, e.timestamp))
            self.items.pop(0)

        # Enforce token budget
        total_tokens = sum(e.tokens for e in self.items)
        while total_tokens > self.token_budget and self.items:
            self.items.sort(key=lambda e: (e.salience, e.access_count, e.timestamp))
            removed = self.items.pop(0)
            total_tokens -= removed.tokens

    def _is_expired(self, entry: STMEntry) -> bool:
        return (time.time() - entry.timestamp) > self.ttl

    def clear(self) -> None:
        """Clear all entries."""
        self.items.clear()

    def __len__(self) -> int:
        return len([e for e in self.items if not self._is_expired(e)])


class Attention:
    """Salience scoring for STM entries."""

    @staticmethod
    def score_recency(entry: STMEntry, now: float = None) -> float:
        """Score based on recency (0-1)."""
        now = now or time.time()
        age = now - entry.timestamp
        return max(0.0, 1.0 - (age / 3600.0))  # Decay over 1 hour

    @staticmethod
    def score_access(entry: STMEntry) -> float:
        """Score based on access frequency."""
        return min(1.0, entry.access_count * 0.2)

    @staticmethod
    def score_relevance(entry: STMEntry, query: str) -> float:
        """Score based on query relevance."""
        content_str = str(entry.content).lower()
        query_lower = query.lower()
        if query_lower in content_str:
            return 1.0
        # Simple word overlap
        query_words = set(query_lower.split())
        content_words = set(content_str.split())
        if query_words and content_words:
            return len(query_words & content_words) / len(query_words)
        return 0.0

    @staticmethod
    def composite_score(entry: STMEntry, query: str = None, now: float = None) -> float:
        """Composite salience score."""
        base = entry.salience
        recency = Attention.score_recency(entry, now)
        access = Attention.score_access(entry)
        relevance = Attention.score_relevance(entry, query) if query else 0.5

        return base * 0.3 + recency * 0.3 + access * 0.2 + relevance * 0.2
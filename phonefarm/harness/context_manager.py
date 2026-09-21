from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import time


@dataclass
class ContextEntry:
    key: str
    value: Any
    timestamp: float = field(default_factory=time.time)
    ttl: Optional[float] = None
    tokens: int = 0


class ContextManager:
    """Progressive context assembly with token budget management."""

    def __init__(
        self,
        max_tokens: int = 8000,
        max_entries: int = 100,
        default_ttl: float = 1800.0,
    ):
        self.max_tokens = max_tokens
        self.max_entries = max_entries
        self.default_ttl = default_ttl
        self.entries: Dict[str, ContextEntry] = {}
        self.access_order: List[str] = []

    def add(self, key: str, value: Any, ttl: Optional[float] = None, tokens: int = 0) -> None:
        """Add an entry to the context."""
        entry = ContextEntry(
            key=key,
            value=value,
            ttl=ttl or self.default_ttl,
            tokens=tokens,
        )
        self._evict_if_needed(entry)
        self.entries[key] = entry
        self.access_order.append(key)
        self._cleanup_expired()

    def get(self, key: str) -> Optional[Any]:
        """Get an entry by key, updating access order."""
        entry = self.entries.get(key)
        if entry is None:
            return None

        if self._is_expired(entry):
            del self.entries[key]
            if key in self.access_order:
                self.access_order.remove(key)
            return None

        if key in self.access_order:
            self.access_order.remove(key)
        self.access_order.append(key)
        return entry.value

    def search(self, query: str, limit: int = 10) -> List[Any]:
        """Simple search across context values."""
        results = []
        for key in self.access_order:
            entry = self.entries.get(key)
            if entry and not self._is_expired(entry):
                if query.lower() in str(entry.value).lower():
                    results.append(entry.value)
                    if len(results) >= limit:
                        break
        return results

    def assemble(self, budget_tokens: Optional[int] = None) -> Dict[str, Any]:
        """Assemble context within token budget."""
        budget = budget_tokens or self.max_tokens
        result = {}
        used_tokens = 0

        for key in reversed(self.access_order):
            entry = self.entries.get(key)
            if entry and not self._is_expired(entry):
                if used_tokens + entry.tokens <= budget:
                    result[key] = entry.value
                    used_tokens += entry.tokens
                else:
                    break

        return result

    def _evict_if_needed(self, new_entry: ContextEntry) -> None:
        """Evict entries if adding new one would exceed limits."""
        while len(self.entries) >= self.max_entries:
            self._evict_lru()

        current_tokens = sum(e.tokens for e in self.entries.values())
        while current_tokens + new_entry.tokens > self.max_tokens and self.entries:
            self._evict_lru()
            current_tokens = sum(e.tokens for e in self.entries.values())

    def _evict_lru(self) -> None:
        """Evict least recently used entry."""
        if self.access_order:
            key = self.access_order.pop(0)
            self.entries.pop(key, None)

    def _cleanup_expired(self) -> None:
        """Remove expired entries."""
        now = time.time()
        expired = [
            key for key, entry in self.entries.items()
            if entry.ttl and (now - entry.timestamp) > entry.ttl
        ]
        for key in expired:
            self.entries.pop(key, None)
            if key in self.access_order:
                self.access_order.remove(key)

    def _is_expired(self, entry: ContextEntry) -> bool:
        if entry.ttl is None:
            return False
        return (time.time() - entry.timestamp) > entry.ttl

    def clear(self) -> None:
        """Clear all context."""
        self.entries.clear()
        self.access_order.clear()
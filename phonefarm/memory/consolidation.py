from typing import Any, Dict, List, Optional
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from memory.stm.working_set import WorkingSet, STMEntry
from memory.ltm.semantic import SemanticMemory, SemanticFact
from memory.ltm.episodic import EpisodicMemory, EpisodicEvent
from memory.ltm.procedural import ProceduralMemory, ProceduralPattern


async def should_promote(entry: STMEntry, threshold: float = 0.7) -> bool:
    """Determine if STM entry should be promoted to LTM."""
    # Promote if high salience, frequently accessed, or marked important
    return (
        entry.salience >= threshold or
        entry.access_count >= 3 or
        entry.metadata.get("promote", False)
    )


async def encode_for_semantic(entry: STMEntry, embed_fn) -> SemanticFact:
    """Encode STM entry as semantic fact."""
    content = str(entry.content)
    embedding = await embed_fn(content) if embed_fn else []
    return SemanticFact(
        content=content,
        embedding=embedding,
        metadata=entry.metadata,
        salience=entry.salience,
    )


async def encode_for_episodic(entry: STMEntry, session_id: str) -> EpisodicEvent:
    """Encode STM entry as episodic event."""
    return EpisodicEvent(
        session_id=session_id,
        event_type=entry.metadata.get("type", "observation"),
        content=entry.content,
        metadata=entry.metadata,
        outcome=entry.metadata.get("outcome", ""),
    )


async def encode_for_procedural(entry: STMEntry) -> Optional[ProceduralPattern]:
    """Encode STM entry as procedural pattern (if applicable)."""
    if entry.metadata.get("type") != "pattern":
        return None

    return ProceduralPattern(
        name=entry.metadata.get("name", "unnamed_pattern"),
        pattern_type=entry.metadata.get("pattern_type", "heuristic"),
        description=str(entry.content),
        steps=entry.metadata.get("steps", []),
        conditions=entry.metadata.get("conditions", {}),
    )


async def deduplicate(candidates: List[Any], ltm_store) -> List[Any]:
    """Remove duplicates from candidates before LTM insertion."""
    # Simple deduplication by content hash
    seen = set()
    unique = []
    for candidate in candidates:
        content_hash = hash(str(candidate.content))
        if content_hash not in seen:
            seen.add(content_hash)
            unique.append(candidate)
    return unique


async def consolidate(
    stm: WorkingSet,
    semantic: SemanticMemory,
    episodic: EpisodicMemory,
    procedural: ProceduralMemory,
    session_id: str,
    embed_fn=None,
    force: bool = False,
) -> Dict[str, int]:
    """Promote high-salience STM items to LTM."""
    promoted = {"semantic": 0, "episodic": 0, "procedural": 0}

    # Collect candidates
    semantic_candidates = []
    episodic_candidates = []
    procedural_candidates = []

    for entry in stm.items:
        if force or await should_promote(entry):
            semantic_candidates.append(await encode_for_semantic(entry, embed_fn))
            episodic_candidates.append(await encode_for_episodic(entry, session_id))
            procedural = await encode_for_procedural(entry)
            if procedural:
                procedural_candidates.append(procedural)

    # Deduplicate
    semantic_candidates = await deduplicate(semantic_candidates, semantic)
    episodic_candidates = await deduplicate(episodic_candidates, episodic)
    procedural_candidates = await deduplicate(procedural_candidates, procedural)

    # Write to LTM
    for fact in semantic_candidates:
        await semantic.write(fact)
        promoted["semantic"] += 1

    for event in episodic_candidates:
        await episodic.write(event)
        promoted["episodic"] += 1

    for pattern in procedural_candidates:
        await procedural.write(pattern)
        promoted["procedural"] += 1

    return {
        "promoted": sum(promoted.values()),
        "semantic": promoted["semantic"],
        "episodic": promoted["episodic"],
        "procedural": promoted["procedural"],
        "stm_size": len(stm),
    }


class ConsolidationScheduler:
    """Schedules periodic consolidation."""

    def __init__(
        self,
        stm: WorkingSet,
        semantic: SemanticMemory,
        episodic: EpisodicMemory,
        procedural: ProceduralMemory,
        interval: int = 300,  # 5 minutes
        embed_fn=None,
    ):
        self.stm = stm
        self.semantic = semantic
        self.episodic = episodic
        self.procedural = procedural
        self.interval = interval
        self.embed_fn = embed_fn
        self.running = False
        self._task = None

    async def start(self, session_id: str) -> None:
        self.running = True
        self._task = asyncio.create_task(self._run(session_id))

    async def stop(self) -> None:
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _run(self, session_id: str) -> None:
        import asyncio
        while self.running:
            await asyncio.sleep(self.interval)
            if self.running:
                try:
                    await consolidate(
                        self.stm,
                        self.semantic,
                        self.episodic,
                        self.procedural,
                        session_id,
                        self.embed_fn,
                    )
                except Exception as e:
                    print(f"Consolidation error: {e}")
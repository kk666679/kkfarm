from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import sqlite3
import json
import time
import uuid
from pathlib import Path


@dataclass
class SemanticFact:
    """A fact in semantic memory."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content: str = ""
    embedding: List[float] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)
    salience: float = 1.0
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    access_count: int = 0


class SemanticMemory:
    """Long-term factual memory. Persists across sessions."""

    def __init__(self, db_path: str = "./memory/semantic.db", vector_store=None):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.vector_store = vector_store
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS semantic_memories (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    embedding TEXT,
                    metadata TEXT,
                    salience REAL DEFAULT 1.0,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL,
                    access_count INTEGER DEFAULT 0
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_salience ON semantic_memories(salience DESC)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_created ON semantic_memories(created_at DESC)
            """)

    async def write(self, fact: SemanticFact) -> None:
        """Store a fact."""
        if self.vector_store and fact.embedding:
            self.vector_store.insert(fact.id, fact.embedding)

        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO semantic_memories
                (id, content, embedding, metadata, salience, created_at, updated_at, access_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                fact.id,
                fact.content,
                json.dumps(fact.embedding) if fact.embedding else None,
                json.dumps(fact.metadata),
                fact.salience,
                fact.created_at,
                time.time(),
                fact.access_count,
            ))

    async def search(self, query: str, limit: int = 10, embed_fn=None) -> List[SemanticFact]:
        """Search facts by query."""
        if self.vector_store and embed_fn:
            query_emb = await embed_fn(query)
            ids = self.vector_store.search(query_emb, limit)
            return [await self.get_by_id(fid) for fid in ids if await self.get_by_id(fid)]

        # Fallback: text search
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT id, content, embedding, metadata, salience, created_at, updated_at, access_count
                FROM semantic_memories
                WHERE content LIKE ?
                ORDER BY salience DESC, access_count DESC
                LIMIT ?
            """, (f"%{query}%", limit))
            return [self._row_to_fact(row) for row in cursor.fetchall()]

    async def get_by_id(self, fact_id: str) -> Optional[SemanticFact]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT id, content, embedding, metadata, salience, created_at, updated_at, access_count FROM semantic_memories WHERE id = ?",
                (fact_id,)
            )
            row = cursor.fetchone()
            if row:
                fact = self._row_to_fact(row)
                fact.access_count += 1
                await self.write(fact)
                return fact
        return None

    async def update_salience(self, fact_id: str, delta: float) -> None:
        fact = await self.get_by_id(fact_id)
        if fact:
            fact.salience = max(0.0, min(1.0, fact.salience + delta))
            await self.write(fact)

    def _row_to_fact(self, row) -> SemanticFact:
        return SemanticFact(
            id=row[0],
            content=row[1],
            embedding=json.loads(row[2]) if row[2] else [],
            metadata=json.loads(row[3]) if row[3] else {},
            salience=row[4],
            created_at=row[5],
            updated_at=row[6],
            access_count=row[7],
        )
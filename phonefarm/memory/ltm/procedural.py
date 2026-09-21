from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import sqlite3
import json
import time
import uuid
from pathlib import Path


@dataclass
class ProceduralPattern:
    """A learned pattern/skill in procedural memory."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    pattern_type: str = ""  # skill, workflow, heuristic
    description: str = ""
    steps: List[Dict] = field(default_factory=list)
    conditions: Dict = field(default_factory=dict)
    success_rate: float = 0.0
    usage_count: int = 0
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    metadata: Dict = field(default_factory=dict)


class ProceduralMemory:
    """Long-term procedural memory (skills, patterns)."""

    def __init__(self, db_path: str = "./memory/procedural.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS procedural_patterns (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    pattern_type TEXT NOT NULL,
                    description TEXT,
                    steps TEXT NOT NULL,
                    conditions TEXT,
                    success_rate REAL DEFAULT 0.0,
                    usage_count INTEGER DEFAULT 0,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL,
                    metadata TEXT
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_name ON procedural_patterns(name)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_type ON procedural_patterns(pattern_type)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_success ON procedural_patterns(success_rate DESC)
            """)

    async def write(self, pattern: ProceduralPattern) -> None:
        """Store a pattern."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO procedural_patterns
                (id, name, pattern_type, description, steps, conditions, success_rate, usage_count, created_at, updated_at, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pattern.id,
                pattern.name,
                pattern.pattern_type,
                pattern.description,
                json.dumps(pattern.steps),
                json.dumps(pattern.conditions),
                pattern.success_rate,
                pattern.usage_count,
                pattern.created_at,
                time.time(),
                json.dumps(pattern.metadata),
            ))

    async def get(self, pattern_id: str) -> Optional[ProceduralPattern]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT id, name, pattern_type, description, steps, conditions, success_rate, usage_count, created_at, updated_at, metadata
                FROM procedural_patterns WHERE id = ?
            """, (pattern_id,))
            row = cursor.fetchone()
            if row:
                return self._row_to_pattern(row)
        return None

    async def get_by_name(self, name: str) -> Optional[ProceduralPattern]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT id, name, pattern_type, description, steps, conditions, success_rate, usage_count, created_at, updated_at, metadata
                FROM procedural_patterns WHERE name = ?
            """, (name,))
            row = cursor.fetchone()
            if row:
                return self._row_to_pattern(row)
        return None

    async def search(
        self,
        pattern_type: str = None,
        min_success_rate: float = 0.0,
        limit: int = 20
    ) -> List[ProceduralPattern]:
        """Search patterns."""
        query = """
            SELECT id, name, pattern_type, description, steps, conditions, success_rate, usage_count, created_at, updated_at, metadata
            FROM procedural_patterns WHERE 1=1
        """
        params = []

        if pattern_type:
            query += " AND pattern_type = ?"
            params.append(pattern_type)
        if min_success_rate > 0:
            query += " AND success_rate >= ?"
            params.append(min_success_rate)

        query += " ORDER BY success_rate DESC, usage_count DESC LIMIT ?"
        params.append(limit)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(query, params)
            return [self._row_to_pattern(row) for row in cursor.fetchall()]

    async def record_usage(self, pattern_id: str, success: bool) -> None:
        """Record pattern usage outcome."""
        pattern = await self.get(pattern_id)
        if pattern:
            pattern.usage_count += 1
            # Update success rate with exponential moving average
            alpha = 0.1
            pattern.success_rate = pattern.success_rate * (1 - alpha) + (1.0 if success else 0.0) * alpha
            pattern.updated_at = time.time()
            await self.write(pattern)

    def _row_to_pattern(self, row) -> ProceduralPattern:
        return ProceduralPattern(
            id=row[0],
            name=row[1],
            pattern_type=row[2],
            description=row[3] or "",
            steps=json.loads(row[4]) if row[4] else [],
            conditions=json.loads(row[5]) if row[5] else {},
            success_rate=row[6],
            usage_count=row[7],
            created_at=row[8],
            updated_at=row[9],
            metadata=json.loads(row[10]) if row[10] else {},
        )
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import sqlite3
import json
import time
import uuid
from pathlib import Path


@dataclass
class EpisodicEvent:
    """An event in episodic memory."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = ""
    event_type: str = ""
    content: Any = None
    metadata: Dict = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    duration: float = 0.0
    outcome: str = ""  # success, failure, partial


class EpisodicMemory:
    """Long-term episodic memory (events, sessions)."""

    def __init__(self, db_path: str = "./memory/episodic.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS episodic_events (
                    id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    timestamp REAL NOT NULL,
                    duration REAL DEFAULT 0.0,
                    outcome TEXT DEFAULT ''
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_session ON episodic_events(session_id)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_timestamp ON episodic_events(timestamp DESC)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_type ON episodic_events(event_type)
            """)

    async def write(self, event: EpisodicEvent) -> None:
        """Store an event."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO episodic_events
                (id, session_id, event_type, content, metadata, timestamp, duration, outcome)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event.id,
                event.session_id,
                event.event_type,
                json.dumps(event.content) if event.content else None,
                json.dumps(event.metadata),
                event.timestamp,
                event.duration,
                event.outcome,
            ))

    async def get_session_events(self, session_id: str) -> List[EpisodicEvent]:
        """Get all events for a session."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT id, session_id, event_type, content, metadata, timestamp, duration, outcome
                FROM episodic_events
                WHERE session_id = ?
                ORDER BY timestamp ASC
            """, (session_id,))
            return [self._row_to_event(row) for row in cursor.fetchall()]

    async def search(
        self,
        event_type: str = None,
        session_id: str = None,
        since: float = None,
        limit: int = 100
    ) -> List[EpisodicEvent]:
        """Search events."""
        query = "SELECT id, session_id, event_type, content, metadata, timestamp, duration, outcome FROM episodic_events WHERE 1=1"
        params = []

        if event_type:
            query += " AND event_type = ?"
            params.append(event_type)
        if session_id:
            query += " AND session_id = ?"
            params.append(session_id)
        if since:
            query += " AND timestamp > ?"
            params.append(since)

        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(query, params)
            return [self._row_to_event(row) for row in cursor.fetchall()]

    async def get_recent_sessions(self, limit: int = 10) -> List[str]:
        """Get recent session IDs."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT DISTINCT session_id FROM episodic_events
                ORDER BY timestamp DESC LIMIT ?
            """, (limit,))
            return [row[0] for row in cursor.fetchall()]

    def _row_to_event(self, row) -> EpisodicEvent:
        return EpisodicEvent(
            id=row[0],
            session_id=row[1],
            event_type=row[2],
            content=json.loads(row[3]) if row[3] else None,
            metadata=json.loads(row[4]) if row[4] else {},
            timestamp=row[5],
            duration=row[6],
            outcome=row[7],
        )
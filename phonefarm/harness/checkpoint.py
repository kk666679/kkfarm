from dataclasses import dataclass, field
from typing import Any, Dict, Optional, List
import json
import time
import sqlite3
import os
from pathlib import Path


@dataclass
class Checkpoint:
    """Durable state snapshot."""
    id: str
    agent_id: str
    session_id: str
    state: Dict[str, Any]
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)
    step: int = 0


class CheckpointStore:
    """Persistent checkpoint storage using SQLite."""

    def __init__(self, db_path: str = "./checkpoints.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self) -> None:
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS checkpoints (
                    id TEXT PRIMARY KEY,
                    agent_id TEXT NOT NULL,
                    session_id TEXT NOT NULL,
                    state TEXT NOT NULL,
                    metadata TEXT,
                    timestamp REAL NOT NULL,
                    step INTEGER NOT NULL
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_session ON checkpoints(session_id)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_agent ON checkpoints(agent_id)
            """)

    def save(self, checkpoint: Checkpoint) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO checkpoints (id, agent_id, session_id, state, metadata, timestamp, step)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                checkpoint.id,
                checkpoint.agent_id,
                checkpoint.session_id,
                json.dumps(checkpoint.state),
                json.dumps(checkpoint.metadata),
                checkpoint.timestamp,
                checkpoint.step,
            ))

    def load(self, checkpoint_id: str) -> Optional[Checkpoint]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT id, agent_id, session_id, state, metadata, timestamp, step FROM checkpoints WHERE id = ?",
                (checkpoint_id,)
            )
            row = cursor.fetchone()
            if row:
                return Checkpoint(
                    id=row[0],
                    agent_id=row[1],
                    session_id=row[2],
                    state=json.loads(row[3]),
                    metadata=json.loads(row[4]) if row[4] else {},
                    timestamp=row[5],
                    step=row[6],
                )
        return None

    def load_latest(self, session_id: str) -> Optional[Checkpoint]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT id, agent_id, session_id, state, metadata, timestamp, step FROM checkpoints WHERE session_id = ? ORDER BY timestamp DESC LIMIT 1",
                (session_id,)
            )
            row = cursor.fetchone()
            if row:
                return Checkpoint(
                    id=row[0],
                    agent_id=row[1],
                    session_id=row[2],
                    state=json.loads(row[3]),
                    metadata=json.loads(row[4]) if row[4] else {},
                    timestamp=row[5],
                    step=row[6],
                )
        return None

    def list_sessions(self, agent_id: str = None) -> List[str]:
        with sqlite3.connect(self.db_path) as conn:
            if agent_id:
                cursor = conn.execute(
                    "SELECT DISTINCT session_id FROM checkpoints WHERE agent_id = ? ORDER BY timestamp DESC",
                    (agent_id,)
                )
            else:
                cursor = conn.execute(
                    "SELECT DISTINCT session_id FROM checkpoints ORDER BY timestamp DESC"
                )
            return [row[0] for row in cursor.fetchall()]

    def delete(self, checkpoint_id: str) -> bool:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM checkpoints WHERE id = ?", (checkpoint_id,))
            return cursor.rowcount > 0


class CheckpointManager:
    """Manages checkpoints for agent execution."""

    def __init__(self, store: CheckpointStore = None, auto_save_interval: int = 5):
        self.store = store or CheckpointStore()
        self.auto_save_interval = auto_save_interval
        self.current_checkpoint: Optional[Checkpoint] = None
        self.step_count = 0

    def create_checkpoint(
        self,
        agent_id: str,
        session_id: str,
        state: Dict[str, Any],
        metadata: Dict = None,
    ) -> Checkpoint:
        import uuid
        checkpoint = Checkpoint(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            session_id=session_id,
            state=state,
            metadata=metadata or {},
            step=self.step_count,
        )
        self.store.save(checkpoint)
        self.current_checkpoint = checkpoint
        return checkpoint

    def auto_save(self, agent_id: str, session_id: str, state: Dict[str, Any], metadata: Dict = None) -> None:
        self.step_count += 1
        if self.step_count % self.auto_save_interval == 0:
            self.create_checkpoint(agent_id, session_id, state, metadata)

    def restore(self, session_id: str) -> Optional[Checkpoint]:
        checkpoint = self.store.load_latest(session_id)
        if checkpoint:
            self.current_checkpoint = checkpoint
            self.step_count = checkpoint.step
        return checkpoint

    def restore_by_id(self, checkpoint_id: str) -> Optional[Checkpoint]:
        return self.store.load(checkpoint_id)
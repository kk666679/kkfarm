"""
Governance: Audit Trail.

Immutable audit log for all agent actions.
"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass, field
import json
import time
import uuid
import sqlite3
import threading
from pathlib import Path


@dataclass
class AuditEntry:
    """Single audit log entry."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = field(default_factory=time.time)
    agent_id: str = ""
    session_id: str = ""
    action: str = ""
    input_data: Dict = field(default_factory=dict)
    output_data: Dict = field(default_factory=dict)
    cost: float = 0.0
    duration: float = 0.0
    status: str = "success"  # success, failure, error
    error: str = ""
    metadata: Dict = field(default_factory=dict)


class AuditTrail:
    """Immutable audit trail with SQLite backend."""

    def __init__(self, db_path: str = "./governance/audit.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self._lock = threading.Lock()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_log (
                    id TEXT PRIMARY KEY,
                    timestamp REAL NOT NULL,
                    agent_id TEXT NOT NULL,
                    session_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    input_data TEXT,
                    output_data TEXT,
                    cost REAL DEFAULT 0.0,
                    duration REAL DEFAULT 0.0,
                    status TEXT DEFAULT 'success',
                    error TEXT DEFAULT '',
                    metadata TEXT
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_agent ON audit_log(agent_id)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_session ON audit_log(session_id)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_timestamp ON audit_log(timestamp DESC)
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_action ON audit_log(action)
            """)

    def log(
        self,
        agent_id: str,
        session_id: str,
        action: str,
        input_data: Dict = None,
        output_data: Dict = None,
        cost: float = 0.0,
        duration: float = 0.0,
        status: str = "success",
        error: str = "",
        metadata: Dict = None,
    ) -> str:
        """Log an audit entry. Returns entry ID."""
        entry = AuditEntry(
            agent_id=agent_id,
            session_id=session_id,
            action=action,
            input_data=input_data or {},
            output_data=output_data or {},
            cost=cost,
            duration=duration,
            status=status,
            error=error,
            metadata=metadata or {},
        )

        with self._lock:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO audit_log
                    (id, timestamp, agent_id, session_id, action, input_data, output_data, cost, duration, status, error, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    entry.id,
                    entry.timestamp,
                    entry.agent_id,
                    entry.session_id,
                    entry.action,
                    json.dumps(entry.input_data),
                    json.dumps(entry.output_data),
                    entry.cost,
                    entry.duration,
                    entry.status,
                    entry.error,
                    json.dumps(entry.metadata),
                ))

        return entry.id

    def query(
        self,
        agent_id: str = None,
        session_id: str = None,
        action: str = None,
        since: float = None,
        until: float = None,
        limit: int = 100,
    ) -> List[AuditEntry]:
        """Query audit entries."""
        query = "SELECT id, timestamp, agent_id, session_id, action, input_data, output_data, cost, duration, status, error, metadata FROM audit_log WHERE 1=1"
        params = []

        if agent_id:
            query += " AND agent_id = ?"
            params.append(agent_id)
        if session_id:
            query += " AND session_id = ?"
            params.append(session_id)
        if action:
            query += " AND action = ?"
            params.append(action)
        if since:
            query += " AND timestamp >= ?"
            params.append(since)
        if until:
            query += " AND timestamp <= ?"
            params.append(until)

        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(query, params)
            return [self._row_to_entry(row) for row in cursor.fetchall()]

    def get_agent_summary(self, agent_id: str, since: float = None) -> Dict[str, Any]:
        """Get summary statistics for an agent."""
        entries = self.query(agent_id=agent_id, since=since, limit=10000)

        total_cost = sum(e.cost for e in entries)
        total_duration = sum(e.duration for e in entries)
        success_count = sum(1 for e in entries if e.status == "success")
        failure_count = sum(1 for e in entries if e.status == "failure")
        error_count = sum(1 for e in entries if e.status == "error")

        actions = {}
        for e in entries:
            actions[e.action] = actions.get(e.action, 0) + 1

        return {
            "agent_id": agent_id,
            "total_entries": len(entries),
            "total_cost": total_cost,
            "total_duration": total_duration,
            "success_count": success_count,
            "failure_count": failure_count,
            "error_count": error_count,
            "actions": actions,
        }

    def _row_to_entry(self, row) -> AuditEntry:
        return AuditEntry(
            id=row[0],
            timestamp=row[1],
            agent_id=row[2],
            session_id=row[3],
            action=row[4],
            input_data=json.loads(row[5]) if row[5] else {},
            output_data=json.loads(row[6]) if row[6] else {},
            cost=row[7],
            duration=row[8],
            status=row[9],
            error=row[10],
            metadata=json.loads(row[11]) if row[11] else {},
        )


# Global instance
audit_trail = AuditTrail()


def audit_log(
    agent_id: str,
    session_id: str,
    action: str,
    **kwargs,
) -> str:
    """Convenience function for audit logging."""
    return audit_trail.log(agent_id, session_id, action, **kwargs)
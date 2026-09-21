from typing import Optional, Dict, List
from datetime import datetime
from models.schemas import Task

class TaskQueue:
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.task_history: Dict[str, List[Dict]] = {}

    def add_task(self, task: Task) -> str:
        self.tasks[task.task_id] = task
        return task.task_id

    def get_task(self, task_id: str) -> Optional[Task]:
        return self.tasks.get(task_id)

    def get_pending_tasks(self) -> List[Task]:
        return [t for t in self.tasks.values() if t.status == "pending"]

    def update_task_status(self, task_id: str, status: str) -> bool:
        task = self.tasks.get(task_id)
        if not task:
            return False

        task.status = status
        if status == "running":
            task.started_at = datetime.now()
        elif status in ("completed", "failed"):
            task.completed_at = datetime.now()

        return True

    def update_task_result(self, task_id: str, result: Dict) -> bool:
        task = self.tasks.get(task_id)
        if not task:
            return False

        task.result = result
        task.status = "completed" if result.get("success") else "failed"
        task.completed_at = datetime.now()

        if task_id not in self.task_history:
            self.task_history[task_id] = []

        self.task_history[task_id].append({
            "timestamp": datetime.now().isoformat(),
            "result": result
        })

        return True

    def get_stats(self) -> Dict:
        total = len(self.tasks)
        completed = sum(1 for t in self.tasks.values() if t.status == "completed")
        failed = sum(1 for t in self.tasks.values() if t.status == "failed")
        pending = sum(1 for t in self.tasks.values() if t.status == "pending")
        running = sum(1 for t in self.tasks.values() if t.status == "running")

        return {
            "total": total,
            "completed": completed,
            "failed": failed,
            "pending": pending,
            "running": running,
        }

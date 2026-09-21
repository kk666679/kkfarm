from typing import Dict, List, Any
from models.schemas import Device

class ContextGraph:
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, str]] = []

    def add_device(self, device: Device):
        self.nodes[device.device_id] = {
            "type": "device",
            "platform": device.platform.value,
            "status": device.status.value,
            "capabilities": device.capabilities,
            "battery": device.battery_level,
        }

    def add_task(self, task_id: str, task_type: str, device_id: str):
        self.nodes[task_id] = {
            "type": "task",
            "task_type": task_type,
            "assigned_device": device_id,
        }

        if device_id:
            self.edges.append({
                "from": device_id,
                "to": task_id,
                "relation": "executes"
            })

    def get_device_context(self, device_id: str) -> Dict[str, Any]:
        return self.nodes.get(device_id, {})

    def get_related_tasks(self, device_id: str) -> List[str]:
        return [
            edge["to"] for edge in self.edges
            if edge["from"] == device_id and edge["relation"] == "executes"
        ]

    def get_graph(self) -> Dict[str, Any]:
        return {
            "nodes": self.nodes,
            "edges": self.edges
        }

from typing import Dict, Set, Optional
import asyncio
import json
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from services.device_manager import DeviceManager
from models.schemas import DeviceStatus

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.pending_tasks: Dict[str, Dict] = {}
        self._heartbeat_check_task = None

    async def connect(self, websocket: WebSocket, device_id: str):
        await websocket.accept()
        self.active_connections[device_id] = websocket

        dm = DeviceManager()
        dm.update_device_status(device_id, DeviceStatus.IDLE)

        if not self._heartbeat_check_task:
            self._heartbeat_check_task = asyncio.create_task(self._heartbeat_loop())

    def disconnect(self, device_id: str):
        if device_id in self.active_connections:
            del self.active_connections[device_id]

        dm = DeviceManager()
        dm.update_device_status(device_id, DeviceStatus.OFFLINE)

    async def send_to_device(self, device_id: str, message: Dict) -> bool:
        if device_id not in self.active_connections:
            return False

        try:
            await self.active_connections[device_id].send_json(message)
            return True
        except Exception:
            self.disconnect(device_id)
            return False

    async def broadcast(self, message: Dict):
        for device_id, websocket in list(self.active_connections.items()):
            try:
                await websocket.send_json(message)
            except Exception:
                self.disconnect(device_id)

    async def handle_message(self, device_id: str, message: Dict):
        msg_type = message.get("type")

        if msg_type == "heartbeat":
            dm = DeviceManager()
            dm.update_heartbeat(device_id)

            if "battery" in message:
                dm.update_device_battery(device_id, message["battery"])

            await self.send_to_device(device_id, {
                "type": "heartbeat_ack",
                "timestamp": datetime.now().isoformat()
            })

        elif msg_type == "task_result":
            task_id = message.get("task_id")
            result = message.get("result")

            from services.task_queue import TaskQueue
            tq = TaskQueue()
            tq.update_task_result(task_id, result)

            dm = DeviceManager()
            dm.update_device_status(device_id, DeviceStatus.IDLE)

            await self.broadcast({
                "type": "task_completed",
                "device_id": device_id,
                "task_id": task_id,
                "result": result
            })

        elif msg_type == "device_status":
            dm = DeviceManager()

            status = message.get("status")
            if status:
                dm.update_device_status(device_id, DeviceStatus(status))

            if "battery" in message:
                dm.update_device_battery(device_id, message["battery"])

    async def _heartbeat_loop(self):
        while True:
            await asyncio.sleep(30)

            for device_id, websocket in list(self.active_connections.items()):
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    self.disconnect(device_id)

ws_manager = WebSocketManager()

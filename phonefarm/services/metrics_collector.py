from typing import Dict, List
from datetime import datetime
from services.device_manager import DeviceManager
from models.schemas import DeviceStatus

class MetricsCollector:
    def __init__(self):
        self.dm = DeviceManager()

    def get_device_metrics(self) -> Dict:
        devices = self.dm.get_all_devices()

        metrics = {
            "total_devices": len(devices),
            "status_counts": {
                "idle": 0,
                "busy": 0,
                "error": 0,
                "offline": 0,
                "charging": 0,
            },
            "platform_counts": {
                "android": 0,
                "ios": 0,
            },
            "avg_battery": 0.0,
            "devices": []
        }

        battery_sum = 0
        battery_count = 0

        for device in devices:
            metrics["status_counts"][device.status.value] += 1
            metrics["platform_counts"][device.platform.value] += 1

            if device.battery_level > 0:
                battery_sum += device.battery_level
                battery_count += 1

            metrics["devices"].append({
                "device_id": device.device_id,
                "platform": device.platform.value,
                "status": device.status.value,
                "battery": device.battery_level,
                "last_heartbeat": device.last_heartbeat.isoformat(),
            })

        if battery_count > 0:
            metrics["avg_battery"] = round(battery_sum / battery_count, 1)

        return metrics

    def get_task_metrics(self) -> Dict:
        from services.task_queue import TaskQueue
        tq = TaskQueue()
        return tq.get_stats()

    def get_farm_health(self) -> Dict:
        devices = self.dm.get_all_devices()
        now = datetime.now()

        stale_devices = []
        for device in devices:
            delta = (now - device.last_heartbeat).total_seconds()
            if delta > 300:
                stale_devices.append(device.device_id)

        return {
            "total_devices": len(devices),
            "stale_devices": len(stale_devices),
            "stale_device_ids": stale_devices,
            "health_status": "healthy" if len(stale_devices) == 0 else "degraded",
        }

from typing import List, Optional, Dict
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Optional redis import
try:
    import redis
except ImportError:
    redis = None

import json
from datetime import datetime, timedelta
from models.schemas import Device, DeviceStatus, DevicePlatform


class MockRedis:
    """In-memory mock for Redis."""

    def __init__(self):
        self.data = {}
        self.status_data = {}

    def hset(self, key, field, value):
        if key not in self.data:
            self.data[key] = {}
        self.data[key][field] = value
        if key == "device_status":
            self.status_data[field] = value

    def hget(self, key, field):
        if key in self.data and field in self.data[key]:
            return self.data[key][field]
        return None

    def hgetall(self, key):
        return self.data.get(key, {})

    def hdel(self, key, field):
        if key in self.data and field in self.data[key]:
            del self.data[key][field]


class DeviceManager:
    def __init__(self):
        if redis:
            try:
                self.redis = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
                self.redis.ping()  # Test connection
            except Exception:
                self.redis = MockRedis()
        else:
            self.redis = MockRedis()
        self.device_key = "devices"
        self.status_key = "device_status"

    def register_device(self, device: Device) -> bool:
        device.last_heartbeat = datetime.now()
        self.redis.hset(
            self.device_key,
            device.device_id,
            json.dumps(device.dict())
        )
        self.redis.hset(
            self.status_key,
            device.device_id,
            device.status.value
        )
        return True

    def update_device_status(self, device_id: str, status: DeviceStatus) -> bool:
        device_data = self.redis.hget(self.device_key, device_id)
        if not device_data:
            return False

        device = Device(**json.loads(device_data))
        device.status = status
        device.last_heartbeat = datetime.now()

        self.redis.hset(self.device_key, device_id, json.dumps(device.dict()))
        self.redis.hset(self.status_key, device_id, status.value)
        return True

    def update_device_battery(self, device_id: str, battery_level: int) -> bool:
        device_data = self.redis.hget(self.device_key, device_id)
        if not device_data:
            return False

        device = Device(**json.loads(device_data))
        device.battery_level = battery_level
        device.last_heartbeat = datetime.now()

        self.redis.hset(self.device_key, device_id, json.dumps(device.dict()))
        return True

    def get_device(self, device_id: str) -> Optional[Device]:
        device_data = self.redis.hget(self.device_key, device_id)
        if device_data:
            return Device(**json.loads(device_data))
        return None

    def get_available_devices(self, platform: Optional[DevicePlatform] = None) -> List[Device]:
        devices = []
        all_devices = self.redis.hgetall(self.device_key)

        for device_id, data in all_devices.items():
            device = Device(**json.loads(data))
            if device.status == DeviceStatus.IDLE:
                if not platform or device.platform == platform:
                    devices.append(device)

        return devices

    def get_all_devices(self) -> List[Device]:
        devices = []
        all_devices = self.redis.hgetall(self.device_key)

        for device_id, data in all_devices.items():
            devices.append(Device(**json.loads(data)))

        return devices

    def update_heartbeat(self, device_id: str) -> bool:
        device_data = self.redis.hget(self.device_key, device_id)
        if not device_data:
            return False

        device = Device(**json.loads(device_data))
        device.last_heartbeat = datetime.now()

        self.redis.hset(self.device_key, device_id, json.dumps(device.dict()))
        return True

    def cleanup_stale_devices(self, timeout_seconds: int = 300):
        now = datetime.now()
        all_devices = self.redis.hgetall(self.device_key)

        for device_id, data in all_devices.items():
            device = Device(**json.loads(data))
            delta = (now - device.last_heartbeat).total_seconds()
            if delta > timeout_seconds:
                self.redis.hdel(self.device_key, device_id)
                self.redis.hdel(self.status_key, device_id)
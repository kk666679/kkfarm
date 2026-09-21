"""Fleet registry."""
from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class Device:
    serial: str
    imei: str = ""
    rkp_ok: bool = False
    proxy: str = ""
    profile_id: str = ""


@dataclass
class FleetRegistry:
    devices: dict[str, Device] = field(default_factory=dict)

    def add(self, device: Device) -> None:
        self.devices[device.serial] = device

    def get(self, serial: str) -> Device | None:
        return self.devices.get(serial)

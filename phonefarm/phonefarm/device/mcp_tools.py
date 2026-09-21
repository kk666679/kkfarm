"""MCP tool registration for phonefarm.device.*"""
from __future__ import annotations
from .diagnose import diagnose_device
from .provision import provision_device
from .remediate import remediate_device

TOOLS = {
    "phonefarm.device.diagnose-device": diagnose_device,
    "phonefarm.device.provision-device": provision_device,
    "phonefarm.device.remediate-device": remediate_device,
}


def register(registry) -> None:
    for name, fn in TOOLS.items():
        registry.register(name, fn)

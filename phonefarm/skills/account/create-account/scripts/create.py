import asyncio
from typing import Dict, Any
from phonefarm.services.account_manager import account_manager
from phonefarm.services.device_manager import DeviceManager
from phonefarm.models.account_models import AccountPlatform


async def run(context: Dict[str, Any]) -> Dict[str, Any]:
    """Execute account creation."""
    platform = context.get("platform", "tiktok")
    device_id = context.get("device_id")
    email = context.get("email")
    username = context.get("username")

    if not device_id:
        return {"error": "device_id required"}

    dm = DeviceManager()
    device = dm.get_device(device_id)
    if not device:
        return {"error": f"Device {device_id} not found"}

    if device.status.value != "idle":
        return {"error": f"Device {device_id} not available"}

    dm.update_device_status(device_id, "busy")

    try:
        account = account_manager.register_account(
            platform=platform,
            username=username or f"user_{device_id[:8]}",
            credentials={"email": email, "password": context.get("password", "auto_gen")},
            policies=context.get("policies", []),
        )

        return {
            "success": True,
            "account_id": account.account_id,
            "platform": platform,
            "device_id": device_id,
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        dm.update_device_status(device_id, "idle")


if __name__ == "__main__":
    import sys
    context = {"platform": "tiktok", "device_id": "test_device"}
    result = asyncio.run(run(context))
    print(result)
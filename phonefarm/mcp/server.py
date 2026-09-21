"""
MCP Server - Stateless 2026-07-28 specification.

Key changes from 2025-11-25:
- No handshake/session ID
- Protocol version and client capabilities on every request
- server/discover for capabilities
- Plain round-robin load balancing
- Error code -32602 for missing resources
- server-initiated requests return results for follow-up
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Optional MCP import - will be available when mcp>=2.0 is installed
try:
    from mcp.server.mcpserver import MCPServer
except ImportError:
    # Mock MCPServer for development
    class MCPServer:
        def __init__(self, name, version):
            self.name = name
            self.version = version
            self.tools = {}

        def tool(self):
            def decorator(func):
                self.tools[func.__name__] = func
                return func
            return decorator

        def run(self, transport, host, port, stateless):
            print(f"Mock MCP Server {self.name} v{self.version} would run on {host}:{port}")
            print("Install mcp>=2.0.0 for real server")

from services.device_manager import DeviceManager
from services.account_manager import account_manager
from services.task_queue import TaskQueue
from models.schemas import Device, DevicePlatform, DeviceStatus


# Initialize MCP server (stateless)
server = MCPServer("phonefarm", version="1.0.0")

# Service instances
device_manager = DeviceManager()
task_queue = TaskQueue()


@server.tool()
async def phonefarm_device_list() -> List[Dict[str, Any]]:
    """List all devices in the phone farm."""
    devices = device_manager.get_all_devices()
    return [
        {
            "device_id": d.device_id,
            "name": d.name,
            "platform": d.platform.value,
            "status": d.status.value,
            "capabilities": d.capabilities,
            "battery_level": d.battery_level,
            "last_heartbeat": d.last_heartbeat.isoformat() if d.last_heartbeat else None,
        }
        for d in devices
    ]


@server.tool()
async def phonefarm_device_get(device_id: str) -> Dict[str, Any]:
    """Get details for a specific device."""
    device = device_manager.get_device(device_id)
    if not device:
        raise ValueError(f"Device {device_id} not found")

    return {
        "device_id": device.device_id,
        "name": device.name,
        "platform": device.platform.value,
        "status": device.status.value,
        "capabilities": device.capabilities,
        "screen_resolution": device.screen_resolution,
        "os_version": device.os_version,
        "battery_level": device.battery_level,
        "current_task": device.current_task,
        "last_heartbeat": device.last_heartbeat.isoformat() if device.last_heartbeat else None,
    }


@server.tool()
async def phonefarm_device_register(
    device_id: str,
    name: str,
    platform: str,
    capabilities: List[str] = None,
    screen_resolution: str = None,
    os_version: str = None,
) -> Dict[str, Any]:
    """Register a new device."""
    try:
        platform_enum = DevicePlatform(platform.lower())
    except ValueError:
        raise ValueError(f"Invalid platform: {platform}")

    device = Device(
        device_id=device_id,
        name=name,
        platform=platform_enum,
        capabilities=capabilities or [],
        screen_resolution=screen_resolution,
        os_version=os_version,
    )
    device_manager.register_device(device)
    return {"device_id": device_id, "status": "registered"}


@server.tool()
async def phonefarm_device_command(device_id: str, command: str, params: Dict = None) -> Dict[str, Any]:
    """Send a command to a specific device."""
    device = device_manager.get_device(device_id)
    if not device:
        raise ValueError(f"Device {device_id} not found")

    # Update device status
    device_manager.update_device_status(device_id, DeviceStatus.BUSY)

    # In real implementation, send via WebSocket
    # For now, return mock response
    return {
        "device_id": device_id,
        "command": command,
        "params": params or {},
        "status": "sent",
        "timestamp": __import__("datetime").datetime.now().isoformat(),
    }


@server.tool()
async def phonefarm_device_heartbeat(device_id: str, battery_level: int = None) -> Dict[str, Any]:
    """Update device heartbeat."""
    device_manager.update_heartbeat(device_id)
    if battery_level is not None:
        device_manager.update_device_battery(device_id, battery_level)
    return {"device_id": device_id, "status": "ok"}


@server.tool()
async def phonefarm_account_list() -> List[Dict[str, Any]]:
    """List all registered accounts."""
    accounts = []
    for acc_id, account in account_manager.accounts.items():
        accounts.append({
            "account_id": account.account_id,
            "platform": account.platform,
            "username": account.username,
            "status": account.status.value,
            "policies": account.policies,
        })
    return accounts


@server.tool()
async def phonefarm_account_get(account_id: str) -> Dict[str, Any]:
    """Get account details."""
    account = account_manager.get_account_status(account_id)
    if not account:
        raise ValueError(f"Account {account_id} not found")

    return {
        "account_id": account.account_id,
        "platform": account.platform,
        "username": account.username,
        "status": account.status.value,
        "policies": account.policies,
        "credentials": "***REDACTED***",
    }


@server.tool()
async def phonefarm_account_register(
    platform: str,
    username: str,
    credentials: Dict,
    policies: List[str] = None,
) -> Dict[str, Any]:
    """Register a new account."""
    account = account_manager.register_account(
        platform=platform,
        username=username,
        credentials=credentials,
        policies=policies or [],
    )
    return {"account_id": account.account_id, "status": "registered"}


@server.tool()
async def phonefarm_account_goal(account_id: str, goal: str) -> Dict[str, Any]:
    """Submit a goal for an account to execute."""
    try:
        result = await account_manager.run_account_goal(account_id, goal)
        return {"account_id": account_id, "result": result}
    except ValueError as e:
        raise ValueError(str(e))


@server.tool()
async def phonefarm_task_create(task_type: str, priority: int = 0, parameters: Dict = None) -> Dict[str, Any]:
    """Create a new task."""
    from models.schemas import Task, TaskType
    import uuid

    try:
        task_type_enum = TaskType(task_type.lower())
    except ValueError:
        raise ValueError(f"Invalid task type: {task_type}")

    task = Task(
        task_id=str(uuid.uuid4()),
        type=task_type_enum,
        priority=priority,
        parameters=parameters or {},
    )
    task_queue.add_task(task)
    return {"task_id": task.task_id, "status": "pending"}


@server.tool()
async def phonefarm_task_get(task_id: str) -> Dict[str, Any]:
    """Get task status and result."""
    task = task_queue.get_task(task_id)
    if not task:
        raise ValueError(f"Task {task_id} not found")

    return {
        "task_id": task.task_id,
        "type": task.type.value,
        "priority": task.priority,
        "parameters": task.parameters,
        "assigned_device": task.assigned_device,
        "status": task.status,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "started_at": task.started_at.isoformat() if task.started_at else None,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "result": task.result,
        "error": task.error,
    }


@server.tool()
async def phonefarm_farm_stats() -> Dict[str, Any]:
    """Get farm statistics."""
    devices = device_manager.get_all_devices()
    total = len(devices)
    busy = sum(1 for d in devices if d.status == DeviceStatus.BUSY)
    idle = sum(1 for d in devices if d.status == DeviceStatus.IDLE)

    return {
        "total_devices": total,
        "busy": busy,
        "idle": idle,
        "offline": sum(1 for d in devices if d.status == DeviceStatus.OFFLINE),
        "error": sum(1 for d in devices if d.status == DeviceStatus.ERROR),
        "accounts": len(account_manager.accounts),
        "pending_tasks": len(task_queue.get_pending_tasks()),
    }


# Health check endpoint
@server.tool()
async def phonefarm_health() -> Dict[str, Any]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "phonefarm", "version": "1.0.0"}


def run_server(host: str = "0.0.0.0", port: int = 9601):
    """Run the stateless MCP server."""
    server.run(
        transport="streamable-http",
        host=host,
        port=port,
        stateless=True,  # MCP_STATELESS=1 equivalent
    )


if __name__ == "__main__":
    run_server()
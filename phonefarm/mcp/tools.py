"""
MCP Tool Definitions for phonefarm.

Tools are registered via decorators in server.py.
This module provides tool schemas and validation.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


# Device Tools
class DeviceListParams(BaseModel):
    pass


class DeviceGetParams(BaseModel):
    device_id: str = Field(..., description="Unique device identifier")


class DeviceRegisterParams(BaseModel):
    device_id: str = Field(..., description="Unique device identifier")
    name: str = Field(..., description="Human-readable device name")
    platform: str = Field(..., description="Platform: android or ios")
    capabilities: List[str] = Field(default_factory=list)
    screen_resolution: Optional[str] = None
    os_version: Optional[str] = None


class DeviceCommandParams(BaseModel):
    device_id: str = Field(..., description="Target device ID")
    command: str = Field(..., description="Command to execute")
    params: Dict[str, Any] = Field(default_factory=dict)


class DeviceHeartbeatParams(BaseModel):
    device_id: str = Field(..., description="Device ID")
    battery_level: Optional[int] = Field(None, ge=0, le=100)


# Account Tools
class AccountListParams(BaseModel):
    pass


class AccountGetParams(BaseModel):
    account_id: str = Field(..., description="Account ID")


class AccountRegisterParams(BaseModel):
    platform: str = Field(..., description="Platform name")
    username: str = Field(..., description="Account username")
    credentials: Dict[str, Any] = Field(..., description="Account credentials")
    policies: List[str] = Field(default_factory=list)


class AccountGoalParams(BaseModel):
    account_id: str = Field(..., description="Account ID")
    goal: str = Field(..., description="Goal for the account to achieve")


# Task Tools
class TaskCreateParams(BaseModel):
    task_type: str = Field(..., description="Type of task")
    priority: int = Field(default=0, description="Task priority")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class TaskGetParams(BaseModel):
    task_id: str = Field(..., description="Task ID")


# Tool Registry
TOOL_DEFINITIONS = {
    "phonefarm_device_list": {
        "name": "phonefarm_device_list",
        "description": "List all devices in the phone farm",
        "inputSchema": DeviceListParams.model_json_schema(),
    },
    "phonefarm_device_get": {
        "name": "phonefarm_device_get",
        "description": "Get details for a specific device",
        "inputSchema": DeviceGetParams.model_json_schema(),
    },
    "phonefarm_device_register": {
        "name": "phonefarm_device_register",
        "description": "Register a new device in the farm",
        "inputSchema": DeviceRegisterParams.model_json_schema(),
    },
    "phonefarm_device_command": {
        "name": "phonefarm_device_command",
        "description": "Send a command to a specific device",
        "inputSchema": DeviceCommandParams.model_json_schema(),
    },
    "phonefarm_device_heartbeat": {
        "name": "phonefarm_device_heartbeat",
        "description": "Update device heartbeat and battery",
        "inputSchema": DeviceHeartbeatParams.model_json_schema(),
    },
    "phonefarm_account_list": {
        "name": "phonefarm_account_list",
        "description": "List all registered accounts",
        "inputSchema": AccountListParams.model_json_schema(),
    },
    "phonefarm_account_get": {
        "name": "phonefarm_account_get",
        "description": "Get account details",
        "inputSchema": AccountGetParams.model_json_schema(),
    },
    "phonefarm_account_register": {
        "name": "phonefarm_account_register",
        "description": "Register a new account",
        "inputSchema": AccountRegisterParams.model_json_schema(),
    },
    "phonefarm_account_goal": {
        "name": "phonefarm_account_goal",
        "description": "Submit a goal for an account to execute",
        "inputSchema": AccountGoalParams.model_json_schema(),
    },
    "phonefarm_task_create": {
        "name": "phonefarm_task_create",
        "description": "Create a new task",
        "inputSchema": TaskCreateParams.model_json_schema(),
    },
    "phonefarm_task_get": {
        "name": "phonefarm_task_get",
        "description": "Get task status and result",
        "inputSchema": TaskGetParams.model_json_schema(),
    },
    "phonefarm_farm_stats": {
        "name": "phonefarm_farm_stats",
        "description": "Get farm statistics",
        "inputSchema": {"type": "object", "properties": {}},
    },
    "phonefarm_health": {
        "name": "phonefarm_health",
        "description": "Health check endpoint",
        "inputSchema": {"type": "object", "properties": {}},
    },
}


def get_tool_definitions() -> List[Dict[str, Any]]:
    """Get all tool definitions for MCP discovery."""
    return list(TOOL_DEFINITIONS.values())


def validate_tool_args(tool_name: str, args: Dict[str, Any]) -> bool:
    """Validate tool arguments against schema."""
    schema = TOOL_DEFINITIONS.get(tool_name, {}).get("inputSchema")
    if not schema:
        return False
    # In production, use jsonschema validation
    return True
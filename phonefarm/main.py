from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid

from models.schemas import Device, DevicePlatform, DeviceStatus, Task, TaskType
from models.account_models import AccountPlatform, AccountStatus
from services.device_manager import DeviceManager
from services.task_queue import TaskQueue
from services.account_manager import account_manager
from agents.central_supervisor import PhoneFarmSupervisor
from config.autoclaw_loader import load_autoclaw_config
from config.settings import settings

# August 2026 Agentic Stack
from harness import PhoneFarmHarness, AgentConfig, create_default_guardrails
from skills import SkillRegistry
from memory import WorkingSet, SemanticMemory, EpisodicMemory, ProceduralMemory, HybridRetrieval
from eval import PhoneFarmEvalHarness
from governance import cost_ceiling, audit_trail, KillSwitch
from mcp import run_server as run_mcp_server

app = FastAPI(title="Phone Farm Multi-Agent System (August 2026)")

# Core services
device_manager = DeviceManager()
task_queue = TaskQueue()
supervisor = PhoneFarmSupervisor()
app_config = {}

# August 2026 layers
harness_guardrails = create_default_guardrails()
skill_registry = SkillRegistry()
stm = WorkingSet(
    max_size=settings.STM_MAX_SIZE,
    token_budget=settings.STM_TOKEN_BUDGET,
    ttl_seconds=settings.STM_TTL_SECONDS,
)
semantic_memory = SemanticMemory(db_path=settings.LTM_SEMANTIC_DB)
episodic_memory = EpisodicMemory(db_path=settings.LTM_EPISODIC_DB)
procedural_memory = ProceduralMemory(db_path=settings.LTM_PROCEDURAL_DB)
retrieval = HybridRetrieval(stm, semantic_memory, episodic_memory, procedural_memory)
eval_harness = PhoneFarmEvalHarness()


@app.on_event("startup")
async def startup_event():
    global app_config
    try:
        app_config = load_autoclaw_config(".autoclaw.yaml")
    except FileNotFoundError:
        try:
            app_config = load_autoclaw_config(".autoclaw")
        except FileNotFoundError:
            app_config = {"farm": {}, "accounts": [], "schedule": [], "webhooks": {}, "knowledge_base": {}}

    # Initialize skills
    skill_registry.discover()

    # Initialize cost ceiling
    cost_ceiling.limits.per_run = settings.COST_PER_RUN
    cost_ceiling.limits.per_agent_day = settings.COST_PER_AGENT_DAY
    cost_ceiling.limits.global_day = settings.COST_GLOBAL_DAY


class TaskRequest(BaseModel):
    user_request: str


class DeviceRegistrationRequest(BaseModel):
    device_id: str
    name: str
    platform: str
    capabilities: list = []
    screen_resolution: Optional[str] = None
    os_version: Optional[str] = None


class AccountRegistrationRequest(BaseModel):
    platform: str
    username: str
    credentials: dict
    policies: list = []


class AccountGoalRequest(BaseModel):
    goal: str


class HarnessRunRequest(BaseModel):
    agent_id: str
    goal: str
    context: dict = {}


class SkillSearchRequest(BaseModel):
    query: str


class MemorySearchRequest(BaseModel):
    query: str
    session_id: str = None


class EvalRunRequest(BaseModel):
    task: dict
    trace: dict = {}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "farm": app_config.get("farm", {}).get("name"),
        "version": "2026.08",
        "layers": {
            "harness": True,
            "skills": True,
            "memory": True,
            "eval": True,
            "mcp": True,
            "governance": True,
        }
    }


@app.get("/config")
async def get_config():
    return {
        "farm": app_config.get("farm", {}),
        "accounts": app_config.get("accounts", []),
        "schedule": app_config.get("schedule", []),
        "webhooks": app_config.get("webhooks", {}),
        "knowledge_base": app_config.get("knowledge_base", {})
    }


# Device endpoints
@app.post("/device/register")
async def register_device(req: DeviceRegistrationRequest):
    try:
        platform = DevicePlatform(req.platform.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid platform")

    device = Device(
        device_id=req.device_id,
        name=req.name,
        platform=platform,
        capabilities=req.capabilities,
        screen_resolution=req.screen_resolution,
        os_version=req.os_version
    )
    device_manager.register_device(device)
    return {"device_id": device.device_id, "status": "registered"}


@app.get("/devices")
async def get_devices():
    devices = device_manager.get_all_devices()
    return {"devices": [d.dict() for d in devices]}


@app.get("/devices/available")
async def get_available_devices(platform: Optional[str] = None):
    platform_enum = None
    if platform:
        try:
            platform_enum = DevicePlatform(platform.lower())
        except ValueError:
            platform_enum = None
    devices = device_manager.get_available_devices(platform_enum)
    return {"devices": [d.dict() for d in devices]}


# Task endpoints
@app.post("/task")
async def create_task(req: TaskRequest):
    session_id = str(uuid.uuid4())
    result = await supervisor.process_request(req.user_request, session_id=session_id)
    return {"session_id": session_id, "result": result}


@app.get("/tasks")
async def get_tasks(limit: int = 50):
    tasks = task_queue.get_recent_tasks(limit)
    return {"tasks": [t.dict() for t in tasks]}


@app.get("/stats")
async def get_stats():
    devices = device_manager.get_all_devices()
    total = len(devices)
    busy = sum(1 for d in devices if d.status == DeviceStatus.BUSY)
    idle = sum(1 for d in devices if d.status == DeviceStatus.IDLE)
    return {
        "total_devices": total,
        "busy": busy,
        "idle": idle,
        "success_rate": 0.95,
        "tasks_today": 0,
        "avg_task_duration": 0
    }


# Account endpoints
@app.post("/account/register")
async def register_account(req: AccountRegistrationRequest):
    try:
        platform = AccountPlatform(req.platform.lower())
    except ValueError:
        platform = AccountPlatform.CUSTOM

    account = account_manager.register_account(
        platform=platform.value,
        username=req.username,
        credentials=req.credentials,
        policies=req.policies
    )
    return {"account_id": account.account_id, "status": "registered"}


@app.post("/account/{account_id}/goal")
async def submit_account_goal(account_id: str, req: AccountGoalRequest):
    try:
        result = await account_manager.run_account_goal(account_id, req.goal)
        return {"account_id": account_id, "result": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/account/{account_id}/status")
async def get_account_status(account_id: str):
    account = account_manager.get_account_status(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account.dict()


@app.post("/webhook/autoclaw")
async def autoclaw_webhook(payload: dict):
    account_id = payload.get("account_id")
    goal = payload.get("goal")
    if not account_id or not goal:
        raise HTTPException(status_code=400, detail="Missing account_id or goal")
    result = await account_manager.run_account_goal(account_id, goal)
    return {"status": "ok", "result": result}


@app.post("/autoclaw/load")
async def load_autoclaw():
    try:
        config = load_autoclaw_config(".autoclaw.yaml")
        return {"status": "loaded", "config": config}
    except FileNotFoundError:
        try:
            config = load_autoclaw_config(".autoclaw")
            return {"status": "loaded", "config": config}
        except FileNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))


# August 2026: Harness endpoints
@app.post("/harness/run")
async def run_harness(req: HarnessRunRequest):
    """Run an agent via the harness."""
    # Check kill switch
    KillSwitch.check()

    # Check cost ceiling
    cost_ceiling.check(req.agent_id, 0.01)  # Estimate

    # Pre-guardrail check
    guardrail_result = harness_guardrails.check_pre(req.goal)
    if not guardrail_result.passed:
        raise HTTPException(status_code=400, detail=f"Guardrail failed: {guardrail_result.reason}")

    # Create harness
    agent_config = AgentConfig(
        id=req.agent_id,
        system_prompt="You are a phone farm agent.",
        tools=[],
        guardrails=[],
    )
    harness = PhoneFarmHarness(agent_config)

    # Run
    result = await harness.run(req.goal, req.context)

    # Post-guardrail check
    guardrail_result = harness_guardrails.check_post(result)
    if not guardrail_result.passed:
        raise HTTPException(status_code=400, detail=f"Output guardrail failed: {guardrail_result.reason}")

    # Audit log
    audit_trail.log(
        agent_id=req.agent_id,
        session_id=req.context.get("session_id", "unknown"),
        action="harness_run",
        input_data={"goal": req.goal, "context": req.context},
        output_data=result,
        cost=0.01,
        status="success" if not isinstance(result, Exception) else "error",
        error=str(result) if isinstance(result, Exception) else "",
    )

    return {"result": result}


# August 2026: Skills endpoints
@app.get("/skills")
async def list_skills():
    """List all skills (L1 metadata)."""
    return {"skills": skill_registry.load_metadata()}


@app.get("/skills/{skill_name}")
async def get_skill(skill_name: str):
    """Get full skill body (L2)."""
    body = skill_registry.load_body(skill_name)
    if not body:
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"skill": skill_name, "body": body.__dict__}


@app.get("/skills/{skill_name}/resources/{resource}")
async def get_skill_resource(skill_name: str, resource: str):
    """Get skill resource (L3)."""
    resource_data = skill_registry.load_resource(skill_name, resource)
    if resource_data is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"skill": skill_name, "resource": resource, "data": resource_data}


@app.post("/skills/search")
async def search_skills(req: SkillSearchRequest):
    """Search skills by query."""
    results = skill_registry.search(req.query)
    return {"results": [r.__dict__ for r in results]}


# August 2026: Memory endpoints
@app.post("/memory/search")
async def search_memory(req: MemorySearchRequest):
    """Hybrid search across STM and LTM."""
    results = await retrieval.search(req.query, session_id=req.session_id)
    return {
        "stm": [str(r.content) for r in results.stm_results],
        "semantic": [r.content for r in results.semantic_results],
        "episodic": [{"type": r.event_type, "content": str(r.content)} for r in results.episodic_results],
        "procedural": [{"name": r.name, "description": r.description} for r in results.procedural_results],
    }


@app.get("/memory/stm")
async def get_stm(limit: int = 10):
    """Get recent STM entries."""
    entries = stm.get_recent(limit)
    return {"entries": [{"id": e.id, "content": str(e.content), "salience": e.salience} for e in entries]}


# August 2026: Eval endpoints
@app.post("/eval/run")
async def run_eval(req: EvalRunRequest):
    """Run evaluation on agent trace."""
    # This would need an actual agent and trace
    return {"message": "Evaluation endpoint - integrate with agent runs"}


# August 2026: Governance endpoints
@app.get("/governance/cost")
async def get_cost_usage(agent_id: str = None):
    """Get cost usage."""
    return {"usage": cost_ceiling.get_usage(agent_id)}


@app.get("/governance/audit")
async def get_audit_trail(
    agent_id: str = None,
    session_id: str = None,
    limit: int = 100,
):
    """Query audit trail."""
    entries = audit_trail.query(agent_id=agent_id, session_id=session_id, limit=limit)
    return {"entries": [e.__dict__ for e in entries]}


@app.get("/governance/kill-switch")
async def get_kill_switch():
    """Get kill switch status."""
    state = KillSwitch.get_state()
    return {"active": state.active, "reason": state.reason, "activated_at": state.activated_at}


@app.post("/governance/kill-switch/activate")
async def activate_kill_switch(reason: str, activated_by: str = "api"):
    """Activate kill switch."""
    KillSwitch.activate(reason, activated_by)
    return {"status": "activated", "reason": reason}


@app.post("/governance/kill-switch/deactivate")
async def deactivate_kill_switch(deactivated_by: str = "api"):
    """Deactivate kill switch."""
    KillSwitch.deactivate(deactivated_by)
    return {"status": "deactivated"}


# MCP Server endpoint info
@app.get("/mcp/info")
async def mcp_info():
    """MCP server information."""
    return {
        "host": settings.MCP_HOST,
        "port": settings.MCP_PORT,
        "stateless": settings.MCP_STATELESS,
        "version": "2026-07-28",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.messages import SystemMessage, HumanMessage
import json
import asyncio

# August 2026: Harness integration
from harness import PhoneFarmHarness, AgentConfig, TieredRouter, DeterministicTier


class FarmState(TypedDict, total=False):
    user_request: str
    plan: Optional[List[Dict[str, Any]]]
    current_step: int
    task_groups: Optional[List[Dict[str, Any]]]
    device_assignments: Optional[Dict[str, str]]
    execution_results: Dict[str, Any]
    status: str
    error: Optional[str]
    execution_path: List[str]
    device_requirements: Optional[Dict[str, Any]]
    consolidated_result: Optional[Dict[str, Any]]


class PhoneFarmSupervisor:
    def __init__(self):
        self.llm = None
        self.checkpointer = InMemorySaver()
        self.graph = self._build_graph()
        self.agent = self.graph.compile(checkpointer=self.checkpointer)

        # August 2026: Harness integration
        self.harness = None
        self.tiered_router = TieredRouter(
            deterministic_tier=DeterministicTier(),
        )

    def _build_graph(self) -> StateGraph:
        graph = StateGraph(FarmState)

        graph.add_node("planning_agent", self._planning_agent)
        graph.add_node("routing_agent", self._routing_agent)
        graph.add_node("execution_agent", self._execution_agent)
        graph.add_node("monitoring_agent", self._monitoring_agent)
        graph.add_node("consolidation_agent", self._consolidation_agent)

        graph.set_entry_point("planning_agent")
        graph.add_edge("planning_agent", "routing_agent")
        graph.add_conditional_edges(
            "routing_agent",
            self._should_execute,
            {
                "execute": "execution_agent",
                "skip": END
            }
        )
        graph.add_edge("execution_agent", "monitoring_agent")
        graph.add_edge("monitoring_agent", "consolidation_agent")
        graph.add_edge("consolidation_agent", END)

        return graph

    def _planning_agent(self, state: FarmState) -> FarmState:
        if not self.llm:
            state["error"] = "LLM is not configured. Set OPENAI_API_KEY or another provider env var."
            state["status"] = "error"
            return state

        system_prompt = """You are a phone farm planning agent. 
        Decompose the user's request into a structured execution plan.
        
        Available task types:
        - UI_TEST: Run UI automation tests
        - DATA_COLLECTION: Collect data from apps
        - APP_INSTALL: Install or update apps
        - SCREENSHOT: Take screenshots
        - PERFORMANCE_TEST: Measure app performance
        - USER_SIMULATION: Simulate user behavior
        
        Return JSON with:
        {
            "tasks": [
                {
                    "type": "UI_TEST",
                    "priority": 0,
                    "parameters": {"app": "com.example.app", "test_suite": "login"}
                }
            ],
            "device_requirements": {
                "platform": ["android", "ios"],
                "count": 3,
                "capabilities": ["camera", "gps"]
            }
        }
        """

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"User request: {state.get('user_request', '')}")
        ]

        response = self.llm.invoke(messages)
        try:
            plan_data = json.loads(response.content)
            state["plan"] = plan_data.get("tasks", [])
            state["device_requirements"] = plan_data.get("device_requirements", {})
            state["status"] = "planned"
            state["execution_path"] = state.get("execution_path", []) + ["planning_agent"]
        except Exception as e:
            state["error"] = f"Planning failed: {str(e)}"
            state["status"] = "error"

        return state

    def _routing_agent(self, state: FarmState) -> FarmState:
        if not state.get("plan"):
            state["error"] = "No plan to execute"
            return state

        task_groups = {}
        for task in state["plan"]:
            platform = task.get("parameters", {}).get("platform", "android")
            if platform not in task_groups:
                task_groups[platform] = []
            task_groups[platform].append(task)

        state["task_groups"] = [
            {"platform": platform, "tasks": tasks}
            for platform, tasks in task_groups.items()
        ]

        state["status"] = "routed"
        state["execution_path"] = state.get("execution_path", []) + ["routing_agent"]
        return state

    def _execution_agent(self, state: FarmState) -> FarmState:
        from services.device_manager import DeviceManager
        from models.schemas import DeviceStatus

        dm = DeviceManager()
        available_devices = dm.get_available_devices()

        if not available_devices:
            state["error"] = "No devices available"
            state["status"] = "error"
            return state

        state["device_assignments"] = {}
        state["execution_results"] = {}

        for group in state.get("task_groups", []):
            platform = group["platform"]
            tasks = group["tasks"]

            platform_devices = [d for d in available_devices if d.platform.value == platform]

            if not platform_devices:
                state["error"] = f"No {platform} devices available"
                continue

            for i, task in enumerate(tasks):
                if i < len(platform_devices):
                    device = platform_devices[i]
                    state["device_assignments"][task.get("task_id", str(i))] = device.device_id

                    dm.update_device_status(device.device_id, DeviceStatus.BUSY)

                    asyncio.create_task(self._send_task_to_device(device, task))

                    state["execution_results"][task.get("task_id", str(i))] = {
                        "device_id": device.device_id,
                        "status": "sent"
                    }

        state["status"] = "executing"
        state["execution_path"] = state.get("execution_path", []) + ["execution_agent"]
        return state

    async def _send_task_to_device(self, device, task):
        from api.websocket_manager import ws_manager

        await ws_manager.send_to_device(
            device.device_id,
            {
                "type": "task",
                "task_id": task.get("task_id", ""),
                "task_type": task.get("type", ""),
                "parameters": task.get("parameters", {})
            }
        )

    def _monitoring_agent(self, state: FarmState) -> FarmState:
        from services.device_manager import DeviceManager
        from models.schemas import DeviceStatus

        dm = DeviceManager()

        for task_id, assignment in state.get("execution_results", {}).items():
            device_id = assignment.get("device_id")
            if not device_id:
                continue

            device = dm.get_device(device_id)
            if device:
                if device.status == DeviceStatus.IDLE:
                    assignment["status"] = "completed"
                elif device.status == DeviceStatus.ERROR:
                    assignment["status"] = "failed"
                    assignment["error"] = "Device error"

        state["status"] = "monitored"
        state["execution_path"] = state.get("execution_path", []) + ["monitoring_agent"]
        return state

    def _consolidation_agent(self, state: FarmState) -> FarmState:
        results = state.get("execution_results", {})

        success_count = sum(1 for r in results.values() if r.get("status") == "completed")
        failed_count = len(results) - success_count

        state["consolidated_result"] = {
            "total_tasks": len(results),
            "success_count": success_count,
            "failed_count": failed_count,
            "results": results,
            "plan": state.get("plan", [])
        }

        state["status"] = "completed"
        state["execution_path"] = state.get("execution_path", []) + ["consolidation_agent"]
        return state

    def _should_execute(self, state: FarmState) -> str:
        if state.get("error"):
            return "skip"
        return "execute"

    # August 2026: Harness-based processing
    async def process_request_harness(self, user_request: str, session_id: str = None) -> Dict:
        """Process request using the August 2026 harness."""
        if self.harness is None:
            self.harness = PhoneFarmHarness(AgentConfig(
                id="central_supervisor",
                system_prompt="You are the central supervisor for a phone farm. Coordinate device operations, account management, and task execution.",
                tools=[],
            ))

        # Try tiered routing first
        route_result = await self.tiered_router.route({
            "type": "plan",
            "query": user_request,
        })

        if route_result.success:
            return {"routed": True, "result": route_result.result, "tier": route_result.tier}

        # Fall back to harness
        result = await self.harness.run(user_request, {"session_id": session_id or "default"})
        return result

    async def process_request(self, user_request: str, session_id: str = None) -> Dict:
        """Legacy LangGraph-based processing."""
        initial_state = {
            "user_request": user_request,
            "execution_path": [],
            "execution_results": {},
            "status": "started"
        }

        config = {"configurable": {"thread_id": session_id or "default"}}
        result = await self.agent.ainvoke(initial_state, config=config)
        return result
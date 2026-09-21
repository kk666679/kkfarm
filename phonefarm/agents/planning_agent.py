from typing import TypedDict, List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import json

class PlanningState(TypedDict, total=False):
    user_request: str
    tasks: List[Dict[str, Any]]
    device_requirements: Dict[str, Any]
    status: str

class PlanningAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0)

    async def create_plan(self, user_request: str) -> Dict:
        system_prompt = """You are a phone farm planning agent.
        Decompose the user's request into structured tasks.
        
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
            HumanMessage(content=f"User request: {user_request}")
        ]

        response = self.llm.invoke(messages)
        try:
            plan_data = json.loads(response.content)
            return {
                "tasks": plan_data.get("tasks", []),
                "device_requirements": plan_data.get("device_requirements", {}),
                "status": "planned"
            }
        except Exception as e:
            return {
                "error": f"Planning failed: {str(e)}",
                "status": "error"
            }

    async def optimize_plan(self, plan: Dict, available_devices: List[Dict]) -> Dict:
        system_prompt = """Optimize the execution plan based on available devices.
        Consider device capabilities, platform, and current load.
        
        Return optimized JSON with same structure as input.
        """

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Plan: {json.dumps(plan)}\nAvailable devices: {json.dumps(available_devices)}")
        ]

        response = self.llm.invoke(messages)
        try:
            return json.loads(response.content)
        except Exception:
            return plan

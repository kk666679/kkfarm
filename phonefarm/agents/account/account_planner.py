import json
from langchain_core.messages import SystemMessage, HumanMessage


class AccountPlanner:
    def __init__(self, llm):
        self.llm = llm

    def create_plan(self, goal: str, platform: str, account_id: str, context: str) -> list:
        prompt = f"""
        You are an account management planner for {platform}.
        Goal: {goal}
        Account ID: {account_id}
        Available actions: post, reply, like, follow, unfollow, dm, analyze, monitor.
        Context (retrieved from knowledge base):
        {context}

        Decompose the goal into a sequence of actions. For each action, specify:
        - action: one of the available actions
        - parameters: dict with relevant details
        - reason: why this step is needed.

        Return ONLY a JSON array of actions.
        """
        response = self.llm.invoke([SystemMessage(content=prompt)])
        try:
            plan = json.loads(response.content)
        except Exception:
            plan = [{"action": "analyze", "parameters": {"query": goal}, "reason": "Initial analysis"}]
        return plan

    def adjust_plan(self, remaining_steps: list, reason: str, new_context: str) -> list:
        prompt = f"""
        The current plan needs adjustment because: {reason}.
        New context: {new_context}.
        Remaining steps: {json.dumps(remaining_steps)}.
        Propose an updated sequence of actions.
        Return ONLY a JSON array.
        """
        response = self.llm.invoke([SystemMessage(content=prompt)])
        try:
            return json.loads(response.content)
        except Exception:
            return remaining_steps

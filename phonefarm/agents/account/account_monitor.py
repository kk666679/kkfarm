import json
from langchain_core.messages import SystemMessage


class AccountMonitor:
    def __init__(self, llm):
        self.llm = llm

    def assess(self, goal: str, actions: list, last_result: dict) -> dict:
        prompt = f"""
        Goal: {goal}
        Actions taken: {actions}
        Last result: {last_result}

        Assess if the actions are progressing toward the goal.
        Return JSON: {{"needs_adjustment": true/false, "reason": "..."}}
        """
        response = self.llm.invoke([SystemMessage(content=prompt)])
        try:
            content = response.content.strip()
            if content.startswith("```"):
                content = content.strip("`")
                if content.startswith("json"):
                    content = content[4:].strip()
            return json.loads(content)
        except Exception:
            return {"needs_adjustment": False, "reason": "Assessment unavailable"}


import json

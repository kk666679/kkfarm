import time
import random
from typing import Dict, Any
from models.account_models import ActionType


class AccountExecutor:
    def __init__(self):
        self.action_handlers = {
            ActionType.POST: self._post,
            ActionType.REPLY: self._reply,
            ActionType.LIKE: self._like,
            ActionType.FOLLOW: self._follow,
            ActionType.UNFOLLOW: self._unfollow,
            ActionType.DM: self._dm,
            ActionType.ANALYZE: self._analyze,
            ActionType.MONITOR: self._monitor,
        }

    def execute_action(self, account_id: str, action: str, parameters: Dict) -> Dict:
        try:
            action_type = ActionType(action.lower())
        except ValueError:
            return {"error": f"Unknown action: {action}"}

        handler = self.action_handlers.get(action_type)
        if not handler:
            return {"error": f"Unhandled action: {action}"}

        try:
            result = handler(account_id, parameters)
            return {"success": True, "result": result}
        except Exception as e:
            return {"error": str(e)}

    def _post(self, account_id: str, params: Dict) -> Dict:
        content = params.get("content", "Default post")
        time.sleep(random.uniform(1, 3))
        return {"posted": True, "content": content, "post_id": f"post_{int(time.time())}"}

    def _reply(self, account_id: str, params: Dict) -> Dict:
        return {"replied": True, "to": params.get("to"), "message": params.get("message")}

    def _like(self, account_id: str, params: Dict) -> Dict:
        return {"liked": True, "target": params.get("target")}

    def _follow(self, account_id: str, params: Dict) -> Dict:
        return {"followed": True, "user": params.get("user")}

    def _unfollow(self, account_id: str, params: Dict) -> Dict:
        return {"unfollowed": True, "user": params.get("user")}

    def _dm(self, account_id: str, params: Dict) -> Dict:
        return {"dm_sent": True, "to": params.get("to"), "message": params.get("message")}

    def _analyze(self, account_id: str, params: Dict) -> Dict:
        query = params.get("query", "")
        return {"analysis": f"Analysis of '{query}' complete", "insights": ["trend1", "trend2"]}

    def _monitor(self, account_id: str, params: Dict) -> Dict:
        return {"monitored": True, "status": "active", "mentions": 5, "engagement": 0.12}

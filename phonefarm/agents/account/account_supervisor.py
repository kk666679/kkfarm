from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import InMemorySaver
from agents.core.llm_provider import llm_factory
from agents.core.vector_store import rag_engine
from agents.account.account_planner import AccountPlanner
from agents.account.account_executor import AccountExecutor
from agents.account.account_monitor import AccountMonitor


class AccountState(TypedDict, total=False):
    account_id: str
    platform: str
    goal: str
    plan: List[Dict[str, Any]]
    current_step: int
    context: str
    actions_taken: List[Dict]
    last_result: Dict
    error: Optional[str]
    monitor_feedback: Optional[Dict]
    final_summary: Optional[str]


class AccountSupervisor:
    def __init__(self):
        self.llm = llm_factory.get_llm()
        self.planner = AccountPlanner(self.llm) if self.llm else None
        self.executor = AccountExecutor()
        self.monitor = AccountMonitor(self.llm) if self.llm else None
        self.checkpointer = InMemorySaver()
        self.graph = self._build_graph()
        self.agent = self.graph.compile(checkpointer=self.checkpointer)

    def _build_graph(self) -> StateGraph:
        graph = StateGraph(AccountState)

        graph.add_node("plan", self._plan_node)
        graph.add_node("execute", self._execute_node)
        graph.add_node("monitor", self._monitor_node)
        graph.add_node("adjust", self._adjust_node)
        graph.add_node("finalize", self._finalize_node)

        graph.set_entry_point("plan")
        graph.add_edge("plan", "execute")
        graph.add_edge("execute", "monitor")
        graph.add_conditional_edges(
            "monitor",
            self._should_continue,
            {
                "continue": "adjust",
                "finish": "finalize"
            }
        )
        graph.add_edge("adjust", "execute")
        graph.add_edge("finalize", END)

        return graph

    def _plan_node(self, state: AccountState) -> AccountState:
        if not self.planner or not self.llm:
            state["error"] = "LLM is not configured. Cannot create plan."
            state["plan"] = [{"action": "analyze", "parameters": {"query": state["goal"]}, "reason": "LLM unavailable; fallback analysis"}]
            state["current_step"] = 0
            return state

        context = rag_engine.retrieve_context(state["goal"], state["platform"])
        state["context"] = context

        plan = self.planner.create_plan(
            goal=state["goal"],
            platform=state["platform"],
            account_id=state["account_id"],
            context=context
        )
        state["plan"] = plan
        state["current_step"] = 0
        return state

    def _execute_node(self, state: AccountState) -> AccountState:
        if not state.get("plan"):
            return state

        step = state["plan"][state["current_step"]]
        result = self.executor.execute_action(
            account_id=state["account_id"],
            action=step["action"],
            parameters=step.get("parameters", {})
        )
        state["actions_taken"].append(result)
        state["last_result"] = result
        if result.get("error"):
            state["error"] = result["error"]
        else:
            state["current_step"] += 1
        return state

    def _monitor_node(self, state: AccountState) -> AccountState:
        if state.get("error"):
            return state
        if not self.monitor or not self.llm:
            state["monitor_feedback"] = {"needs_adjustment": False, "reason": "LLM unavailable; skipping monitoring"}
            return state
        assessment = self.monitor.assess(
            goal=state["goal"],
            actions=state["actions_taken"],
            last_result=state["last_result"]
        )
        state["monitor_feedback"] = assessment
        return state

    def _adjust_node(self, state: AccountState) -> AccountState:
        feedback = state.get("monitor_feedback", {})
        if feedback.get("needs_adjustment", False):
            new_context = rag_engine.retrieve_context(
                f"adjustment for {state['goal']}",
                state["platform"]
            )
            state["context"] = new_context
            remaining_steps = state["plan"][state["current_step"]:]
            if self.planner and self.llm:
                adjusted_plan = self.planner.adjust_plan(
                    remaining_steps,
                    feedback["reason"],
                    new_context
                )
                state["plan"] = state["plan"][:state["current_step"]] + adjusted_plan
        return state

    def _finalize_node(self, state: AccountState) -> AccountState:
        if self.llm:
            try:
                summary = self.llm.invoke(
                    f"Summarise the account management session for account {state['account_id']}."
                    f"Actions taken: {state['actions_taken']}"
                )
                state["final_summary"] = summary.content
            except Exception:
                state["final_summary"] = "Session completed."
        else:
            state["final_summary"] = "Session completed."
        return state

    def _should_continue(self, state: AccountState) -> str:
        if state.get("error") or state["current_step"] >= len(state.get("plan", [])):
            return "finish"
        return "continue"

    async def process_account_goal(self, account_id: str, platform: str, goal: str) -> Dict:
        initial_state = {
            "account_id": account_id,
            "platform": platform,
            "goal": goal,
            "actions_taken": [],
            "current_step": 0
        }
        config = {"configurable": {"thread_id": account_id}}
        result = await self.agent.ainvoke(initial_state, config=config)
        return result

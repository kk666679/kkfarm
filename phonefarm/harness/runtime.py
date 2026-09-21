from dataclasses import dataclass
from typing import Any, Dict, Optional, List, Callable
import asyncio
import sys
import os

# Add parent directory to path for config import
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from strands import Agent, ModelConfig
except ImportError:
    Agent = None
    ModelConfig = None

from config.settings import settings


@dataclass
class AgentConfig:
    id: str
    system_prompt: str
    tools: List[Callable] = None
    memory: Any = None
    session: Any = None
    guardrails: List[Callable] = None


class PhoneFarmHarness:
    """Wraps Strands Agents with phonefarm-specific configuration."""

    def __init__(self, agent_config: AgentConfig):
        self.config = agent_config
        self.agent = None
        self._initialize_agent()

    def _initialize_agent(self):
        if Agent is None or ModelConfig is None:
            raise ImportError(
                "strands-agents is not installed. Install with: pip install strands-agents"
            )

        self.agent = Agent(
            model=ModelConfig(
                provider=settings.llm_provider,
                model_id=settings.llm_model,
                fallback_models=settings.llm_fallbacks,
                max_tokens=settings.llm_max_tokens,
            ),
            system_prompt=self.config.system_prompt,
            tools=self.config.tools or [],
            memory=self.config.memory,
            session=self.config.session,
            guardrails=self.config.guardrails or [],
            trace_attributes={"service": "phonefarm", "agent": self.config.id},
        )

    async def run(self, goal: str, context: Dict = None) -> Dict[str, Any]:
        """Execute the agent with the given goal and context."""
        if self.agent is None:
            self._initialize_agent()

        result = await self.agent.invoke_async(
            input=goal,
            context=context or {},
            max_turns=settings.agent_max_turns,
            token_budget=settings.agent_token_budget,
        )
        return result

    def run_sync(self, goal: str, context: Dict = None) -> Dict[str, Any]:
        """Synchronous version of run."""
        return asyncio.run(self.run(goal, context))


class HarnessContext:
    """Context manager for agent execution."""

    def __init__(self, harness: PhoneFarmHarness):
        self.harness = harness
        self.trace_id = None

    async def __aenter__(self):
        return self.harness

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass
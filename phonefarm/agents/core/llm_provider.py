import os
from typing import Optional, List, Dict

try:
    from langchain_openai import ChatOpenAI
except Exception:
    ChatOpenAI = None

try:
    from langchain_anthropic import ChatAnthropic
except Exception:
    ChatAnthropic = None

try:
    from langchain_aws import ChatBedrock
except Exception:
    ChatBedrock = None

from langchain_core.language_models import BaseChatModel
from tenacity import retry, stop_after_attempt, wait_exponential


class LLMProviderFactory:
    def __init__(self):
        self.providers = []
        self._initialized = False

    def _init_providers(self):
        if self._initialized:
            return
        self._initialized = True

        if os.getenv("OPENAI_API_KEY") and ChatOpenAI is not None:
            self.providers.append({
                "name": "openai",
                "model": ChatOpenAI(
                    model=os.getenv("LLM_MODEL", "gpt-4o"),
                    temperature=float(os.getenv("LLM_TEMPERATURE", 0.1)),
                    max_tokens=int(os.getenv("LLM_MAX_TOKENS", 4096))
                )
            })

        if os.getenv("ANTHROPIC_API_KEY") and ChatAnthropic is not None:
            self.providers.append({
                "name": "anthropic",
                "model": ChatAnthropic(
                    model=os.getenv("ANTHROPIC_MODEL", "claude-3-sonnet-20240229"),
                    temperature=0.1
                )
            })

        if all(os.getenv(k) for k in ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]) and ChatBedrock is not None:
            self.providers.append({
                "name": "bedrock",
                "model": ChatBedrock(
                    model_id="anthropic.claude-3-sonnet-20240229-v1:0"
                )
            })

        if not self.providers:
            return None

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def get_llm(self, **kwargs):
        for provider in self.providers:
            try:
                return provider["model"]
            except Exception as e:
                print(f"Provider {provider['name']} failed: {e}")
                continue
        return None


class _LLMFactory:
    def __init__(self):
        self._factory = None

    def _get_factory(self):
        if self._factory is None:
            self._factory = LLMProviderFactory()
        return self._factory

    def get_llm(self, **kwargs):
        return self._get_factory().get_llm(**kwargs)


llm_factory = _LLMFactory()

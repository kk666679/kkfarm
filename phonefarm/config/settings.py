import os


class Settings:
    # LLM Configuration
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o")
    LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.1"))
    LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "4096"))
    LLM_FALLBACKS = os.getenv("LLM_FALLBACKS", "").split(",") if os.getenv("LLM_FALLBACKS") else []

    # Agent Harness Configuration
    AGENT_MAX_TURNS = int(os.getenv("AGENT_MAX_TURNS", "10"))
    AGENT_TOKEN_BUDGET = int(os.getenv("AGENT_TOKEN_BUDGET", "8000"))

    # Vector Database
    VECTOR_DB_TYPE = os.getenv("VECTOR_DB", "chroma")
    VECTOR_DB_PATH = os.getenv("VECTOR_DB_PATH", "./chroma_db")

    # Memory Configuration
    STM_MAX_SIZE = int(os.getenv("STM_MAX_SIZE", "200"))
    STM_TOKEN_BUDGET = int(os.getenv("STM_TOKEN_BUDGET", "8000"))
    STM_TTL_SECONDS = int(os.getenv("STM_TTL_SECONDS", "1800"))

    LTM_SEMANTIC_DB = os.getenv("LTM_SEMANTIC_DB", "./memory/semantic.db")
    LTM_EPISODIC_DB = os.getenv("LTM_EPISODIC_DB", "./memory/episodic.db")
    LTM_PROCEDURAL_DB = os.getenv("LTM_PROCEDURAL_DB", "./memory/procedural.db")

    # RAG Configuration
    RAG_TOP_K = int(os.getenv("RAG_TOP_K", "5"))
    ACCOUNT_POLICY_REFRESH = int(os.getenv("ACCOUNT_POLICY_REFRESH", "3600"))

    # Cost Ceiling
    COST_PER_RUN = float(os.getenv("COST_PER_RUN", "1.00"))
    COST_PER_AGENT_DAY = float(os.getenv("COST_PER_AGENT_DAY", "50.00"))
    COST_GLOBAL_DAY = float(os.getenv("COST_GLOBAL_DAY", "500.00"))

    # MCP Configuration
    MCP_HOST = os.getenv("MCP_HOST", "0.0.0.0")
    MCP_PORT = int(os.getenv("MCP_PORT", "9601"))
    MCP_STATELESS = os.getenv("MCP_STATELESS", "true").lower() == "true"

    # Governance
    KILL_SWITCH_ENABLED = os.getenv("KILL_SWITCH_ENABLED", "true").lower() == "true"
    AUDIT_ENABLED = os.getenv("AUDIT_ENABLED", "true").lower() == "true"


settings = Settings()
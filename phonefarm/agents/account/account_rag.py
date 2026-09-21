from agents.core.vector_store import rag_engine


class AccountRAG:
    def __init__(self):
        self._rag = rag_engine

    def retrieve_context(self, query: str, account_platform: str) -> str:
        return self._rag.retrieve_context(query, account_platform)

    def add_account_knowledge(self, account_id: str, knowledge: str):
        return self._rag.add_account_knowledge(account_id, knowledge)


account_rag = AccountRAG()

import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
from datetime import datetime

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None


class VectorStore:
    def __init__(self, collection_name: str = "account_knowledge"):
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory="./chroma_db"
        ))
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        if SentenceTransformer is not None:
            self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        else:
            self.embedder = None

    def add_documents(self, documents: List[Dict[str, str]], ids: List[str]):
        texts = [doc["text"] for doc in documents]
        metadatas = [doc.get("metadata", {}) for doc in documents]
        embeddings = self.embedder.encode(texts).tolist() if self.embedder is not None else None
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )

    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        query_embedding = self.embedder.encode([query]).tolist() if self.embedder is not None else None
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k
        )
        return [
            {
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i]
            }
            for i in range(len(results["ids"][0]))
        ]


class AccountRAG:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store

    def retrieve_context(self, query: str, account_platform: str) -> str:
        augmented_query = f"{account_platform}: {query}"
        docs = self.vector_store.search(augmented_query, top_k=3)
        return "\n\n".join([doc["text"] for doc in docs])

    def add_account_knowledge(self, account_id: str, knowledge: str):
        self.vector_store.add_documents(
            documents=[{"text": knowledge, "metadata": {"account_id": account_id}}],
            ids=[f"acc_{account_id}_{datetime.now().timestamp()}"]
        )


class _VectorStore:
    def __init__(self):
        self._store = None

    def _get_store(self):
        if self._store is None:
            self._store = VectorStore()
        return self._store

    def add_documents(self, documents: List[Dict[str, str]], ids: List[str]):
        return self._get_store().add_documents(documents, ids)

    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        return self._get_store().search(query, top_k)


vector_store = _VectorStore()


class _AccountRAG:
    def __init__(self):
        self._rag = None

    def _get_rag(self):
        if self._rag is None:
            self._rag = AccountRAG(vector_store._get_store())
        return self._rag

    def retrieve_context(self, query: str, account_platform: str) -> str:
        return self._get_rag().retrieve_context(query, account_platform)

    def add_account_knowledge(self, account_id: str, knowledge: str):
        return self._get_rag().add_account_knowledge(account_id, knowledge)


rag_engine = _AccountRAG()

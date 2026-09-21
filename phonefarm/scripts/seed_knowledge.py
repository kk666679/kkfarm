from agents.core.vector_store import vector_store
from datetime import datetime

knowledge_base = [
    {
        "text": "Twitter daily limits: 2400 tweets per day, 1000 likes per day. Avoid aggressive following.",
        "metadata": {"platform": "twitter", "type": "policy"}
    },
    {
        "text": "Instagram: Post 1-2 times per day. Use 5-10 relevant hashtags. Reply to comments within 1 hour.",
        "metadata": {"platform": "instagram", "type": "policy"}
    },
    {
        "text": "Facebook: Share engaging content, avoid over-posting (max 3 posts/day). Respond to messages quickly.",
        "metadata": {"platform": "facebook", "type": "policy"}
    },
    {
        "text": "Email: Keep subject lines under 50 chars. Personalise first lines. Avoid spam trigger words.",
        "metadata": {"platform": "email", "type": "policy"}
    }
]

ids = [f"doc_{i}" for i in range(len(knowledge_base))]
vector_store.add_documents(knowledge_base, ids)
print("Knowledge base seeded.")

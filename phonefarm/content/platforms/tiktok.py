from .base import Platform


class TikTok(Platform):
    name = "tiktok"
    char_limit = 4000
    hashtag_limit = 5

    def format_text(self, topic: str, **kwargs) -> str:
        return f"{topic} — raw, conversational hook first."

from .base import Platform


class Instagram(Platform):
    name = "instagram"
    char_limit = 2200
    hashtag_limit = 5

    def format_text(self, topic: str, **kwargs) -> str:
        return f"{topic}\n\nSave this for later."

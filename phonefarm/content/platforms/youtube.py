from .base import Platform


class YouTube(Platform):
    name = "youtube"
    char_limit = 5000
    hashtag_limit = 15

    def format_text(self, topic: str, **kwargs) -> str:
        return f"{topic} — how-to with specific outcome."

from phonefarm.content.platforms import get_platform


def test_get_platform():
    assert get_platform("tiktok").name == "tiktok"

from phonefarm.content.hashtags import generate_hashtags


def test_limit_per_platform():
    assert len(generate_hashtags("x", "x")) <= 2
    assert len(generate_hashtags("x", "tiktok")) <= 5

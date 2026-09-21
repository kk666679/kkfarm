from phonefarm.content import generate_post


def test_generate_post_tiktok():
    out = generate_post("farm automation", "tiktok")
    assert out["platform"] == "tiktok"
    assert out["text"]
    assert len(out["hashtags"]) <= 5

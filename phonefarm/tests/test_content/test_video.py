from phonefarm.content import generate_video_script


def test_script_structure():
    s = generate_video_script("topic", "tiktok")
    assert {"hook", "value", "cta", "duration_target_s"} <= s.keys()

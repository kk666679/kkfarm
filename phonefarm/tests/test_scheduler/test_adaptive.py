from phonefarm.scheduler.adaptive import optimal_window


def test_window_for_tiktok():
    w = optimal_window("tiktok")
    assert w["best_day"] == "saturday"

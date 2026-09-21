from phonefarm.fleet.health import check_all


def test_check_all_is_callable():
    assert callable(check_all)

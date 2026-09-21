from phonefarm.device.remediate import LADDER


def test_ladder_order():
    assert LADDER[0] == "cache"
    assert LADDER[-1] == "factory"

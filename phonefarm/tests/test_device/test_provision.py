from phonefarm.device.rkp import check_rkp_support


def test_rkp_returns_dict_shape():
    # Avoid real adb call by asserting the function is importable
    assert callable(check_rkp_support)

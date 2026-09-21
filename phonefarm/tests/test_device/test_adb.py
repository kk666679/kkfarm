from phonefarm.device.adb import list_devices


def test_list_devices_callable():
    assert isinstance(list_devices(), list)

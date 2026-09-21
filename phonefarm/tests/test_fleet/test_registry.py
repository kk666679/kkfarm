from phonefarm.fleet.registry import FleetRegistry, Device


def test_add_and_get():
    reg = FleetRegistry()
    reg.add(Device(serial="ABC"))
    assert reg.get("ABC").serial == "ABC"

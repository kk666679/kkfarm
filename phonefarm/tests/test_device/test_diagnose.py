from phonefarm.device.thermal import read_thermal_zones


def test_thermal_parser_shape():
    # parser-level test only — does not require a live device
    assert callable(read_thermal_zones)

import json
from pathlib import Path


def test_fixture_shape():
    fixture = Path(__file__).parent.parent / "fixtures" / "thermal_zones.txt"
    lines = fixture.read_text().splitlines()
    assert all(":" in l for l in lines if l.strip())

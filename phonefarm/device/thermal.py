"""Thermal zone reader — direct sysfs ground truth."""
from __future__ import annotations
from .adb import run

CMD = (
    'for z in /sys/class/thermal/thermal_zone*; do '
    'echo "$(cat $z/type 2>/dev/null):$(cat $z/temp 2>/dev/null)"; done'
)


def read_thermal_zones(serial: str) -> dict[str, int]:
    out = run(serial, "shell", CMD)
    zones: dict[str, int] = {}
    for line in out.splitlines():
        if ":" not in line:
            continue
        name, _, temp = line.partition(":")
        try:
            zones[name] = int(temp)
        except ValueError:
            continue
    return zones

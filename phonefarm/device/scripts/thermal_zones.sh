#!/usr/bin/env bash
for z in /sys/class/thermal/thermal_zone*; do
  echo "$(cat "$z/type" 2>/dev/null):$(cat "$z/temp" 2>/dev/null)"
done

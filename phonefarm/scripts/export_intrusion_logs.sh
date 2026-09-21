#!/usr/bin/env bash
set -euo pipefail
for serial in "$@"; do
  adb -s "$serial" shell am start -a android.settings.SECURITY_SETTINGS
  echo "Export Intrusion Log for $serial manually, or automate via UI."
done

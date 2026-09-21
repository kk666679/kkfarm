#!/usr/bin/env bash
set -euo pipefail
for serial in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
  echo "== $serial =="
  adb -s "$serial" shell cmd remote_provisioning certify default || true
done

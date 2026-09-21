#!/usr/bin/env bash
# Export Android 16 Intrusion Log bundle before any wipe.
adb -s "$1" shell am start -a android.settings.SECURITY_SETTINGS
echo "Navigate to Advanced Protection → Intrusion Logging → Export"

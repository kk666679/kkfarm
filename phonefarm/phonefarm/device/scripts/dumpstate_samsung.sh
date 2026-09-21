#!/usr/bin/env bash
# Trigger Samsung dumpstate via dial code, then pull from phone storage.
adb -s "$1" shell am broadcast -a android.provider.Telephony.SECRET_CODE \
  -d "android_secret_code://9900"

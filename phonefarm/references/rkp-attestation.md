# RKP Attestation — 2026

Verify before provisioning:

```bash
adb shell cmd remote_provisioning dump
adb shell cmd remote_provisioning certify default
```

Devices shipped with Android 16 support only RKP (not legacy manufacturer keys).

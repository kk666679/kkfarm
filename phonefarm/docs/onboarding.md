# Onboarding a device

1. `adb devices -l` — confirm reachable
2. `python -c "from phonefarm.device.rkp import certify; print(certify('<serial>'))"` — RKP
3. `phonefarm provision <serial>` — full provision
4. Verify via `phonefarm diagnose <serial>`
5. Register metadata in `FleetRegistry`

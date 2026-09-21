# Trade-in Mode — Android 16+

**Last updated:** 2026-09-21
**Version:** 2.0.0
**Supersedes:** v1.0 (2026-08-15)
**Audience:** Fleet operators, refurbishment engineers, provisioning teams

---

## Core Philosophy

**Trade-in mode collapses device assessment from minutes to seconds.** Before Android 16, checking a factory-reset device's battery health, cycle count, part authenticity, and IMEI required booting through the setup wizard, manually navigating system menus, or installing third-party diagnostic apps. Trade-in mode bypasses all of that — you connect via ADB and issue a single command.

**The mode exists because device longevity is now a platform priority.** Android is committed to making devices last longer, and device longevity brings device circularity: phones and tablets traded in and resold. GSMA reported that secondhand phones have around 80–90% lower carbon emissions than new phones, and the secondhand device market has grown substantially in both volume and value.

**Security is enforced by preconditions, not by trust.** Trade-in mode is only accessible when the device is factory reset, has no cellular service, has no connectivity or connected account, and is running a non-debuggable build. These four conditions ensure device information is only accessed in secure situations. The mode also guarantees a factory reset on reboot, preventing misuse as a provisioning bypass.

**The mode is a diagnostic surface, not an operating environment.** ADB runs in a highly restricted SELinux context (`adb_tradeinmode`) that permits effectively one command: `adb shell tradeinmode`. Authorization is disabled — no RSA key prompt appears. The mode exists to answer questions about the device, not to administer it.

---

## What Trade-in Mode Is

Trade-in mode is a specialized ADB mode activated during the Setup Wizard (SUW) on user builds. It is designed to facilitate automated diagnostics for device trade-in, refurbishment, and secondhand resale.

### Activation flow

The `DeviceDiagnostics` APK has a `BOOT_COMPLETE` broadcast receiver that calls into the `ITradeInMode.start` service. The service activates trade-in mode if and only if all five conditions are true:

| # | Condition | Value |
|---|-----------|-------|
| 1 | ADB disabled | `ADB_ENABLED = 0` |
| 2 | Non-debuggable build | `ro.debuggable = 0` |
| 3 | User setup not complete | `USER_SETUP_COMPLETE = 0` |
| 4 | Device not provisioned | `DEVICE_PROVISIONED = 0` |
| 5 | No active Wi-Fi connection | — |

When all conditions hold, the system sets `persist.adb.tradeinmode = 1` and enables ADB. When `adbd` starts, it sees the property and lowers its SELinux context to `adb_tradeinmode` — a highly restricted policy that permits only `adb shell tradeinmode` and disables authorization.

`ITradeInMode` monitors conditions 3, 4, and 5 and turns off ADB as soon as any becomes false. The `persist` property ensures the mode survives reboot.

### `persist.adb.tradeinmode` values

| Value | State | Meaning |
|-------|-------|---------|
| `-1` | Failed | Failed to start trade-in mode |
| `0` | Off | Trade-in mode not enabled |
| `1` | Active | Trade-in mode enabled |
| `2` | Evaluation | `tradeinmode evaluate` was used; adbd runs without TIM restrictions, but a factory reset is guaranteed on next boot |

---

## Preconditions

Trade-in mode activates automatically on boot when all conditions are met. The device must satisfy all four documented preconditions:

| Precondition | Reason |
|--------------|--------|
| **Factory reset** | Ensures no user data is present during diagnostics |
| **No cellular service** | Prevents the device from being remotely managed or tracked |
| **No connectivity or connected account** | Prevents data exfiltration and ensures the device is in a clean state |
| **Non-debuggable build** | `ro.debuggable = 0` — prevents TIM from interfering with userdebug testing |

**Factory Reset Protection note:** If `factory_reset_protection` is set to `true` in the device lock state, the device is secure and cannot be reset. If the device cannot be reset, it cannot be evaluated.

---

## Commands

### `getstatus` — Retrieve device health information

```bash
adb shell tradeinmode getstatus
```

Returns a JSON object containing the device's diagnostic information. Skips the setup wizard entirely.

**Example output (Pixel 7):**

```json
{
  "battery": {
    "cycle_count": 16,
    "health": 100,
    "state": 2,
    "manufacturing_date": 1653004800,
    "first_usage_date": 0
  },
  "storage": {
    "useful_lifetime_remaining": 99,
    "capacity_bytes": "128000000000"
  },
  "launch_level": 33,
  "locks": {
    "factory_reset_protection": false
  },
  "product": {
    "brand": "google",
    "device": "panther",
    "manufacturer": "Google",
    "model": "Pixel 7",
    "name": "panther"
  },
  "imeis": [
    "353644930127905",
    "353644930127913"
  ],
  "serial": "26061FDH2000AP",
  "cameras": [
    { "num_physical": 3, "lens_facing": "back" },
    { "num_physical": 2, "lens_facing": "front" }
  ],
  "uiccs": [
    {
      "eid": "89033023427100000000007982221521",
      "removable": false,
      "physical_slot_index": 0
    },
    { "removable": true, "physical_slot_index": 1 }
  ]
}
```

**Field availability notes:**
- `cameras` and `uiccs` fields exist on Android 17 and later
- Battery health state values include: `unknown`, `good`, `overheat`, `dead`, `over_voltage`, `unspecified_failure`, `cold`, `fair`, `not_available`, `inconsistent`

### `getstatus --challenge` — OS authenticity attestation

```bash
adb shell tradeinmode getstatus --challenge CHALLENGE
```

`CHALLENGE` is a randomly generated alphanumeric string (e.g., `p4tRsuHjWB`). This command returns JSON that includes an `attestation` field containing a base64-encoded attestation record.

**Requires:** Device connected to the internet.

**Purpose:** Tests the device's operating system authenticity — confirming the device is running a trusted build. If the build passes the test, you can be sure the diagnostic results are coming from a trusted OS.

**Attestation field structure:**

```json
"attestation": {
  "certificates": "AAAC/DCCAvgwggKeoAMCAQICAQEwCgYIKoZIzj0EAwIw..."
}
```

The `certificates` field is a base64-encoded record containing the attestation certificate chain.

### `evaluate` — Enter evaluation mode

```bash
adb shell tradeinmode evaluate
```

Bypasses setup and enters Android in an evaluation mode. This changes `persist.adb.tradeinmode` to `2` and restarts `adbd`. In evaluation mode, ADB runs normally without trade-in mode restrictions, but authorization is disabled. You can run your own diagnostic commands or applications — including `adb install`.

**Critical:** A factory reset is **guaranteed on next boot**. The `ITradeInModeService.enterEvaluationMode` writes a marker to `/metadata/tradeinmode/wipe`. First-stage init sees this file and immediately reboots into recovery to issue an unprompted wipe.

### `testing start` / `testing stop` / `testing status` — Development testing

These commands work only on `userdebug`, `eng`, or `user` builds where `ro.debuggable = 1`.

```bash
# Reboot device into trade-in mode
adb shell tradeinmode testing start

# Confirm trade-in mode is active
adb shell tradeinmode testing status

# Exit trade-in mode and restore full ADB access
adb shell tradeinmode testing stop
```

`testing start` reboots the device into trade-in mode. `testing stop` returns the device to the mode it was in before `testing start` was issued.

### `poweroff` — Power off the device

```bash
adb shell tradeinmode poweroff
```

Powers off the device. Use this command to prevent battery drain while the device is not actively being tested or evaluated.

### Additional commands

The full command set includes commands to:

- Factory reset
- Power off
- Reboot
- Reboot directly into trade-in mode
- Check if trade-in mode is active
- Revert to the previous mode
- Pause tests until system services are ready

---

## Field Reference

### Device information

| Field | Example | Description |
|-------|---------|-------------|
| `imeis` | `["353644930127905"]` | Device IMEI(s) |
| `serial` | `26061FDH2000AP` | Device serial number |
| `product.brand` | `google` | Device brand |
| `product.model` | `Pixel 7` | Device model |
| `product.manufacturer` | `Google` | Device manufacturer |
| `product.name` | `panther` | Device codename |
| `launch_level` | `33` | API level at launch — ensures correct OS version identification |

### Battery health

| Field | Example | Description |
|-------|---------|-------------|
| `cycle_count` | `16` | Number of charge cycles |
| `health` | `100` | Battery health percentage |
| `state` | `2` | Health state enum (see values below) |
| `manufacturing_date` | `1653004800` | Battery manufacturing date (Unix timestamp) |
| `first_usage_date` | `0` | Date battery first used |

**Battery state values:** `unknown`, `good`, `overheat`, `dead`, `over_voltage`, `unspecified_failure`, `cold`, `fair`, `not_available`, `inconsistent`.

### Storage

| Field | Example | Description |
|-------|---------|-------------|
| `useful_lifetime_remaining` | `99` | Percentage of useful life remaining |
| `capacity_bytes` | `"128000000000"` | Total storage capacity |

### Parts

| Field | Example | Description |
|-------|---------|-------------|
| Part status | `replaced`, `original`, `unsupported` | Indicates whether parts are genuine (OEM-dependent) |
| Serial number | — | Helps indicate genuine parts, if OEM supported |
| Screen part status | `replaced`, `original`, `unsupported` | Screen authenticity |
| Foldables | — | Number of times folded and total fold lifespan |
| Moisture intrusion | — | Detection of water damage |

### Locks

| Field | Example | Description |
|-------|---------|-------------|
| `factory_reset_protection` | `false` | If `true`, device is secure and cannot be reset — and cannot be evaluated |

### UICC (SIM)

| Field | Example | Description |
|-------|---------|-------------|
| `eid` | `890330234271...` | eSIM identifier (if eSIM present) |
| `removable` | `false` | Whether the SIM is removable |
| `physical_slot_index` | `0` | Physical SIM slot index |

### Cameras

| Field | Example | Description |
|-------|---------|-------------|
| `num_physical` | `3` | Number of physical cameras |
| `lens_facing` | `back` | Camera orientation (front/back) |

---

## Fleet Integration

### Provisioning gate

Trade-in mode is the **first diagnostic step** for any factory-reset device entering the fleet:

```python
from phonefarm.device.tradein import tradein_status

def assess_device(serial: str) -> dict:
    status = tradein_status(serial)
    if not status.get("ok"):
        raise DeviceError(f"trade-in mode not available on {serial}")
    
    battery = status.get("battery", {})
    if battery.get("state") not in (2, "good", "fair"):
        raise DeviceError(f"battery health failing: {battery.get('state')}")
    
    storage = status.get("storage", {})
    if storage.get("useful_lifetime_remaining", 0) < 80:
        raise DeviceError(f"storage lifetime below threshold")
    
    return status
```

### Health check integration

The `phonefarm.fleet.check-health` MCP tool can use trade-in mode as the **resource health** dimension for factory-reset devices:

| Signal | Pass criteria | Fail action |
|--------|---------------|-------------|
| Battery health | `state` ∈ {good, fair} | Quarantine device |
| Battery cycles | Below role-specific threshold | Flag for review |
| Storage lifetime | > 80% remaining | Flag for review |
| Part status | `original` or OEM-supported | Flag if `replaced` for critical parts |
| Factory reset protection | `false` | Cannot evaluate — exclude |

### OS authenticity verification

For devices of unknown provenance, the `--challenge` variant is mandatory before trusting any diagnostic results:

```bash
CHALLENGE=$(openssl rand -hex 8)
adb shell tradeinmode getstatus --challenge "$CHALLENGE"
```

If the attestation passes, the diagnostics are confirmed to come from a trusted OS.

### RKP integration

Trade-in mode's `--challenge` attestation is **complementary to RKP**. RKP verifies the device's hardware-backed key pair; trade-in mode's challenge verifies the OS build. Both are required for full provenance verification:

| Check | What it verifies | Command |
|-------|-----------------|---------|
| RKP certification | Hardware-backed key attestation | `cmd remote_provisioning certify default` |
| Trade-in challenge | OS build authenticity | `tradeinmode getstatus --challenge <token>` |

See `references/rkp-attestation.md` for the full RKP verification workflow.

---

## Evaluation Mode

### What it is

Evaluation mode is entered via `adb shell tradeinmode evaluate`. It bypasses the setup wizard and allows full ADB access — including `adb install` — without authorization. This enables you to run your own diagnostic commands or applications.

### The factory reset guarantee

The factory reset is enforced by `ITradeInModeService.enterEvaluationMode`, which writes a marker to `/metadata/tradeinmode/wipe`. If first-stage init sees this file, it immediately reboots into recovery to issue an unprompted wipe.

**This is non-negotiable.** There is no way to exit evaluation mode without triggering the wipe. The device is factory reset on the next boot, ensuring nothing remains on the device.

### Use case

Evaluation mode is for scenarios where the built-in `getstatus` output is insufficient — for example, running OEM-specific diagnostic tools, performing deeper hardware tests, or installing custom diagnostic applications. It is not a general-purpose provisioning mode.

---

## Anti-Patterns

### ❌ Never Do

- **Use trade-in mode as a provisioning bypass** — the mode guarantees a factory reset on reboot. It is not an alternative to the setup wizard for devices that will be used.
- **Trust diagnostic results without the `--challenge` attestation on unknown-provenance devices** — an untrusted build can fabricate healthy diagnostic results. Always verify OS authenticity first.
- **Attempt trade-in mode on a device with `factory_reset_protection = true`** — the device cannot be reset and therefore cannot be evaluated.
- **Use trade-in mode on a device with cellular service or a connected account** — the preconditions are enforced by the activation service. The mode will not activate.
- **Assume all Android 16+ devices support every field** — `cameras` and `uiccs` are Android 17+ fields. `part status` and battery serial number are OEM-dependent.
- **Skip the battery state check** — `overheat`, `dead`, and `unspecified_failure` states invalidate any performance benchmark run.
- **Rely on trade-in mode for devices that have not been factory reset** — the mode is only available during the Setup Wizard on a clean device.

### ✅ Do Instead

- **Use `getstatus` as the first step for every factory-reset device** — it replaces minutes of manual setup-wizard navigation with a single command.
- **Run `getstatus --challenge` on devices of unknown provenance** — it confirms the diagnostics are coming from a trusted OS.
- **Check `factory_reset_protection` before attempting evaluation** — if `true`, the device cannot be evaluated.
- **Use `poweroff` to prevent battery drain** — when a device is not actively being tested, power it off to preserve battery health.
- **Leverage `evaluate` mode for OEM-specific diagnostics** — when the built-in `getstatus` output is insufficient, evaluation mode provides full ADB access for custom diagnostic tools.
- **Integrate trade-in mode into the onboarding pipeline** — it is the fastest way to assess a factory-reset device's health and provenance before provisioning.
- **Use `testing start`/`testing stop` on userdebug builds for development** — these commands let you test trade-in mode behavior without the full factory-reset guarantee.

---

## Reference: Trade-in Mode Commands (2026)

| Command | Purpose | Availability |
|---------|---------|--------------|
| `adb shell tradeinmode getstatus` | Retrieve device health information | Android 16+ |
| `adb shell tradeinmode getstatus --challenge <token>` | OS authenticity attestation (requires internet) | Android 16+ |
| `adb shell tradeinmode evaluate` | Enter evaluation mode (full ADB, guaranteed wipe on reboot) | Android 16+ |
| `adb shell tradeinmode testing start` | Reboot into trade-in mode | userdebug/eng/user with ro.debuggable=1 |
| `adb shell tradeinmode testing stop` | Exit trade-in mode, restore full ADB | userdebug/eng/user with ro.debuggable=1 |
| `adb shell tradeinmode testing status` | Check if trade-in mode is active | userdebug/eng/user with ro.debuggable=1 |
| `adb shell tradeinmode poweroff` | Power off device | Android 16+ |
| Factory reset command | Factory reset device | Android 16+ |
| Reboot command | Reboot device | Android 16+ |
| Reboot into trade-in mode | Reboot directly into TIM | Android 16+ |

---

## References

- `skills/provision-device.md` — provisioning pipeline with trade-in mode integration
- `skills/diagnose-device.md` — five-dimension health check
- `references/rkp-attestation.md` — RKP verification workflow (complementary attestation)
- `references/fleet-health-2026.md` — fleet-level monitoring patterns
- `references/remediation-library-2026.md` — remediation workflows and escalation
- `docs/security-posture.md` — RKP, Intrusion Logging, Advanced Protection, CVE-2026-0073
- `docs/onboarding.md` — device onboarding pipeline
- `docs/fleet-operations.md` — operational loops and cadence
- `docs/mcp-tools.md` — MCP tool catalog

**External sources:** Android Developers Blog — Trade-in mode on Android 16+ (January 2026), Android Open Source Project — Get system health information, AOSP — Architecture of ADB Trade-In Mode, Android Source — ITradeInMode AIDL

---

*Last updated: September 2026. Review quarterly against Android release notes. Trade-in mode field availability and command set are expanding — the official AOSP documentation is the authoritative source for the latest additions.*
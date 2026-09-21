# Onboarding a Device

**Last updated:** 2026-09-21
**Applies to:** Fleet devices running Android 14–16+ (API 34+)
**Prerequisites:** `phonefarm.device.*` MCP tools available; control host has `adb` ≥ Platform-Tools 35.0.0

---

## Overview

Onboarding is a **five-stage pipeline** with mandatory gates. A device that fails any gate is excluded from the fleet — no partial onboarding, no exceptions. The gate order matters: attestation before install, provisioning before diagnostics, diagnostics before registration.

```
[0] Pre-flight → [1] Attest → [2] Provision → [3] Diagnose → [4] Register
       │              │             │              │             │
       └─ reachable   └─ RKP        └─ apps,       └─ 5-dim      └─ FleetRegistry
          + patch        + trust       network,       health        + proxy
          level          store         identity       check         assignment
```

---

## Stage 0 — Pre-flight

Before touching the device, confirm the control host and device meet baseline requirements.

```bash
# Control host
adb version                    # Platform-Tools ≥ 35.0.0
adb devices -l                 # serial, model, transport_id visible

# Target device
adb -s <serial> shell getprop ro.build.version.sdk            # ≥ 34
adb -s <serial> shell getprop ro.build.version.security_patch # ≥ 2026-05-01
adb -s <serial> shell getprop ro.product.model
```

**Gates:**

| Check | Pass criteria | Fail action |
|-------|---------------|-------------|
| ADB reachable | Serial listed with `device` state | Re-seat USB / reconnect wireless ADB |
| API level | ≥ 34 (Android 14) | Exclude — unsupported OS |
| Security patch | ≥ 2026-05-01 | Update or exclude (CVE-2026-0073) |
| Advanced Protection | Known state | If enabled and blocking ADB sideload, disable via UI first |

---

## Stage 1 — Attestation (RKP)

Hardware-backed attestation is the **first hard gate**. Devices that fail RKP are rejected before any app installation, fingerprint configuration, or fleet registration.

```bash
# Check RKP support (Android 15+ / most devices shipped 2025+)
adb -s <serial> shell cmd remote_provisioning dump
# Expected: default: hwVersion=[INTEGER] rpcAuthorName=[DEVICE MAKER]

# Certify the default key
adb -s <serial> shell cmd remote_provisioning certify default
# Verify root matches Android Key Attestation CA (2026 root)
```

Or via Python:

```bash
python -c "from phonefarm.device.rkp import certify; print(certify('<serial>'))"
```

**Gates:**

| Check | Pass criteria | Fail action |
|-------|---------------|-------------|
| RKP supported | `rpcAuthorName` present in dump | Exclude — device fails platform integrity |
| Certification | Root matches Android Key Attestation CA | Re-run certify; if still failing, exclude |
| Trust store | New 2026 root present | Update trust store before proceeding |
| OS authenticity (Android 16+) | `tradeinmode getstatus --challenge <token>` returns trusted build | Exclude — device provenance unverified |

**2026 note:** Devices shipped with Android 16 support **only RKP** — legacy manufacturer keys are gone. The new Android Key Attestation root certificate became the exclusive root on **10 April 2026**. Ensure your verification library trusts the new root before admitting any device.

See `references/rkp-attestation.md` for the full verification workflow.

---

## Stage 2 — Provision

Full provisioning applies OS verification, app installation, network configuration, identity setup, and fleet manager registration.

```bash
phonefarm provision <serial>
```

Under the hood this runs the `provision-device` skill (`skills/provision-device.md`), which executes:

1. **Verify connectivity and attestation** — re-confirm Stage 1 gates (defence in depth).
2. **Install/verify OS version** — confirm the device meets the fleet's minimum API level. On Android 16+ devices of unknown provenance, run `tradeinmode getstatus --challenge <token>` first.
3. **Install required apps** — silent install via MDM (fully managed / Work Profile) or `adb install-multiple` for non-MDM workflows. Force-stop each app once after install so it reads fresh identifiers on next launch.
4. **Configure network** — assign a proxy endpoint from the pool (≤ 3 devices per endpoint). Configure SOCKS5 / OpenVPN / VLESS as appropriate. Ensure the proxy emits Android TCP/IP characteristics.
5. **Set up device identity** — coherent fingerprint profile (IMEI/model/carrier/locale/screen metrics/GAID all matching). Coherence beats randomness.
6. **Register with fleet manager** — zero-touch enrollment (9+) or QR code enrollment for smaller fleets. Record serial, IMEI, RKP status, proxy endpoint, profile ID.
7. **Run health checks** — five-dimension check (see Stage 3).

**Gates:**

| Check | Pass criteria | Fail action |
|-------|---------------|-------------|
| App installation | All required packages present | Reinstall; if still failing, remediate |
| Proxy assignment | Endpoint has < 3 devices | Assign alternate endpoint |
| Fingerprint coherence | All identity signals match | Regenerate profile; reapply |
| Fleet registration | Device appears in fleet manager | Fix enrollment; retry |

**Android 16+ note:** Advanced Protection Mode blocks ADB sideloading when enabled. If `phonefarm provision` silently fails at the app-install step, check Advanced Protection state before escalating.

---

## Stage 3 — Diagnose

Verification via the `diagnose-device` skill (`skills/diagnose-device.md`). A device that is online is **not** necessarily healthy — all five dimensions must pass.

```bash
phonefarm diagnose <serial>
```

**Five-dimension health check:**

| Dimension | Signal | Command |
|-----------|--------|---------|
| Availability | ADB reachability, network connectivity | `adb devices -l`, `dumpsys connectivity` |
| Resource health | Battery, temperature, storage | `tradeinmode getstatus` (Android 16+), raw sysfs thermal zones |
| Business application health | Foreground app, kiosk state | `dumpsys activity`, MDM console |
| Manageability | SIM status, lock state, permissions | `dumpsys telephony.registry`, MDM console |
| Security posture | ADB hosts, Play Protect, patch level | `adbd` key inspection, `getprop ro.build.version.security_patch` |

**Thermal ground truth** — always read raw sysfs zones rather than trusting `dumpsys thermalservice`:

```bash
adb -s <serial> shell 'for z in /sys/class/thermal/thermal_zone*; do \
  echo "$(cat $z/type 2>/dev/null):$(cat $z/temp 2>/dev/null)"; done'
```

**Gates:**

| Check | Pass criteria | Fail action |
|-------|---------------|-------------|
| Thermal | Peak temp below throttling threshold | Cool device, re-check |
| Battery health | State ∈ {good, fair} | Exclude if `overheat` or `dead` |
| Storage | > 15% free | Clear caches, then re-check |
| App health | No FATAL / ANR in logcat | Route to remediation |
| Security posture | Known ADB hosts only, patch level current | Revoke unknown keys, update |

If any gate fails, hand off to the **remediation ladder** (`skills/remediate-device.md`) before re-running diagnostics.

---

## Stage 4 — Register

Record the device in `FleetRegistry` with all metadata required for downstream diagnostics and rotation tracking.

```python
from phonefarm.fleet.registry import FleetRegistry, Device

reg = FleetRegistry()
reg.add(Device(
    serial="<serial>",
    imei="<imei>",
    rkp_ok=True,
    proxy="socks5://proxy-a.example:1080",
    profile_id="pixel9-us",
))
```

Or via the MCP tool:

```bash
python -c "from phonefarm.fleet.mcp_tools import TOOLS; \
  TOOLS['phonefarm.fleet.check-health'](['<serial>'])"
```

**Required metadata:**

| Field | Source |
|-------|--------|
| `serial` | `adb devices -l` |
| `imei` | `tradeinmode getstatus` (Android 16+) or `dumpsys iphonesubinfo` |
| `rkp_ok` | Stage 1 attestation result |
| `proxy` | Stage 2 network assignment |
| `profile_id` | Stage 2 fingerprint profile |
| `security_patch` | `getprop ro.build.version.security_patch` |
| `enrolled_at` | Current UTC timestamp |
| `advanced_protection` | Boolean — for downstream compatibility |

**Gates:**

| Check | Pass criteria |
|-------|---------------|
| Metadata completeness | All required fields populated |
| Proxy capacity | Endpoint not exceeding 3 devices |
| Duplicate check | No existing entry with same serial or IMEI |

---

## Rollback

If onboarding fails at any stage, the device must be returned to a known state before retry:

| Failed at | Rollback |
|-----------|----------|
| Stage 0 | Fix reachability / update OS |
| Stage 1 | Exclude from fleet; do not proceed |
| Stage 2 | Uninstall apps, clear fingerprint profile, release proxy |
| Stage 3 | Route to remediation ladder |
| Stage 4 | Remove from registry, release proxy and profile |

**Never** attempt in-place remediation of a confirmed spyware compromise — replace the device physically. Preserve the compromised device for forensics.

---

## Quick reference

```bash
# Full pipeline
adb devices -l
python -c "from phonefarm.device.rkp import certify; print(certify('<serial>'))"
phonefarm provision <serial>
phonefarm diagnose <serial>
python -c "from phonefarm.fleet.registry import FleetRegistry, Device; \
  r = FleetRegistry(); r.add(Device(serial='<serial>')); print(r.get('<serial>'))"
```

---

## References

- `skills/provision-device.md` — full provisioning procedure
- `skills/diagnose-device.md` — five-dimension health check
- `skills/remediate-device.md` — remediation ladder and escalation
- `references/rkp-attestation.md` — RKP verification workflow
- `references/tradein-mode.md` — device health assessment for factory-reset devices
- `references/fleet-health-2026.md` — fleet-level monitoring patterns
- `docs/security-posture.md` — RKP, Intrusion Logging, Advanced Protection, CVE-2026-0073

---

*Review quarterly. Onboarding gates are mandatory — a device that bypasses Stage 1 attestation cannot be trusted at any later stage.*
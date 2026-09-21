# Fleet Health — 2026

**Last updated:** 2026-09-21
**Version:** 2.0.0
**Audience:** Fleet operators running `phonefarm.fleet.check-health` and day-2 operations

---

## Core Philosophy

**Online is not healthy.** A green dot on a dashboard means a device can be reached. It says nothing about whether the kiosk app crashed an hour ago, whether the battery is about to die, or whether someone pulled the SIM card out. The gap between "device is online" and "device is doing its job" is where operational risk accumulates.

**Health is five dimensions, not one.** A device satisfies all five conditions simultaneously — or it is not healthy. This is not a checklist that can be partially completed. A device with a crashed primary app is not 80% healthy; it is failing at the dimension that matters most for its operational role.

**Alerting is not remediation.** An MDM signal identifies a condition. It does not decide what to do next. A health monitoring system without a response workflow generates noise, not reliability.

---

## The Five Dimensions

### 1. Availability — can we reach it?

*Is IT currently able to reach and manage this device?*

Covers online/offline status, ADB reachability, and network connectivity. This is the baseline: if a device is unreachable, immediate remote investigation and intervention become difficult.

| Signal | Source | Pass criteria |
|--------|--------|---------------|
| ADB reachable | `adb devices -l` | Listed with `device` state |
| Network state | `dumpsys connectivity` | Active transport, metered status known |
| Offline duration | MDM check-in timestamp | Below role-specific threshold |

**Related skill:** `diagnose-device.md` stage 1

### 2. Resource health — does it have what it needs?

*Does the device have what it needs to keep running reliably?*

Battery capacity, charge status, temperature, storage space, and cellular data usage all fall here. Critically low storage, for example, may affect application stability, system updates, or overall device performance.

| Signal | Command / source | Pass criteria |
|--------|-----------------|---------------|
| Battery health | `tradeinmode getstatus` (Android 16+) | State ∈ {good, fair} |
| Battery level | `dumpsys batterystats` | Above role-specific minimum |
| Thermal state | Raw sysfs zones | Below throttling threshold |
| Storage free | `dumpsys diskstats` | > 15% free |
| Cellular data usage | `dumpsys netstats` | Within plan limits |

**Thermal ground truth** — always read raw sysfs zones rather than trusting `dumpsys thermalservice`, which returns empty output when the thermal HAL is not ready:

```bash
for z in /sys/class/thermal/thermal_zone*; do
  echo "$(cat $z/type 2>/dev/null):$(cat $z/temp 2>/dev/null)"
done
```

### 3. Business application health — is the software doing its job?

*Is the app actually doing its job?*

Signals include app running status, foreground app status, kiosk status, and external HDMI status (relevant for signage). A device can be online and fully charged while the app it is supposed to be running has silently crashed.

| Signal | Source | Pass criteria |
|--------|--------|---------------|
| Foreground app | `dumpsys activity` | Target package is foreground |
| ANR events | Knox Asset Intelligence / MDM | Zero in current window |
| FC (force close) events | Knox Asset Intelligence | Zero in current window |
| Abnormal events | Knox Asset Intelligence | No excessive wakelock, battery drain, or CPU |
| Kiosk status | MDM console | Kiosk mode active |

**2026 note:** Knox Asset Intelligence exposes **ANR, FC, and Abnormal** event counts as first-class measures per app. Abnormal events include excessive battery drain, frequent wakelock, excessive background syncing, or excessive CPU usage. These are the signals that distinguish "app is running" from "app is functioning."

### 4. Manageability — is it still under our control?

*Is the device still under IT's control, with its configuration intact?*

Covers management permissions, SIM card status, and screen lock status. Removing a SIM card or losing management permissions may limit device connectivity, visibility, or the remote actions available to IT.

| Signal | Source | Pass criteria |
|--------|--------|---------------|
| SIM status | `dumpsys telephony.registry` | SIM present and registered |
| Screen lock | MDM console | Lock state as configured |
| Management permissions | MDM console | Device owner / profile owner intact |
| Configuration profile | MDM console | Applied without drift |

### 5. Security posture — is there evidence of compromise?

*Is there evidence of unauthorized movement or access attempts?*

Device motion status, ADB authorizations, unknown debugging hosts, and patch level. This dimension has become a hard gate in 2026 — Android 16's Advanced Protection Mode and RKP-only policy mean a device that fails security posture cannot be trusted at any later stage.

| Signal | Source | Pass criteria |
|--------|--------|---------------|
| Security patch level | `getprop ro.build.version.security_patch` | ≥ 2026-05-01 |
| RKP attestation | `cmd remote_provisioning dump` | `rpcAuthorName` present |
| ADB host keys | `/data/misc/adb/adb_keys` | Only known hosts |
| Play Protect status | MDM console | Active (not disabled) |
| Device motion | MDM console | No unexpected movement |

**Related skill:** `provision-device.md` stage 1, `docs/security-posture.md`

---

## Modern Monitoring Patterns (2026)

### Traditional scheduled check-in vs. continuous evaluation

Traditional device monitoring was not built for the scale and complexity of modern Android environments. Most MDM platforms still rely on scheduled check-ins, resulting in visibility gaps where compliance drift or app failures can go undetected for hours or days.

**Custom Device States** (introduced in SOTI MobiControl 2026.1) are configurable rules that let Android devices **continuously** monitor real-world conditions — location, connectivity, app health — and automatically trigger a policy response the instant a change occurs, not at the next scheduled check-in.

| Pattern | Latency | Use case |
|---------|---------|----------|
| Scheduled check-in | 1–6 hours | Baseline inventory, non-critical metrics |
| Continuous evaluation | Seconds | Geofence exit, app health drop, out-of-contact |
| Event-driven alert | Real-time | Crash, ANR, policy violation |

### Practical continuous-evaluation examples

**Geofence monitoring:** Detect the moment a device leaves an approved location — the device changes from "Compliant" to "Non-Compliant," an alert is sent, store-specific apps are locked, and a location report is launched.

**Out-of-contact monitoring:** Identify when a device stops communicating for a defined period. Dispatch and IT teams are notified immediately, so they can investigate before a small disruption escalates.

**App health on the road:** Monitor proof-of-delivery app updates across routes; a failed update triggers an alert before the driver reaches the next stop.

### Prometheus integration

For fleet-scale monitoring, export pass/fail results to Prometheus for alerts and dashboards. Omnitouch's Test Devices agent runs scheduled health checks covering VoLTE registration, signal, and connectivity, and exports results to Prometheus for alerting and dashboards.

**Abort thresholds** — aggregate signals that trigger an immediate halt:

| Signal | Threshold | Action |
|--------|-----------|--------|
| Crash rate (updated canaries) | > 1% within 30 min | Pause rollout, investigate |
| Offline rate | > 0.5% within 1 hour | Pause provisioning, check network |
| Thermal throttling | > 5% of fleet simultaneously | Halt batch tasks, cool down |
| Battery health degradation | > 10% `overheat` or `dead` | Quarantine affected devices |

---

## Health Scoring (2026)

### Composite scoring

Individual dimension pass/fail is necessary but not sufficient for fleet-level decision-making. A composite score enables ranking, trend tracking, and threshold-based automation.

**Knox Asset Intelligence** exposes a **Total device health score** as an average across the fleet, alongside per-dimension scores: application health, battery health, network health, and system health.

| Score | Interpretation | Action |
|-------|---------------|--------|
| 90–100 | Healthy | Monitor |
| 70–89 | Degraded | Schedule remediation in next cycle |
| 50–69 | At risk | Remediate within 24 hours |
| < 50 | Failing | Immediate intervention or replacement |

### Per-dimension scoring

The `flutter_mobile_diagnostics` package scores seven runtime domains — battery, memory, storage, network, Bluetooth, security, and performance — each as `healthy`, `warning`, `critical`, or `unknown`. This is the scoring model to emulate: domain-level status that rolls up to a composite without losing the detail needed for triage.

---

## Automation

### Scheduled fleet checks

The `phonefarm.fleet.check-health` MCP tool aggregates diagnostics across a set of devices:

```python
from phonefarm.fleet.health import check_all

results = check_all(["R58M0000001", "R58M0000002", "R58M0000003"])
for serial, report in results.items():
    if report.get("status") != "healthy":
        print(f"{serial}: {report}")
```

### CI-driven health monitoring

The GitHub Actions workflow (`.github/workflows/fleet-health-check.yml`) runs every 6 hours and exports pass/fail results to Prometheus. Wire it to your alerting stack.

### Self-healing

For non-compliant devices, attach a more restrictive policy or a self-healing script to the Non-Compliant Dynamic Group. The script runs automatically and the device is re-evaluated. Pair with `skills/remediate-device.md` for the full remediation ladder.

---

## Anti-Patterns (2026 Updated)

### ❌ Never Do

- **Trust a green dashboard dot** — online means reachable, not healthy. A device can be online while its primary app has crashed, storage is full, or the SIM has been removed.
- **Rely solely on scheduled check-ins** — visibility gaps mean compliance drift and app failures go undetected for hours or days.
- **Skip thermal ground truth** — `dumpsys thermalservice` returns empty output when the thermal HAL is not ready. Always read raw sysfs zones.
- **Ignore the manageability dimension** — a device that has lost management permissions cannot be remediated remotely, regardless of other signals.
- **Treat security posture as advisory** — RKP attestation and patch level are hard gates. A device that fails security posture cannot be trusted at any later stage.
- **Monitor without a response workflow** — an alert that does not trigger a documented action is noise, not reliability.

### ✅ Do Instead

- **Check all five dimensions** — availability, resource, application, manageability, security. A device is only as healthy as its weakest dimension.
- **Use continuous evaluation where it matters** — geofence, out-of-contact, and app-health monitoring catch issues in seconds, not hours.
- **Read raw sysfs thermal zones** as the ground truth when HAL-level tools fail.
- **Build a composite health score** with per-dimension breakdown for triage.
- **Export to Prometheus** for fleet-level alerting and dashboarding.
- **Pair monitoring with remediation** — every alert should have a documented response path.
- **Validate RKP and patch level before fleet admission** — see `docs/onboarding.md` and `docs/security-posture.md`.

---

## Reference: Fleet Health Commands (2026)

| Signal | Command | Availability |
|--------|---------|--------------|
| ADB reachability | `adb devices -l` | All versions |
| Network state | `adb shell dumpsys connectivity` | All versions |
| Battery health | `adb shell tradeinmode getstatus` | Android 16+ |
| Battery stats | `adb shell dumpsys batterystats` | All versions |
| Thermal zones (raw) | `for z in /sys/class/thermal/thermal_zone*; do cat $z/type $z/temp; done` | All versions |
| App health | `adb shell dumpsys activity` | All versions |
| Disk stats | `adb shell dumpsys diskstats` | All versions |
| Security patch | `adb shell getprop ro.build.version.security_patch` | All versions |
| RKP support | `adb shell cmd remote_provisioning dump` | Android 15+ |
| Prometheus export | Omnitouch agent → `/api/android/metrics` | Omnitouch deployments |

---

## References

- `skills/diagnose-device.md` — full diagnostic procedure
- `skills/provision-device.md` — provisioning pipeline with RKP gate
- `skills/remediate-device.md` — remediation ladder
- `references/remediation-library-2026.md` — reusable workflows and escalation
- `references/rkp-attestation.md` — RKP verification workflow
- `references/tradein-mode.md` — Android 16+ device health API
- `docs/security-posture.md` — RKP, Intrusion Logging, Advanced Protection, CVE-2026-0073
- `docs/fleet-operations.md` — operational loops and cadence
- `docs/mcp-tools.md` — MCP tool catalog

**External sources:** AirDroid (Aug 2026), Knox Asset Intelligence (Jul 2026), Omnitouch Docs (Aug 2026), SOTI MobiControl 2026.1 (Aug 2026), Android Developers Blog (Jan 2026)

---

*Last updated: August 2026. Review platform monitoring capabilities and threshold defaults monthly — continuous evaluation patterns and health scoring models are evolving faster than any other area of fleet operations.*
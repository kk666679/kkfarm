---
name: remediate-device
description:
  Remediate device issues automatically or with guided steps. Handles app reinstall, cache clear, network reset, factory
  reset, incorporating Android 16 intrusion logging, MDM self-healing workflows, HID-powered remote reset automation, and
  2026 fleet-recovery patterns.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 2.0.0
  updated: 2026-08-15
allowed-tools: Bash(python:*) Read
tags: [device, remediation, recovery, 2026-trends]
---

# Remediate Device (2026 Edition)

## Core Philosophy

**An alert is not a remediation.** Detecting a device issue is easier than resolving it. An MDM signal — a missed check-in, a full storage warning, an app crash flag — identifies a condition, but it does not decide what to do next. A remediation workflow must gather current device context, apply decision rules, carry out permitted steps, verify the result, and escalate to a human when it cannot continue safely.

**Preserve evidence before you wipe.** Android 16's Intrusion Logging produces encrypted, cloud-backed security bundles retained for 12 months that survive device wipes. These bundles contain per-app DNS lookups, connection events with destination IPs, and full ADB command histories. A factory reset destroys on-device diagnostic context that cannot be reconstructed. Always export or archive logs before any destructive remediation step.

**Least invasive first, but not blindly.** The canonical ladder — clear cache → restart app → restart device → reinstall → network reset → factory reset — remains correct. But in 2026, some "least invasive" fixes have hidden costs. `pm clear` resets an app to its first-install state, forcing re-login and re-granting of permissions. On accounts with heavy personalization, this may be more disruptive than a reinstall.

## Procedure

### 1. Identify Issue from Diagnosis

Before choosing a remediation path, confirm the diagnosis is **current and not stale**:

- **Check device check-in time**: If the device has not checked in recently, the reported state may be outdated. A device reporting "app crashed" 6 hours ago may have already recovered, or may be offline entirely.
- **Classify issue type**: Connectivity, app health (crash/ANR), performance (thermal throttling), storage, policy drift, or hardware.
- **Check for CVE exposure**: If the device is running an Android version prior to the May 2026 patch level, verify whether the Wireless ADB Authentication Bypass (CVE-2026-0073) has been remediated via Project Mainline adbd module. This vulnerability enables zero-click shell access without user interaction.
- **Determine if in-place remediation is safe**: If a commercial spyware compromise is confirmed on the device, do **not** attempt in-place remediation. Pegasus and Graphite implants with SELinux bypass capability can survive factory reset on some firmware versions — the device must be physically replaced and the compromised device preserved for forensics.

### 2. Apply Least Invasive Fix First

The canonical remediation ladder remains valid, but each step has 2026-specific considerations:

#### 🧹 Clear App Cache/Data
- **Command**: `adb shell pm clear <package_name>`
- **2026 nuance**: `pm clear` requires shell privileges and has an expected latency of 300-500ms. It wipes all app data including shared preferences, databases, and accounts — equivalent to a fresh install.
- **Cache-only alternative**: `adb shell pm trim-caches 0` clears all app caches without touching data. Use `--user 0` flag to target only the current user.
- **Force-stop after**: Always `adb shell am force-stop <package>` after clearing to ensure the app reads fresh state on next launch.
- **Limitation on Android 16**: Advanced Protection Mode restricts the ability to disable the system's built-in malware scanner through ADB. Do not attempt to disable Play Protect or system security services as part of remediation.

#### 🔄 Restart App
- **Command**: `adb shell am force-stop <package>` followed by `adb shell am start -n <package>/.MainActivity`
- **Purpose**: Resolves transient state corruption, cached stale values, and background service deadlocks.
- **Verification**: Confirm the app reaches its main activity without crash. Check logcat for `FATAL EXCEPTION` in the immediate window.

#### 🔄 Restart Device
- **Command**: `adb reboot`
- **Purpose**: Clears kernel state, resets thermal zones, reinitializes network stack.
- **Post-reboot check**: Wait for `adb wait-for-device` then verify boot completion via `adb shell getprop sys.boot_completed`.

#### 📦 Reinstall App
- **Command**: `adb uninstall <package>` followed by `adb install <apk>`
- **2026 nuance**: For managed devices, use MDM silent installation through Managed Google Play rather than ADB. This preserves device management permissions and prevents the app from being flagged as sideloaded.
- **Post-reinstall**: Re-grant all required permissions. On Android 16, `WRITE_SECURE_SETTINGS` and accessibility permissions must be explicitly re-granted via ADB or the user UI.

#### 📶 Network Reset
- **Soft reset (preferred)**: Toggle airplane mode — `adb shell settings put global airplane_mode_on 1 && sleep 3 && adb shell settings put global airplane_mode_on 0`. This forces carrier reconnection and new IP assignment without losing saved Wi-Fi credentials.
- **IP flush**: `adb shell ip addr flush dev wlan0` and `ifconfig wlan0 up` to force DHCP renewal.
- **Full network reset**: `adb shell settings reset network` (equivalent to Settings → System → Reset Options → Reset Wi-Fi, mobile & Bluetooth). This removes all saved Wi-Fi passwords and Bluetooth pairings.
- **ADB connection reset** (if ADB itself is the issue): `adb shell pm clear com.android.shell`, disable wireless ADB flag, and remove ADB authorizations.
- **ADB Wi-Fi 2.0 note**: For Android 17+ devices, ADB Wi-Fi 2.0 improves auto-connect reliability by 32% and connection speed by 66%. If wireless ADB remains unstable after network reset, update to Platform-Tools 37.0.0 and ensure Android Studio Quail 3+ is in use.

#### 🏭 Factory Reset (Last Resort)

**Before factory reset — mandatory pre-checks:**

1. **Backup verification**: Confirm all device data, account bindings, and configuration profiles are backed up or reproducible. A remote wipe and a factory reset are functionally equivalent — both clear user data on the next successful connection.
2. **FRP awareness**: On Android 16, Factory Reset Protection flags resets that were not confirmed by the device owner. A reset triggered via recovery mode or an unconfirmed remote wipe may restrict the device until the rightful owner verifies ownership.
3. **Intrusion Log export**: If Intrusion Logging was enabled, export the encrypted security bundle **before** wiping. These bundles survive device wipes and are retained for 12 months in Google's cloud — but on-device access to trigger an export is lost after reset.
4. **Trade-in mode check (Android 16+)**: On factory-reset devices, `adb shell tradeinmode getstatus` returns battery health, cycle count, part status, and IMEI in seconds — use this to validate the device is worth re-provisioning before committing to the full reset-reenrollment cycle.

**Remote reset via HID automation (2026):**

For fleets, HID (Human Interface Device) support enables complete remote automation of post-reset setup and MDM re-enrollment without physically touching the device. AstroFarm and similar platforms can simulate touch, swipe, and text entry during factory reset setup screens — automating Wi-Fi configuration, account setup, and enrollment steps that previously required hands-on intervention.

Granular reset levels available in 2026:
- **Normal Wipe** — Removes user data and apps
- **Wipe Settings Only** — Resets device settings while preserving user data
- **Complete Factory Reset** — Full device wipe

### 3. Verify Fix with Health Check

**A device that is online is not necessarily healthy.** Verify across all five dimensions:

| Dimension | Check |
|-----------|-------|
| Availability | `adb devices` reachability, network connectivity |
| Resource health | Battery level, temperature (raw thermal zones), storage space |
| Business application health | Foreground app status, kiosk status, app running state |
| Manageability | SIM status, screen lock status, management permissions intact |
| Security posture | ADB authorizations, unknown debugging hosts, Play Protect status |

- **Thermal ground truth**: Always read raw sysfs thermal zones rather than relying on `dumpsys thermalservice` — the thermal HAL may return empty output when not ready.
- **Post-remediation logcat**: Capture `adb logcat -d` and grep for `FATAL`, `ANR`, and `E` (error) tags. A fix that stops the symptom but produces new error signatures is not a fix.

### 4. Log Remediation Action

- **Record**: Device serial, issue classification, remediation path applied, timestamp, verification result, and any escalation.
- **Remediation library pattern**: Each recurring issue should have a template defining the condition to watch, required context before acting, steps that may run automatically, approval gates, and evidence needed to close the issue.
- **Self-healing scripts (MDM)**: For non-compliant devices, attach a more restrictive policy or a self-healing script to the Non-Compliant Dynamic Group. The script runs automatically and the device is re-evaluated.
- **Alert thresholds for fleet-level monitoring**:
  - Abort if crash rate > 1% of updated canaries within 30 minutes
  - Abort if device offline rate > 0.5% within 1 hour

## Anti-Patterns (2026 Updated)

### ❌ Never Do
- **Factory reset without backup or without exporting Intrusion Logs** — on-device diagnostic context is destroyed permanently. Intrusion Logging bundles survive wipes only if they were already synced to Google's cloud.
- **Skip verification after fix** — a device that reports "remediated" but has a crashed primary app, full storage, or removed SIM is not remediated.
- **Attempt in-place remediation of confirmed spyware compromise** — implants with SELinux bypass capability can survive factory reset on some firmware versions. Replace the device physically.
- **Disable system security services via ADB** — Android 16 restricts disabling the built-in malware scanner through ADB. Do not attempt to bypass this as a remediation step.
- **Use `pm clear` as a first-line fix for apps with heavy personalization** — it forces re-login and re-granting of all permissions, potentially causing more disruption than a targeted cache trim.
- **Trust stale MDM state** — a device reporting an issue hours ago may have already recovered or gone offline. Confirm check-in recency before acting.
- **Remote-wipe a device without confirming FRP ownership** — on Android 16, unconfirmed resets are flagged as suspicious and the device may become restricted until ownership verification.

### ✅ Do Instead
- **Export diagnostic logs before any destructive step** — Intrusion Logs, logcat buffers, and MDM check-in history are the evidence trail for post-mortem analysis.
- **Use granular reset levels** — "Wipe Settings Only" preserves user data when only configuration is corrupted. Reserve Complete Factory Reset for genuinely corrupted devices.
- **Leverage HID automation for post-reset setup** — for fleets, remote automation eliminates the manual tapping and re-enrollment bottleneck.
- **Use `pm trim-caches` for cache-only cleanup** — avoids the re-login disruption of `pm clear`.
- **Check CVE exposure before remediation** — a device with unpatched Wireless ADB bypass may re-compromise immediately after remediation.
- **Build a reusable remediation library** — recurring issues should have documented workflows, not ad-hoc commands. Document triggers, scope, context checks, automatic steps, approval gates, verification, and escalation paths.
- **Verify across all five health dimensions** — availability, resources, business apps, manageability, and security posture. A green dashboard dot does not mean a healthy device.

## Reference: Remediation Commands (2026)

| Action | Command | Notes |
|--------|---------|-------|
| Clear app data + cache | `adb shell pm clear <package>` | 300-500ms latency; resets to fresh install |
| Trim caches only | `adb shell pm trim-caches 0` | Preserves user data |
| List third-party packages | `adb shell pm list packages -3` | Use before batch clearing |
| Force-stop app | `adb shell am force-stop <package>` | Mandatory after identifier changes |
| Restart app | `adb shell am start -n <package>/.MainActivity` | Verify no FATAL in logcat |
| Reboot device | `adb reboot` | Wait for `sys.boot_completed` |
| Soft network reset | `adb shell settings put global airplane_mode_on 1` then `0` | Forces carrier reconnection |
| IP flush | `adb shell ip addr flush dev wlan0` | Force DHCP renewal |
| Full network reset | `adb shell settings reset network` | Removes Wi-Fi passwords, BT pairings |
| ADB connection reset | `adb shell pm clear com.android.shell` | Use when ADB itself is unreachable |
| Remove ADB authorizations | `adb shell rm /data/misc/adb/adb_keys` | Revokes trusted debugging hosts |
| Thermal zones (raw) | `for z in /sys/class/thermal/thermal_zone*; do cat $z/type $z/temp; done` | Ground truth when HAL fails |
| Intrusion Log export | Settings → Security & Privacy → Advanced Protection | Pixel / Android 16+ |
| Factory reset (remote) | MDM console → Wipe | HID automation for post-reset setup |
| Trade-in status | `adb shell tradeinmode getstatus` | Android 16+ factory-reset devices |
| ADB Wi-Fi 2.0 (Android 17+) | Requires Platform-Tools 37.0.0 | 32% more reliable auto-connect |

---

*Last updated: August 2026. Android 16's Advanced Protection Mode and ADB restrictions are tightening the boundary between what can be remediated remotely and what requires physical intervention. Review Android developer release notes quarterly, and validate that all remediation commands remain available under the current patch level before committing them to automated workflows. For fleet-scale remediation, pair this skill with `references/remediation-library-2026.md` for reusable workflow templates and escalation matrices.*
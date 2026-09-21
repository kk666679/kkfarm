# Remediation Library — 2026

**Last updated:** 2026-09-21
**Version:** 2.0.0
**Supersedes:** v1.0 (2026-08-15)
**Audience:** Fleet operators, MDM administrators, and automation engineers

---

## Core Philosophy

**An alert is not a remediation.** An MDM platform can provide signals about check-in activity, battery and storage levels, app status, and policy state. Depending on the platform and its configuration, some of those conditions may also trigger alerts. But an alert does not decide what the team should do next. An administrator still has to check whether the information is current, determine whether the device can receive a command, judge the effect of taking action, contact the right owner, and confirm that the issue has been resolved.

**A remediation library is not a list of alerts or remote commands.** An alert identifies a condition. A command attempts an action. A remediation workflow connects the work around them: it gathers current device information, applies decision rules, carries out permitted steps, checks the result, and hands the issue to a person when it cannot continue safely.

**The same decisions come up again and again.** Across a large fleet of Android devices, POS terminals, logistics tablets, digital signage screens, or unattended kiosks, the same recurring decisions appear. A remediation library turns those recurring decisions into **reusable workflow templates** — each defining the condition to watch, the context required before acting, the steps that may run automatically, the points that require approval, and the evidence needed to close or escalate the issue.

---

## The Ladder

```
1. cache           ← clear app cache (data preserved via pm trim-caches)
2. restart_app     ← force-stop + relaunch
3. reboot          ← full device restart
4. reinstall       ← uninstall + reinstall (via MDM on managed devices)
5. network_reset   ← soft reset (airplane mode) or full network reset
6. factory         ← LAST RESORT — see pre-flight gates
```

**Rule:** Apply the least invasive fix first. Escalate only when the current level fails verification. **Never** skip a level without documented justification.

---

## Level 1 — Cache

### Condition to watch

- App performance degradation without crashes
- Storage pressure on the device
- Stale UI state or cached data errors
- App responding slowly but not force-closing

### Required context before acting

| Check | Why |
|-------|-----|
| App is not mid-transaction | Clearing cache during a write operation can corrupt state |
| Cache size is materially large | Trimming a 2MB cache will not help; confirm the cache is the problem |
| App supports cache regeneration | Some apps cache critical offline data that must be re-synced |

**2026 ADB nuance:** Use `pm trim-caches` — **not** `pm clear --cache-only`. The latter hangs on Android 16 and creates zombie processes.

### Steps that may run automatically

```bash
# Trim all app caches (preserves user data)
adb -s <serial> shell pm trim-caches 0

# Or target a specific user only
adb -s <serial> shell pm trim-caches 0 --user 0

# Force-stop the app so it reads fresh state on next launch
adb -s <serial> shell am force-stop <package>

# Relaunch
adb -s <serial> shell am start -n <package>/.MainActivity
```

### Approval gates

**None.** Cache trimming is non-destructive and safe to run automatically.

### Evidence needed to close

| Evidence | Source |
|----------|--------|
| Cache size before/after | `dumpsys diskstats` or app storage info |
| App reaches main activity | `dumpsys activity` or logcat |
| No new FATAL in logcat | `adb logcat -d | grep FATAL` |

---

## Level 2 — Restart App

### Condition to watch

- App crash (FATAL EXCEPTION in logcat)
- App hang or ANR
- Background service deadlock
- Stale cached values after identifier change

### Required context before acting

| Check | Why |
|-------|-----|
| No background sync in progress | Force-stopping during sync can corrupt local data |
| App state is reproducible | User will need to re-authenticate if session tokens are lost |
| Not mid-transaction | Same as Level 1 |

### Steps that may run automatically

```bash
# Force-stop
adb -s <serial> shell am force-stop <package>

# Relaunch main activity
adb -s <serial> shell am start -n <package>/.MainActivity
```

### Approval gates

**None** for force-stop and relaunch. Safe to run automatically.

### Evidence needed to close

| Evidence | Source |
|----------|--------|
| Main activity reached | `dumpsys activity` |
| No FATAL in the immediate window | `adb logcat -d | grep -E "FATAL|ANR"` |
| App remains foreground for > 60s | `dumpsys activity` poll |

---

## Level 3 — Reboot

### Condition to watch

- Transient system state corruption
- Thermal throttling that persists after cool-down
- Network stack issues that survive app restart
- Kernel-level wakelock leaks

### Required context before acting

| Check | Why |
|-------|-----|
| No active fleet-wide batch operation | Reboot during a batch can cascade into failures |
| No unattended kiosk in active use | Kiosk devices may need physical presence for unlock after reboot |
| Battery level sufficient | Rebooting at < 5% battery risks shutdown during boot |

### Steps that may run automatically

```bash
# Reboot
adb -s <serial> reboot

# Wait for device
adb -s <serial> wait-for-device

# Confirm boot completed
adb -s <serial> shell getprop sys.boot_completed
# Expected: 1
```

### Approval gates

**Automatic for non-kiosk devices.** **Approval required for kiosk/unattended devices** — confirm no active user session and that the device will boot to the correct state.

### Evidence needed to close

| Evidence | Source |
|----------|--------|
| `sys.boot_completed = 1` | `getprop` |
| Target app is foreground post-boot | `dumpsys activity` |
| Thermal zones within threshold | Raw sysfs read |
| No crash/ANR in first 2 minutes post-boot | `adb logcat -d` |

---

## Level 4 — Reinstall

### Condition to watch

- App data corruption that survives restart
- Repeated crashes on launch after restart
- Missing required app (policy drift)
- Version mismatch or update failure

### Required context before acting

| Check | Why |
|-------|-----|
| App data is reproducible or backed up | Uninstall destroys all app data |
| Reinstall path is available | MDM silent install, ADB APK, or Play Store |
| Permissions will be re-grantable | Some permissions require user interaction |
| Not a system app | System apps cannot be uninstalled via standard ADB |

**2026 MDM nuance:** For managed devices, use **Managed Google Play silent installation** rather than ADB. This preserves device management permissions and prevents the app from being flagged as sideloaded.

**Self-healing pattern:** Hexnode and similar MDM platforms can detect a missing required app and force a re-installation automatically. Configure app remediation under **Policies → App Management → Required Apps**: if a user uninstalls one of these apps, the agent detects the absence during its next sync and automatically prompts or forces the re-installation to restore compliance.

### Steps that may run automatically

```bash
# Uninstall
adb -s <serial> uninstall <package>

# Reinstall (non-MDM path)
adb -s <serial> install <apk-path>
```

**MDM path:** push the app through Managed Google Play as a Required App. The agent handles detection, re-install, and compliance restoration automatically.

### Approval gates

**Approval required.** Uninstall destroys app data. Confirm the data is backed up or reproducible before proceeding. For MDM-managed devices, the Required Apps policy handles this without manual intervention.

### Evidence needed to close

| Evidence | Source |
|----------|--------|
| Package present | `pm list packages | grep <package>` |
| App reaches main activity | `dumpsys activity` |
| Permissions re-granted | `dumpsys package <package>` |
| Compliance status restored | MDM console |

---

## Level 5 — Network Reset

### Condition to watch

- Persistent connectivity failure after reboot
- IP conflict or stale DHCP lease
- Wi-Fi credentials corrupted
- Cellular data not reconnecting
- ADB-over-Wi-Fi unreachable

### Required context before acting

| Check | Why |
|-------|-----|
| Wi-Fi credentials are recorded | Full network reset removes saved networks |
| Bluetooth pairings are documented | Full reset removes paired devices |
| Not during an active session | Reset will drop the current connection |
| Proxy configuration is recoverable | Reset removes proxy settings |

**2026 ADB nuance:** Network reset has multiple tiers. Choose the least invasive that resolves the issue.

### Steps that may run automatically

#### Soft reset (preferred — preserves Wi-Fi credentials)

```bash
# Airplane mode toggle — forces carrier reconnection
adb -s <serial> shell settings put global airplane_mode_on 1
sleep 3
adb -s <serial> shell settings put global airplane_mode_on 0
```

#### IP flush (forces DHCP renewal)

```bash
adb -s <serial> shell ip addr flush dev wlan0
adb -s <serial> shell ifconfig wlan0 up
```

#### ADB connection reset (when ADB itself is the problem)

```bash
# Clear ADB shell settings
adb -s <serial> shell pm clear com.android.shell

# Disable wireless ADB
adb -s <serial> shell settings put global adb_wifi_enabled 0

# Restart ADB server on control host
adb kill-server && adb start-server

# Reset ADB authorizations (if needed)
adb -s <serial> shell rm /data/misc/adb/adb_keys
# Then unplug/replug and re-authorize
```

Source:

#### Full network reset (destructive — removes Wi-Fi and Bluetooth)

```bash
adb -s <serial> shell settings reset network
```

### Approval gates

**Soft reset and IP flush:** automatic.
**ADB connection reset:** automatic — no user data lost.
**Full network reset:** **approval required** — removes saved Wi-Fi credentials and Bluetooth pairings.

### Evidence needed to close

| Evidence | Source |
|----------|--------|
| IP address assigned | `ip addr show wlan0` |
| Network reachable | `ping` or `dumpsys connectivity` |
| Target app reconnects | `dumpsys activity` + logcat |
| Wi-Fi credentials restored (if full reset) | Manual or MDM re-push |

---

## Level 6 — Factory Reset

### Condition to watch

- Malware compromise confirmed
- Persistent policy drift that cannot be corrected
- Device being decommissioned or reassigned
- Unrecoverable system corruption

### Required context before acting — **mandatory pre-checks**

| Check | Why | Consequence of skipping |
|-------|-----|------------------------|
| **Backup verification** | All device data, account bindings, and configuration profiles must be reproducible | Permanent data loss |
| **Intrusion Log export** | If Intrusion Logging was enabled, export the encrypted bundle **before** wiping | On-device access to trigger an export is lost after reset |
| **FRP ownership check** | On Android 16, unconfirmed resets are flagged as suspicious | Device may become restricted until ownership verification |
| **Trade-in mode status** | Validate the device is worth re-provisioning before committing to the full reset-reenrollment cycle | Wasted re-provisioning effort |
| **Spyware compromise check** | If confirmed commercial spyware is present, do **not** remediate in place | Implants with SELinux bypass can survive factory reset |

**Critical:** A factory reset destroys on-device diagnostic context that cannot be reconstructed. Always export or archive logs before any destructive remediation step.

### Steps that may run automatically

```bash
# Android 16+ — validate before reset
adb -s <serial> shell tradeinmode getstatus
```

**Remote reset via MDM:** trigger from the MDM console. For fleets, HID automation can complete post-reset setup steps (Wi-Fi, account, enrollment) remotely without physical intervention.

**Granular reset levels (2026):**

| Level | Effect |
|-------|--------|
| **Wipe Settings Only** | Resets device settings, preserves user data |
| **Normal Wipe** | Removes user data and apps |
| **Complete Factory Reset** | Full device wipe |

### Approval gates

**Approval required — always.** Factory reset is never automatic. Require explicit operator confirmation and documented justification.

### Escalation

| Condition | Action |
|-----------|--------|
| Ladder exhausted, device still failing | Replace device physically |
| Confirmed commercial spyware compromise | **Do not remediate in place** — replace, preserve for forensics |
| Repeated failure of same level across fleet | Halt remediation, investigate root cause |

### Evidence needed to close

| Evidence | Source |
|----------|--------|
| Pre-reset Intrusion Log export (if applicable) | Google cloud / local archive |
| Reset command confirmed | MDM console |
| Device boots to setup wizard | `dumpsys activity` |
| Re-enrollment succeeds | MDM console |
| Post-reset health check passes | `check_all()` |

---

## Building the Library

### Template field definitions

A reusable template should describe the decision process clearly enough that another administrator can understand what it will do before running it. At minimum, document the following fields:

| Field | What to define | Example (offline-device workflow) |
|-------|---------------|-----------------------------------|
| **Purpose** | The operational problem the workflow handles | Identify business devices that have stopped checking in and route them for follow-up |
| **Trigger** | The event, schedule, or manual request that starts it | Run a scheduled check every morning |
| **Scope** | Device groups, sites, platforms, or owners included | Production devices in region EU-WEST |
| **Condition** | The specific state that flags the device | No check-in for > 6 hours |
| **Required context** | What must be true before acting | Device is not in an active session; last known battery > 20% |
| **Automatic steps** | What may run without approval | Send notification; generate report; tag device |
| **Approval gates** | What requires human confirmation | Any destructive action; any action on kiosk devices |
| **Verification** | How success is confirmed | Device checks in successfully; target app is foreground |
| **Evidence** | What must be recorded to close the issue | Check-in timestamp; app foreground status; logcat excerpt |
| **Escalation** | What happens if the workflow cannot resolve it | Hand off to Level 2 operator; open support case |

### Workflow anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│                     REMEDIATION WORKFLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   TRIGGER    │───▶│   CONFIRM    │───▶│    QUERY     │       │
│  │ Alert/Sched/ │    │ Scope +      │    │ Current      │       │
│  │ Manual/Event │    │ Exclusions   │    │ Context      │       │
│  └──────────────┘    └──────────────┘    └──────┬───────┘       │
│                                                  │               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────▼───────┐       │
│  │   ESCALATE   │◀───│   VERIFY     │◀───│   CLASSIFY   │       │
│  │ Hand off to  │    │ State +      │    │ Issue type   │       │
│  │ right team   │    │ Result       │    │ + impact     │       │
│  └──────────────┘    └──────────────┘    └──────┬───────┘       │
│                                                  │               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────▼───────┐       │
│  │   RECORD     │◀───│   MONITOR    │◀───│   EXECUTE    │       │
│  │ Logs +       │    │ Keep         │    │ Auto or      │       │
│  │ Status       │    │ tracking     │    │ approval     │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Self-healing integration

Self-healing automation ensures a device always stays in compliance with corporate policy. In a standard UEM setup, if a user finds a way to disable a setting — like turning off encryption or removing a required app — the device remains drifted until the next manual audit. By leveraging profile enforcement, a compliance engine, and localized scripting, the device continuously compares its local state against the assigned "Desired State." If policy drift is detected, the system automatically flags the device and triggers remediation workflows to force the device back into compliance without human intervention.

**The self-healing cycle:**

| Phase | Action |
|-------|--------|
| **Monitor** | Agent checks at regular intervals for specific states (e.g., "Is the required app installed?") |
| **Detect** | Engine notices a state change (e.g., the app has been deleted) |
| **Remediate** | System immediately re-deploys the missing application |
| **Report** | Event logged in the console's Action History and Compliance Reports |

Source:

**Four layers of self-healing automation:**

| Layer | Mechanism | Example |
|-------|-----------|---------|
| **Prevent** | Profile enforcement — non-removable MDM profile | Android Enterprise Device Owner mode prevents profile deletion |
| **Detect** | Compliance engine flags non-compliant state | Required app missing → device flagged |
| **Remediate** | Automated re-deployment of required apps | Force re-install of missing app |
| **Advanced** | Local scripting for granular "Check-and-Fix" loops | Registry key repair (Windows); plist repair (macOS) |

Source:

### Compliance enforcement levels

For policy drift remediation, attach a more restrictive policy or a **"Self-Healing" script** to your Non-Compliant Dynamic Group.

| Enforcement level | Action type | Technical execution |
|-------------------|-------------|---------------------|
| **Level 1: Alert** | Notification | Instant push message to user; email alert to regional administrator |
| **Level 2: Heal** | Restoration | Automatically re-push the "Golden" configuration profile or re-install missing mandatory apps |
| **Level 3: Restrict** | Isolation | Revoke access to corporate Wi-Fi and enterprise email via Conditional Access |
| **Level 4: Protect** | Containment | Corporate Wipe or remote device lock for critical violations |

Source:

---

## Anti-Patterns (2026 Updated)

### ❌ Never Do

- **Factory reset without backup or Intrusion Log export** — on-device diagnostic context is destroyed permanently.
- **Skip verification after fix** — a device that reports "remediated" but has a crashed primary app, full storage, or removed SIM is not remediated.
- **Attempt in-place remediation of confirmed spyware compromise** — implants with SELinux bypass capability can survive factory reset on some firmware versions. Replace the device physically.
- **Use `pm clear --cache-only` on Android 16** — it hangs and creates zombie processes. Use `pm trim-caches` instead.
- **Remote-wipe without confirming FRP ownership** — on Android 16, unconfirmed resets are flagged as suspicious and the device may become restricted until ownership verification.
- **Reboot a kiosk device without approval** — kiosk devices may require physical presence for unlock after reboot.
- **Trust stale MDM state** — a device reporting an issue hours ago may have already recovered or gone offline. Confirm check-in recency before acting.
- **Skip the ladder** — applying factory reset as a first-line fix for a cache issue is operationally negligent.

### ✅ Do Instead

- **Export diagnostic logs before any destructive step** — Intrusion Logs, logcat buffers, and MDM check-in history are the evidence trail for post-mortem analysis.
- **Use granular reset levels** — "Wipe Settings Only" preserves user data when only configuration is corrupted. Reserve Complete Factory Reset for genuinely corrupted devices.
- **Leverage HID automation for post-reset setup** — for fleets, remote automation eliminates the manual tapping and re-enrollment bottleneck.
- **Use `pm trim-caches` for cache-only cleanup** — avoids the re-login disruption of `pm clear`.
- **Build a reusable remediation library** — recurring issues should have documented workflows, not ad-hoc commands. Document triggers, scope, context checks, automatic steps, approval gates, verification, and escalation paths.
- **Check CVE exposure before remediation** — a device with unpatched Wireless ADB bypass may re-compromise immediately after remediation.
- **Verify across all five health dimensions** — availability, resources, business apps, manageability, and security posture. A green dashboard dot does not mean a healthy device.
- **Pair monitoring with remediation** — every alert should have a documented response path.

---

## Reference: Remediation Commands (2026)

| Action | Command | Notes |
|--------|---------|-------|
| Trim caches only | `adb shell pm trim-caches 0` | Preserves user data; safe on Android 16 |
| Clear app data | `adb shell pm clear <package>` | Destructive — resets to fresh install |
| Force-stop app | `adb shell am force-stop <package>` | Mandatory after identifier changes |
| Restart app | `adb shell am start -n <package>/.MainActivity` | Verify no FATAL in logcat |
| Reboot device | `adb reboot` | Wait for `sys.boot_completed` |
| Uninstall app | `adb uninstall <package>` | Destructive — app data lost |
| Reinstall app | `adb install <apk>` | MDM silent install preferred |
| Soft network reset | `settings put global airplane_mode_on 1` → `0` | Preserves Wi-Fi credentials |
| IP flush | `ip addr flush dev wlan0` | Forces DHCP renewal |
| ADB connection reset | `pm clear com.android.shell` | Use when ADB itself is unreachable |
| Reset ADB authorizations | `rm /data/misc/adb/adb_keys` | Revokes trusted debugging hosts |
| Full network reset | `settings reset network` | Destructive — removes Wi-Fi + Bluetooth |
| Thermal zones (raw) | `for z in /sys/class/thermal/thermal_zone*; do cat $z/type $z/temp; done` | Ground truth when HAL fails |
| Trade-in status | `adb shell tradeinmode getstatus` | Android 16+ factory-reset devices |
| Intrusion Log export | Settings → Security & Privacy → Advanced Protection | Pixel / Android 16+ |

---

## Operational Cadence

| Task | Frequency | Owner |
|------|-----------|-------|
| Cache trim | Weekly per device | Automated |
| App restart | As needed (crash/ANR) | Automated |
| Reboot | As needed (thermal/network) | Automated (non-kiosk) |
| Reinstall | As needed (corruption/drift) | Approval required |
| Network reset | As needed (connectivity) | Soft: automatic; Full: approval |
| Factory reset | Last resort only | Approval required |
| Library review | Monthly | Fleet owner |
| Threshold recalibration | Quarterly | Fleet owner |

---

## References

- `skills/remediate-device.md` — remediation contract
- `skills/diagnose-device.md` — five-dimension health check
- `references/fleet-health-2026.md` — fleet-level monitoring patterns
- `references/rkp-attestation.md` — RKP verification workflow
- `references/tradein-mode.md` — Android 16+ device health API
- `docs/security-posture.md` — RKP, Intrusion Logging, Advanced Protection, CVE-2026-0073
- `docs/fleet-operations.md` — operational loops and cadence
- `docs/mcp-tools.md` — MCP tool catalog

**External sources:** AirDroid (Sep 2026), Hexnode (Jan–Mar 2026), LobeHub phone-maintenance skill (May 2026), Stack Overflow ADB reset procedures (2026)

---

*Last updated: September 2026. Review monthly — remediation commands and MDM self-healing capabilities are evolving faster than any other area of fleet operations. Validate that all commands remain available under the current Android patch level before committing them to automated workflows.*
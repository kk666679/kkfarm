---
name: diagnose-device
description: Diagnose device issues including connectivity, app crashes, performance degradation, and hardware problems, incorporating Android 16+ diagnostic APIs and 2026 fleet-health automation patterns.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 2.0.0
  updated: 2026-08-15
allowed-tools: Bash(python:*) Read
tags: [device, diagnosis, troubleshooting, 2026-trends]
---

# Diagnose Device (2026 Edition)

## Core Philosophy

**Diagnose from the device, not from the dashboard.** In 2026, Android 16+ exposes richer on-device health data than most management dashboards surface. The `dumpsys` tool provides diagnostic output for all system services running on a connected device, including input, RAM, battery, and network diagnostics. You should pull raw service data first, then interpret.

**Thermal state is a first-class diagnostic signal.** Heat causes thermal throttling, the #1 reason for FPS drops and lag. In a device farm, thermal degradation cascades — one throttled device can skew performance metrics for an entire test run. Always check thermal zones before concluding an app is "slow."

**Factory-reset diagnostics got dramatically faster.** Android 16 introduced **Trade-in mode**, which bypasses the setup wizard entirely and gives you device health information with a single ADB command: `adb shell tradeinmode getstatus`. Battery cycle count, health state, part status (original vs. replaced), moisture intrusion, and foldable lifespan are all returned in seconds.

## Procedure

### 1. Check Connectivity (ADB, Network)
- **ADB reachability**: `adb devices -l` — confirm device is authorized and online.
- **Wireless debugging**: Android 11+ supports ADB over Wi-Fi without a PC. Tools like LADB enable on-device wireless debugging for connection troubleshooting.
- **Network state**: `adb shell dumpsys connectivity` for current network transport and metered status.
- **DeepADB pattern**: If using an MCP-based workflow, the `wireless` module handles structured connection management, and `network-discovery` detects devices that have dropped off the bus.

### 2. Verify Battery and Thermal Status
- **Battery health (Android 16+)**: `adb shell tradeinmode getstatus` returns cycle count, health state (`good`, `overheat`, `dead`, `over_voltage`, `fair`, etc.), manufacturing date, and part status.
- **Battery stats (all versions)**: `adb shell dumpsys batterystats` — search for degradation patterns and rogue wakelocks.
- **Thermal zones (direct sysfs read)**:
  ```bash
  adb shell "for z in /sys/class/thermal/thermal_zone*; do echo \"\$(cat \$z/type 2>/dev/null):\$(cat \$z/temp 2>/dev/null)\"; done"
  ```
  This bypasses HAL failures that make `dumpsys thermalservice` return empty output.
- **Thermal service dump**: `adb shell dumpsys thermalservice` — shows throttling thresholds via `HardwarePropertiesManager.TEMPERATURE_THROTTLING`.
- **Third-party telemetry**: Apps like CPU GPU Battery Temperature track CPU, GPU, skin, USB, and battery temperatures in real time, with alerts before throttling kicks in.

### 3. Check App Health (Crashes, ANRs)
- **Crash logs**: `adb logcat -d | grep -E "FATAL|ANR"` for fatal exceptions and application-not-responding events.
- **Wakelock audit**: `dumpsys batterystats` reveals apps holding wake locks beyond their useful window — a top root cause of battery drain and background performance degradation.
- **Memory pressure**: `adb shell dumpsys meminfo <package>` for per-app RAM snapshots. FrameX's diagnostic workflow captures the same data plus FPS and CPU frequencies.
- **Root-cause context**: 2026 research confirms that 57% of real-world performance root causes have not been examined in academic research, and 63% remain unaddressed by existing tools — meaning manual inspection still catches what automation misses.

### 4. Measure Performance (CPU, RAM, FPS)
- **CPU/memory pressure**: `adb shell dumpsys procstats --hours 3` for recent memory and CPU usage per process.
- **Native thread exhaustion**: On rooted devices running long-lived services (adbd, AdGuard, VPN), watch for `pthread_create failed` — a known Android 16 / KernelSU issue that masquerades as app crashes.
- **FPS and jank**: FrameX provides a non-root overlay with live FPS, CPU frequencies, and thermal telemetry via Shizuku.
- **Root-cause patterns**: The dominant code-level root causes in 2026 remain improper wakelock management, static initializers paged in during startup, and low-optimization third-party libraries (49.7% of 1,073 surveyed libraries shipped at low optimization levels).

### 5. Check Storage Space
- **Disk stats**: `adb shell dumpsys diskstats` for free space and app-level storage breakdown.
- **Dumpstate (Samsung)**: Dial `*#9900#` → "Run dumpstate/logcat" → "Copy to phone_storage" for a full system log including excess cache and battery degradation markers.
- **Dumpstate (Pixel/Motorola/other OEMs)**: Dial `*#*#7262626#*#*` to generate a bug report with the same diagnostic scope.

### 6. Run Diagnostic Scripts
- **Structured ADB testing**: Tools like DeepADB provide 204 tools across 45 modules including diagnostics, health, thermal-power, and device-farm — enabling repeatable, scripted fleet checks.
- **Trade-in evaluation mode**: On Android 16+, `adb shell tradeinmode evaluate` opens an evaluation flow where you can run your own diagnostic commands or applications. The device automatically factory-resets on reboot after evaluation.
- **OS authenticity check**: `adb shell tradeinmode getstatus --challenge CHALLENGE` verifies the device is running a trusted build before you trust its diagnostics.

### 7. Generate Report
- Include: device model, SoC, Android/ROM version, ADB connection type, battery health state, peak/average thermal readings, top wakelock holders, and any crash/ANR signatures.
- If thermal diagnostics return "Parse Failed" or "Unsupported Hardware," capture the raw sysfs thermal zone dump and open a report with the device model and SoC.
- For fleet-level reporting, organize devices by operational role and configure alerts only for meaningful exceptions — a single battery-health outlier in a pool of identical devices is more urgent than a few degrees of temperature variance.

## Anti-Patterns (2026 Updated)

### ❌ Never Do
- **Ignore thermal throttling** — it is the single largest source of unexplained FPS drops and lag. Check thermal zones before blaming the app.
- **Run diagnostics during active tasks** — thermal and performance readings are invalid while the device is under load from a concurrent test. Quiesce first, measure second.
- **Trust `dumpsys thermalservice` alone** — when the thermal HAL is not ready (`HAL Ready: false`), it returns empty output. Fall back to direct sysfs reads.
- **Skip the OS authenticity challenge** — if you are diagnosing a device of unknown provenance, an untrusted build can fabricate healthy diagnostic results. Run `tradeinmode getstatus --challenge` first.
- **Assume all Android versions expose the same diagnostics** — Trade-in mode is Android 16+ only. Older devices need `dumpsys batterystats` and `dumpstate` workarounds.
- **Treat emulator results as equivalent to physical device results** — emulators cannot faithfully reproduce thermal behavior, sensor output, or OEM-specific GPU timing. Physical device validation is mandatory for performance conclusions.

### ✅ Do Instead
- **Pull raw sysfs thermal data** as the ground truth when HAL-level tools fail.
- **Use Trade-in mode** for factory-reset devices — it reduces health assessment from minutes to seconds.
- **Check battery health state** before diagnosing performance: `overheat` and `dead` states invalidate any benchmark run.
- **Log wakelock holders** as part of every diagnostic report — improper wakelock management remains a top root cause across versions.
- **Automate fleet checks** with structured MCP tools that expose diagnostics as first-class capabilities, not one-off shell hacks.

## Reference: Diagnostic Commands (2026)

| Signal | Command | Availability |
|--------|---------|--------------|
| Device health (factory reset) | `adb shell tradeinmode getstatus` | Android 16+ |
| Battery stats | `adb shell dumpsys batterystats` | All versions |
| Thermal zones (raw) | `for z in /sys/class/thermal/thermal_zone*; do cat $z/type $z/temp; done` | All versions |
| Thermal service | `adb shell dumpsys thermalservice` | All versions (may be empty if HAL not ready) |
| Memory snapshot | `adb shell dumpsys meminfo <package>` | All versions |
| Process stats | `adb shell dumpsys procstats` | All versions |
| Connectivity | `adb shell dumpsys connectivity` | All versions |
| Disk stats | `adb shell dumpsys diskstats` | All versions |
| Full system dump (Samsung) | Dial `*#9900#` → Run dumpstate | Samsung |
| Full system dump (Pixel/Moto) | Dial `*#*#7262626#*#*` | Pixel, Motorola, most OEMs |
| OS authenticity | `adb shell tradeinmode getstatus --challenge <token>` | Android 16+ |
| Evaluation mode | `adb shell tradeinmode evaluate` | Android 16+ |

---

*Last updated: August 2026. Android 16's Trade-in mode and on-device diagnostics APIs are evolving rapidly — review Android developer release notes quarterly. For fleet-scale deployment, pair this skill with `references/fleet-health-2026.md` for centralized monitoring patterns.*
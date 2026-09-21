---
name: provision-device
description:
  Provision a new device for the phone farm. Sets up OS, installs required apps, configures network, and registers with
  the fleet, incorporating Android 16+ provisioning APIs, RKP attestation, zero-touch enrollment, and 2026 fleet-registration patterns.
license: Apache-2.0
compatibility: Requires phonefarm.device.* MCP tools
metadata:
  author: phonefarm-team
  version: 2.0.0
  updated: 2026-08-15
allowed-tools: Bash(python:*) Read
tags: [device, provisioning, setup, 2026-trends]
---

# Provision Device (2026 Edition)

## Core Philosophy

**Attest before you provision.** In 2026, Android 16's hardware-backed security stack means a device that fails Remote Key Provisioning (RKP) attestation will fail platform integrity checks downstream — no amount of fingerprint spoofing will compensate. Verify OS authenticity first, then provision.

**Trade-in mode is the new zero-state.** Android 16 introduced `tradeinmode`, which lets you connect to a factory-reset device via ADB, bypass the setup wizard, and read device health — cycle count, battery health, part status (original vs. replaced), and IMEI — in a single command. For device farm onboarding, this replaces manual setup-wizard navigation entirely.

**Fingerprint coherence beats randomization.** Modern anti-fraud systems analyze device fingerprint consistency across hundreds of signals. Randomizing individual identifiers without keeping them coherent (IMEI matching device model matching carrier matching locale) flags the device faster than using no spoofing at all.

## Procedure

### 1. Verify Device Connectivity and Attestation (ADB/USB)

- **ADB reachability**: `adb devices -l` — confirm device is authorized and online.
- **RKP support check (Android 15+ / most devices shipped 2025+)**:
  ```bash
  adb shell cmd remote_provisioning dump
  ```
  Output should include `default: hwVersion=[INTEGER] rpcAuthorName=[DEVICE MAKER]`. If RKP is not supported, flag the device for exclusion from the fleet — it will fail platform integrity checks.
- **Remote key provisioning certification**:
  ```bash
  adb shell cmd remote_provisioning certify default
  ```
  Verify that the root certificate matches the Android Key Attestation CA. Mismatched certificates indicate a device that has not received the updated RKP root — clear old certificates by temporarily setting the clock forward a few weeks, then re-run certification.
- **Trade-in mode status (Android 16+, factory-reset devices only)**:
  ```bash
  adb shell tradeinmode getstatus
  ```
  Preconditions: device must be factory reset, no cellular service, no connected account, and running a debuggable build. Returns IMEI, serial, brand, model, battery health state, cycle count, part status, and storage lifespan.

### 2. Install/Verify OS Version

- **API level check**: `adb shell getprop ro.build.version.sdk` — confirm the device meets the fleet's minimum API level.
- **OS authenticity challenge (Android 16+)**:
  ```bash
  adb shell tradeinmode getstatus --challenge CHALLENGE
  ```
  Verifies the device is running a trusted build before you trust its diagnostics. Never skip this for devices of unknown provenance.
- **Advanced Protection Mode awareness**: Android 16 introduced Advanced Protection Mode, which blocks ADB sideloading entirely when enabled. If the device was previously configured with Advanced Protection, ADB provisioning will fail silently. Disable it via the device UI before provisioning.

### 3. Install Required Apps (TikTok, Instagram, etc.)

- **Silent installation via MDM**: For fully managed (Device Owner) or Work Profile (Profile Owner) devices, use Managed Google Play to approve and distribute apps in bulk with Silent Installation selected. Users cannot uninstall silently installed apps.
- **ADB batch installation**: For non-MDM workflows, use `adb install-multiple` or batch scripts across all connected devices. Tools like `adb-batch-manager` support parallel install, uninstall, and app-data clearing across device fleets.
- **Post-install configuration**: After install, force-stop each app once (`adb shell am force-stop <package>`) so it reads fresh device identifiers on next launch rather than caching pre-spoof values.

### 4. Configure Network (Proxy, VPN)

- **Proxy assignment policy**: Never assign the same proxy endpoint to more than 3 devices. In 2026, carrier-grade NAT (CGNAT) sharing is aggressively flagged — too many devices behind one IP triggers anti-bot countermeasures.
- **IP rotation via airplane mode**: The standard rotation technique remains placing devices in airplane mode for ~3 seconds, forcing carrier reconnection and new IP assignment. This works on both physical phones and USB 4G/5G modems managed through ModemManager.
- **Protocol selection**: SOCKS5 and OpenVPN remain standard. VLESS support is relevant in markets with deep packet inspection (China, Iran, Russia).
- **OS fingerprint at the network layer**: Some platforms fingerprint the TCP/IP stack to infer device OS. If your farm presents mobile traffic, ensure the proxy port is configured to emit Android TCP/IP characteristics — not desktop OS signatures, which trigger anti-fraud flags on major carriers.

### 5. Set Up Device Identity (Fingerprint)

**Critical 2026 rule: coherence over randomness.** Modern spoofing modules (DeviceSpoofLab-Hooks, SpoofMyDevice, AxeSpoofer) spoof device identifiers, build properties, telephony, network, locale, WebView fingerprinting surfaces, and native libc property reads. But spoofing without coherence — IMEI not matching device model, locale not matching carrier region, screen metrics not matching build fingerprint — is detected faster than no spoofing at all.

**Coherent identity generation checklist:**

| Signal | Must Match |
|--------|-----------|
| IMEI/MEID | Device model + manufacturer |
| Build fingerprint | Device model + OS version |
| Carrier/locale | Proxy exit country |
| Screen metrics | Build fingerprint's device profile |
| GAID/GSF ID | Device account state |
| MediaDrm ID | Device hardware class |

- **LSPosed module setup**: Install via Magisk/KernelSU, enable in LSPosed Manager, add target apps to scope, then randomize identifiers. Add Google Play Services to scope for GAID spoofing.
- **Per-app spoofing**: Use modules that support per-app scoping so different accounts on the same device present different identities without requiring separate hardware.
- **Force-stop after spoofing**: Always force-stop and relaunch target apps after changing identifiers. Apps cache device values on startup — a running app will not see new spoofed values until restarted.

### 6. Register with Fleet Manager

- **Zero-touch enrollment (large fleets)**: All devices running Android 9+ support zero-touch enrollment. Register devices with a zero-touch reseller, link the zero-touch account to your EMM/MDM, and devices will automatically enroll on first boot and re-enroll after factory reset.
- **QR code enrollment (medium fleets)**: For devices not purchased through a zero-touch reseller, use QR code enrollment as an alternative. Tap the welcome screen 6 times to open the QR scanner, or use `adb shell dpm set-device-owner` for development devices.
- **Self-hosted MDM**: Tools like MDMesh provide self-hosted fleet control, kiosk mode, app delivery, and signed auto-updates. Devices enroll via QR code or ADB device-owner provisioning.
- **Fleet registration metadata**: Record device serial, IMEI, RKP attestation status, assigned proxy endpoint, account bindings, and fingerprint profile ID in the fleet database. This metadata is required for downstream diagnostics and rotation tracking.

### 7. Run Health Checks

**A device that is online is not necessarily healthy.** Availability, resource health, business application health, manageability, and physical/security risk signals must all be checked.

- **Availability**: `adb devices` reachability, network connectivity, signal strength.
- **Resource health**: Battery capacity and charge status, temperature, storage space, cellular data usage. Critically low storage affects app stability and system updates.
- **Business application health**: Foreground app status, kiosk status, app running state. A device can be online and charged while its primary app has silently crashed.
- **Manageability**: SIM card status, screen lock status, management permissions intact. Removing a SIM or losing management permissions limits remote actions.
- **Thermal check**: Read raw thermal zones as ground truth:
  ```bash
  adb shell "for z in /sys/class/thermal/thermal_zone*; do echo \"\$(cat \$z/type 2>/dev/null):\$(cat \$z/temp 2>/dev/null)\"; done"
  ```
- **Scheduled automated checks**: Tools like Omnitouch's agent run scheduled health checks covering VoLTE registration, signal, and connectivity, exporting pass/fail results to Prometheus for alerts and dashboards.

## Anti-Patterns (2026 Updated)

### ❌ Never Do
- **Skip RKP attestation verification** — a device that fails hardware-backed key attestation will fail platform integrity checks regardless of fingerprint spoofing. Verify `remote_provisioning certify default` before provisioning.
- **Randomize fingerprints without coherence** — mismatched IMEI/model/carrier/locale signals are detected faster than no spoofing. Coherence is mandatory.
- **Use the same proxy for >3 devices** — CGNAT sharing limits are enforced aggressively in 2026. Exceeding this flags all devices behind that IP.
- **Provision without health check** — thermal throttling, battery degradation, and low storage will cascade into performance failures that appear to be app bugs.
- **Ignore Advanced Protection Mode** — Android 16's Advanced Protection blocks ADB sideloading entirely. A device with Advanced Protection enabled cannot be provisioned via ADB.
- **Trust a factory-reset device without authenticity challenge** — on Android 16+, run `tradeinmode getstatus --challenge` to verify the build is trusted before reading any health data.
- **Assume online = healthy** — a device with a green dashboard dot may have a crashed primary app, full storage, or a removed SIM. Check all five health dimensions.

### ✅ Do Instead
- **Use Trade-in mode for factory-reset onboarding** — `adb shell tradeinmode getstatus` returns battery health, cycle count, part status, and IMEI in seconds, skipping the setup wizard entirely.
- **Verify RKP support before fleet assignment** — devices shipped with Android 16 support only RKP (not the legacy manufacturer keys). Confirm with `remote_provisioning dump`.
- **Batch-provision via zero-touch** — for fleets of 20+ devices, zero-touch enrollment eliminates manual setup entirely and auto-re-enrolls after factory reset.
- **Configure proxy IP rotation via airplane mode** — the 3-second airplane-mode toggle forces carrier reconnection and new IP assignment, maintaining mobile IP trust properties.
- **Run scheduled health checks to Prometheus** — automated pass/fail checks for VoLTE registration, signal, connectivity, and thermal state surface fleet-wide issues before they cause account failures.
- **Force-stop apps after fingerprint changes** — apps cache device identifiers on startup; a running app will present stale values until restarted.

## Reference: Provisioning Commands (2026)

| Step | Command | Availability |
|------|---------|--------------|
| RKP support check | `adb shell cmd remote_provisioning dump` | Android 15+ |
| RKP certification | `adb shell cmd remote_provisioning certify default` | Android 15+ |
| Device health (factory reset) | `adb shell tradeinmode getstatus` | Android 16+ |
| OS authenticity challenge | `adb shell tradeinmode getstatus --challenge <token>` | Android 16+ |
| Device owner setup | `adb shell dpm set-device-owner <component>` | All versions |
| Silent app install | MDM App Repository → Silent Installation | Fully managed / Work Profile |
| ADB batch install | `adb install-multiple <apks>` | All versions |
| Thermal zones (raw) | `for z in /sys/class/thermal/thermal_zone*; do cat $z/type $z/temp; done` | All versions |
| Health check export | Omnitouch agent → `/api/android/metrics` | Omnitouch deployments |

---

*Last updated: August 2026. Android 16's RKP-only policy and Trade-in mode are the dominant provisioning shifts this year. Review Android Enterprise release notes quarterly and validate fingerprint coherence against platform detection updates monthly.*
# Security posture

**Last updated:** 2026-09-21
**Applies to:** Fleet devices running Android 14–16+ (API 34+)
**Owner:** phonefarm-team

---

## 1. RKP attestation required for fleet admission

Hardware-backed key attestation is the **first gate** in the provisioning pipeline. Devices that fail RKP attestation are rejected before any app installation, fingerprint configuration, or fleet registration occurs.

### Root certificate rotation (2026)

Google introduced a **new Android Key Attestation root certificate** in 2026. Trust stores must be updated to avoid rejecting certificates from RKP-enabled devices.

| Milestone | Date | Action required |
|-----------|------|-----------------|
| New root available | — | Download both new and legacy roots from `https://android.googleapis.com/attestation/root` |
| RKP devices begin receiving new-root certificates | **February 2026** | Add new root to trust store by **31 March 2026** |
| RKP devices exclusively use new root | **10 April 2026** | Apps that did not add the new root will reject certificates from RKP-enabled devices |

**Consequence of missing the cutover:** After 10 April 2026, any app or verification tool that has not added the new root certificate to its trust store will **reject certificates from RKP-enabled devices** — which includes most modern Android hardware.

### RKP-only policy on Android 16+

Devices shipped with Android 16 or later **support only RKP** — factory-provisioned keys are being phased out. Android 15 made RKP optional; Android 16 makes it mandatory for new devices. RKP prevents key leakage because the system does not program keys directly onto the device, and individual keys can be revoked without affecting the fleet.

### Verification commands

```bash
# Check RKP support
adb shell cmd remote_provisioning dump
# Expected: default: hwVersion=[INTEGER] rpcAuthorName=[DEVICE MAKER]

# Certify the default key
adb shell cmd remote_provisioning certify default
# Verify root certificate matches Android Key Attestation CA
```

**Best practice:** Do not query the attestation root endpoint at runtime — this introduces a security risk. Handle trust-root changes through a formal process. Use the **Attestation Verification Kotlin library**, which has the new root already integrated.

---

## 2. Intrusion Log export before any destructive remediation

Android 16's **Intrusion Logging** (part of Advanced Protection Mode) provides persistent, privacy-preserving forensic logging for investigating suspected device compromise. It was developed in partnership with Amnesty International's Security Lab and Reporters Without Borders.

### What is logged

Intrusion Logging records device and network activity on a daily basis:

| Category | Examples |
|----------|----------|
| App activity | Process starts |
| App lifecycle | Installations, updates, uninstalls |
| Network | Wi-Fi/Bluetooth start/stop, DNS lookups, IP addresses |
| File transfers | USB transfers to/from device |
| System changes | Certificate changes |
| Device state | Lock/unlock events |

Note: Network events during **Chrome Incognito** are also recorded at the system level — DNS lookups and IP connections are visible, though specific pages are not.

### Storage and encryption

- Logs are **end-to-end encrypted** by the device and stored on Google servers.
- Encryption keys are bound to the **Google Account password** and **lock screen credential** — Google itself cannot read them, and neither can malware installed on the device.
- Logs are retained for **12 months**, after which they are automatically wiped.
- Once Intrusion Logging is enabled, **logs cannot be deleted before the 12-month expiry** — even if the account is closed or the feature is turned off.

### Export procedure (mandatory before wipe)

```
Settings → Security & privacy → Advanced Protection → Intrusion Logging → Access logs
→ Select device → Download & decrypt
```

**Critical:** On-device access to trigger an export is **lost after factory reset**. If Intrusion Logging was enabled, export the encrypted bundle **before** any wipe. Downloaded logs become the responsibility of the operator — Google recommends treating them as sensitive and storing them accordingly.

### Availability

Intrusion Logging rolls out to all devices running the **Android 16 December update and newer**, initially on Pixel devices before broader OEM adoption.

---

## 3. Advanced Protection Mode awareness (Android 16+)

Android 16 introduced **Advanced Protection Mode (AAPM)** as a system-level security mode available to all compatible devices — not just Pixel users. When enabled, it locks in Android's most aggressive protections and prevents them from being weakened.

### Impact on fleet operations

| Behaviour | Implication for provisioning |
|-----------|------------------------------|
| **Sideloading disabled** | Apps can only be installed from Google Play, ADB, or pre-installed app stores. |
| **Play Protect cannot be turned off** | ADB commands to disable the malware scanner are blocked. Do not attempt to bypass this as a remediation step. |
| **USB data signalling restricted** | Some USB accessories are blocked; verify USB debugging cable compatibility. |
| **2G network connections blocked** | Devices cannot fall back to insecure 2G networks. |
| **Inactivity reboot** | Device reboots after 72 hours of lock, requiring passcode. |
| **Developer Options restrictions** | Advanced Protection may lock Developer Options, blocking USB debugging and OEM unlock. |

### Pre-provisioning checklist

Before provisioning a device with Advanced Protection Mode potentially enabled:

1. **Check Advanced Protection state** — apps targeting API 36+ can query `AdvancedProtectionManager` to detect whether sideloading is blocked at the platform level.
2. **Verify ADB access** — if Advanced Protection blocks ADB sideloading entirely on the device, standard provisioning via `adb install` will fail silently. Disable Advanced Protection via the device UI before provisioning.
3. **Confirm Play Protect status** — cannot be disabled under Advanced Protection. Account for this in remediation workflows.

**Note:** Advanced Protection can be toggled on and off in Android 16. Devices can be provisioned without it, or it can be enabled post-provisioning for high-security fleet members.

---

## 4. CVE-2026-0073 — Wireless ADB authentication bypass

**CVE-2026-0073** is a critical authentication bypass vulnerability in Android's Wireless ADB (`adbd` daemon) that allows a nearby attacker to execute code as the **shell user** with **no user interaction** — a zero-click remote code execution.

### Technical detail

- **Root cause:** Logic error in `adbd_tls_verify_cert` mishandles certificate key comparisons, allowing a malicious client certificate to impersonate a trusted ADB host.
- **Affected versions:** Android 14, 15, 16, and 16-QPR2
- **CVSS v3.1:** 8.8 (High)
- **Weakness class:** CWE-303 (Incorrect Implementation of Authentication Algorithm)
- **Exploitation conditions:** Devices with Developer Options and wireless debugging enabled, ADB reachable on TCP port 5555, and at least one previously paired RSA host key.

### Patch status

| Item | Detail |
|------|--------|
| Fixed in | Android Security Bulletin **May 2026** |
| Security patch level | **2026-05-01** and later |
| Additional mitigation | Project Mainline `adbd` module for supported devices |
| Public exploit | PoC released 12 May 2026 |

Google stated it had **no evidence of in-the-wild exploitation** at the time of the patch release.

### Pre-provisioning verification

```bash
# Check security patch level
adb shell getprop ro.build.version.security_patch
# Required: 2026-05-01 or later
```

### Defensive measures

Even on patched devices:

1. **Disable wireless ADB when not actively provisioning.** The vulnerability only exposes devices with wireless debugging enabled.
2. **Revoke unknown debugging authorisations** — inspect paired host keys and remove unrecognised entries.
3. **Restrict network exposure to ADB** — do not expose port 5555 to untrusted networks.
4. **Verify patch level before fleet admission** — devices with patch level below 2026-05-01 must be updated or excluded.
5. **Check for Mainline `adbd` module updates** as an additional remediation path for devices that cannot receive full system updates.

---

## Reference: Security posture checklist

Use this checklist for every device entering or remaining in the fleet.

| # | Check | Command / Method | Pass criteria |
|---|-------|------------------|---------------|
| 1 | RKP attestation | `adb shell cmd remote_provisioning dump` | `rpcAuthorName` present |
| 2 | RKP certification | `adb shell cmd remote_provisioning certify default` | Root matches Android Key Attestation CA |
| 3 | Trust store updated | Verify app/library trust store | New 2026 root present (if RKP device) |
| 4 | Security patch level | `adb shell getprop ro.build.version.security_patch` | ≥ 2026-05-01 |
| 5 | Wireless ADB status | Developer Options → Wireless debugging | Disabled unless actively provisioning |
| 6 | ADB host keys | Inspect `/data/misc/adb/adb_keys` | Only known hosts present |
| 7 | Advanced Protection state | `AdvancedProtectionManager` query (API 36+) | Known state; provisioning compatible |
| 8 | Intrusion Logging | Settings → Security & privacy → Advanced Protection | Enabled on high-risk devices; exported before any wipe |

---

## References

- Android Security Bulletin May 2026 — CVE-2026-0073 patch and patch level 2026-05-01
- Android Key Attestation — new root certificate and RKP-only policy for Android 16+
- Google Support — Intrusion Logging export procedure and 12-month retention
- Android Advanced Protection Mode — sideloading restrictions, USB/data signalling, and Developer Options constraints
- `references/rkp-attestation.md` — detailed RKP verification workflow
- `references/tradein-mode.md` — device health assessment for factory-reset devices
- `references/remediation-library-2026.md` — remediation workflows and escalation matrices

---

*Review quarterly against Android Security Bulletins and Project Mainline releases. RKP root cutover dates and patch-level requirements are mandatory gates — not advisory.*
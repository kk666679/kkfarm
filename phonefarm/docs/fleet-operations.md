# Fleet Operations

**Last updated:** 2026-09-21
**Applies to:** Fleet devices running Android 14–16+ (API 34+)
**Owner:** phonefarm-team
**Audience:** Fleet operators on the control host

---

## Overview

Fleet operations is the day-2 layer: everything that happens after a device has passed onboarding (`docs/onboarding.md`) and until it is decommissioned. Four operational loops run continuously:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │  Health      │───▶│  Rotation    │───▶│ Remediation  │  │
│   │  (monitor)   │    │  (proxies)   │    │  (recover)   │  │
│   └──────────────┘    └──────────────┘    └──────────────┘  │
│          │                                        │         │
│          └────────────▶ ┌──────────────┐ ◀────────┘         │
│                         │ Provisioning │                    │
│                         │ (expand)     │                    │
│                         └──────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Each loop has an entry point (script or MCP tool), a set of gates, and a defined escalation path.

---

## 1. Health — continuous monitoring

### Entry points

| Method | Command | Scope |
|--------|---------|-------|
| MCP tool | `phonefarm.fleet.check-health` | Programmatic, fleet-wide |
| CLI | `phonefarm diagnose <serial>` | Single device |
| Scheduled | `.github/workflows/fleet-health-check.yml` | Every 6 hours |

### Five-dimension check

Fleet health is not "is the device online" — it is five independent dimensions, all of which must pass:

| Dimension | Signal | Command |
|-----------|--------|---------|
| **Availability** | ADB reachability, network | `adb devices -l`, `dumpsys connectivity` |
| **Resource** | Battery, thermal, storage | `tradeinmode getstatus` (Android 16+), raw sysfs thermal zones |
| **Application** | Foreground app, kiosk state | `dumpsys activity`, MDM console |
| **Manageability** | SIM, lock state, permissions | `dumpsys telephony.registry`, MDM console |
| **Security** | ADB hosts, patch level, Play Protect | `adbd` key inspection, `getprop ro.build.version.security_patch` |

**Thermal ground truth** — always read raw sysfs zones rather than trusting `dumpsys thermalservice`:

```bash
for serial in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
  echo "== $serial =="
  adb -s "$serial" shell 'for z in /sys/class/thermal/thermal_zone*; do \
    echo "$(cat $z/type 2>/dev/null):$(cat $z/temp 2>/dev/null)"; done'
done
```

### Fleet-level abort thresholds

Aggregate signals trigger an immediate halt of any in-flight batch operation:

| Signal | Threshold | Action |
|--------|-----------|--------|
| Crash rate (updated canaries) | > 1% within 30 min | Pause rollout, investigate |
| Offline rate | > 0.5% within 1 hour | Pause provisioning, check network |
| Thermal throttling | > 5% of fleet simultaneously | Halt batch tasks, cool down |
| Battery health degradation | > 10% `overheat` or `dead` | Quarantine affected devices |

### Programmatic invocation

```python
from phonefarm.fleet.health import check_all

results = check_all(["R58M0000001", "R58M0000002", "R58M0000003"])
for serial, report in results.items():
    if report.get("status") != "healthy":
        print(f"{serial}: {report}")
```

### Scheduled monitoring

The GitHub Actions workflow (`.github/workflows/fleet-health-check.yml`) runs every 6 hours and exports pass/fail results to Prometheus. Wire it to your alerting stack:

```yaml
- name: Fleet health check
  run: |
    python -c "
    from phonefarm.fleet.health import check_all
    from phonefarm.utils.config import load_yaml
    fleet = load_yaml('configs/fleet.example.yaml')
    results = check_all(fleet['serials'])
    # export to Prometheus pushgateway
    "
```

---

## 2. Rotation — proxy and IP management

### Entry points

| Method | Command | Scope |
|--------|---------|-------|
| Script | `scripts/rotate_proxies.py <serial>...` | Manual, on-demand |
| MCP tool | `phonefarm.fleet.rotate-proxy` *(planned)* | Programmatic |

### Assignment rules

**Hard rule: never assign the same proxy endpoint to more than 3 devices.** Carrier-grade NAT (CGNAT) sharing limits are enforced aggressively in 2026 — exceeding this threshold flags all devices behind the IP.

```python
from phonefarm.fleet.proxy_pool import ProxyPool

pool = ProxyPool()
try:
    pool.assign("socks5://proxy-a.example:1080", "R58M0000001")
except RuntimeError as e:
    print(f"Endpoint at capacity: {e}")
```

### Rotation via airplane mode

The standard rotation technique forces carrier reconnection and new IP assignment without losing saved Wi-Fi credentials:

```python
from phonefarm.fleet.rotation import rotate_ip

# 3-second hold is the standard; longer delays slow fleet-wide rotation
rotate_ip("R58M0000001", hold_s=3)
```

Or via the script:

```bash
python scripts/rotate_proxies.py R58M0000001 R58M0000002 R58M0000003
```

**Cadence recommendations:**

| Workload | Rotation frequency |
|----------|-------------------|
| High-volume posting | Every 4–6 hours |
| Standard operations | Every 12 hours |
| Low-volume / monitored accounts | Daily |
| Post-detection event | Immediate |

### Protocol selection

| Protocol | Use when |
|----------|----------|
| SOCKS5 | Default — lowest overhead |
| OpenVPN | Required by proxy provider or for full-tunnel |
| VLESS | Markets with deep packet inspection (CN, IR, RU) |

**TCP/IP fingerprint** — the proxy must emit Android TCP/IP characteristics. Desktop OS signatures trigger anti-fraud flags on major carriers and platforms.

### IP rotation cadence gate

Do **not** rotate in the middle of an active posting session. Rotation invalidates the current session and may flag the account. Rotate between sessions, not during.

---

## 3. Remediation — recovery

### Entry point

| Method | Command | Scope |
|--------|---------|-------|
| MCP tool | `phonefarm.device.remediate-device` | Single device |
| CLI | `phonefarm remediate <serial>` *(planned)* | Single device |

### The ladder

Apply the **least invasive fix first**. Escalate only when the current level fails verification.

```
1. cache           ← clear app cache (data preserved via pm trim-caches)
2. restart_app     ← force-stop + relaunch
3. reboot          ← full device restart
4. reinstall       ← uninstall + reinstall (via MDM on managed devices)
5. network_reset   ← soft reset (airplane mode) or full network reset
6. factory         ← LAST RESORT — see pre-checks below
```

### Pre-flight gates per level

| Level | Gate before applying | Gate after applying |
|-------|---------------------|---------------------|
| `cache` | Confirm app is safe to trim (not mid-transaction) | Force-stop, relaunch, check logcat for FATAL |
| `restart_app` | Confirm no background sync in progress | Verify main activity reached |
| `reboot` | Confirm no active fleet-wide batch | Wait for `sys.boot_completed` |
| `reinstall` | Confirm app data is reproducible | Verify re-login + permissions |
| `network_reset` | Confirm Wi-Fi credentials are recorded | Re-verify IP assignment |
| `factory` | **Backup + Intrusion Log export + FRP ownership check** | Full re-onboarding |

### Factory reset — mandatory pre-checks

A factory reset destroys on-device diagnostic context. Before invoking:

1. **Backup verification** — all device data, account bindings, and configuration profiles reproducible.
2. **Intrusion Log export** — if Intrusion Logging was enabled, export the encrypted bundle **before** wiping. On-device access to trigger an export is lost after reset.
3. **FRP ownership** — confirm the reset is authorised by the device owner. On Android 16, unconfirmed resets are flagged as suspicious and may restrict the device until ownership verification.
4. **Trade-in mode status** — validate the device is worth re-provisioning before committing to the full reset-reenrollment cycle:
   ```bash
   adb -s <serial> shell tradeinmode getstatus
   ```

### Post-reset automation

For fleets, use **HID automation** (`phonefarm/device/hid.py`) to complete setup-wizard steps remotely — Wi-Fi, account, enrollment — without physical intervention.

### Escalation

| Condition | Action |
|-----------|--------|
| Ladder exhausted, device still failing | Replace device physically |
| Confirmed commercial spyware compromise | **Do not remediate in place** — replace, preserve for forensics |
| Repeated failure of same level across fleet | Halt remediation, investigate root cause |

### Never

- Factory reset without backup or Intrusion Log export
- Attempt in-place remediation of confirmed spyware
- Disable system security services (blocked under Advanced Protection on Android 16+)
- Remote-wipe without confirming FRP ownership

---

## 4. Provisioning — fleet expansion

### Entry points

| Method | Command | Scope |
|--------|---------|-------|
| Script | `scripts/bootstrap_fleet.sh <serial>` | Single device, guided |
| MCP tool | `phonefarm.device.provision-device` | Programmatic |
| CLI | `phonefarm provision <serial>` | Single device |

### Bulk provisioning

For fleets of 20+ devices, use **zero-touch enrollment**:

```bash
python scripts/enroll_zero_touch.py
# → https://enterprise.google.com/android/enroll?account=<ZERO_TOUCH_ACCOUNT>
```

Zero-touch eliminates manual setup entirely and auto-re-enrolls after factory reset. Requires devices purchased through a zero-touch reseller.

For smaller fleets, QR code enrollment or `adb shell dpm set-device-owner` for development devices.

### RKP sweep — fleet-wide attestation

Run before admitting any batch of devices:

```bash
scripts/rkp_certify_all.sh
```

The script iterates over all connected devices:

```bash
for serial in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
  echo "== $serial =="
  adb -s "$serial" shell cmd remote_provisioning certify default || true
done
```

**Gate:** any device that fails RKP is excluded. Do not proceed to app installation.

### Pre-flight checklist

Before provisioning each device:

| Check | Command | Pass criteria |
|-------|---------|---------------|
| ADB reachable | `adb devices -l` | `device` state |
| API level | `getprop ro.build.version.sdk` | ≥ 34 |
| Security patch | `getprop ro.build.version.security_patch` | ≥ 2026-05-01 |
| Advanced Protection | Device UI | Known state; ADB not blocked |
| RKP support | `cmd remote_provisioning dump` | `rpcAuthorName` present |

See `docs/onboarding.md` for the full pipeline.

---

## Quick reference — day-2 command sheet

```bash
# Health — all devices
python -c "from phonefarm.fleet.health import check_all; \
  import subprocess; \
  serials=[l.split()[0] for l in subprocess.run(['adb','devices'],capture_output=True,text=True).stdout.splitlines()[1:] if l.strip()]; \
  print(check_all(serials))"

# Rotation — batch
python scripts/rotate_proxies.py $(adb devices | awk 'NR>1 && $2=="device"{print $1}')

# RKP sweep
scripts/rkp_certify_all.sh

# Provision one
scripts/bootstrap_fleet.sh R58M0000001

# Diagnose one
phonefarm diagnose R58M0000001

# Remediate one — start at cache
python -c "from phonefarm.device.remediate import remediate_device; \
  print(remediate_device('R58M0000001', issue='app_crash', level='cache'))"
```

---

## Operational cadence

| Task | Frequency | Owner |
|------|-----------|-------|
| Health check | Every 6 hours (automated) | CI workflow |
| IP rotation | Every 4–12 hours (per workload) | Operator |
| RKP sweep | Weekly, and before every new batch | Operator |
| Security patch audit | Monthly | Operator |
| Fleet capacity review | Monthly | Owner |
| Full fleet diagnostic | Quarterly | Operator |
| Intrusion Log review | Quarterly (or post-incident) | Security |

---

## Escalation matrix

| Severity | Trigger | Response |
|----------|---------|----------|
| **Sev-1** | Fleet-wide outage, RKP failures across batch, confirmed compromise | Halt all operations, page owner, preserve evidence |
| **Sev-2** | Single device unrecoverable, proxy pool exhausted, patch level below threshold | Remediate or replace; alert operator |
| **Sev-3** | Individual app crash, single endpoint saturated, thermal warning | Queue for next cycle |
| **Sev-4** | Cosmetic / logging issue | Backlog |

---

## References

- `docs/onboarding.md` — device onboarding pipeline
- `docs/security-posture.md` — RKP, Intrusion Logging, Advanced Protection, CVE-2026-0073
- `docs/mcp-tools.md` — full tool catalog
- `skills/remediate-device.md` — remediation ladder
- `skills/diagnose-device.md` — five-dimension health check
- `references/fleet-health-2026.md` — fleet-level monitoring patterns
- `references/remediation-library-2026.md` — reusable workflows and escalation
- `references/rkp-attestation.md` — RKP verification workflow
- `references/tradein-mode.md` — device health assessment for factory-reset devices

---

*Review monthly. Rotation cadence and abort thresholds are workload-dependent — recalibrate against your own engagement velocity and detection telemetry, not generic benchmarks.*
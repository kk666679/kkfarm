# RKP Attestation — 2026

**Last updated:** 2026-09-21
**Version:** 2.0.0
**Supersedes:** v1.0 (2026-08-15)
**Audience:** Fleet operators, provisioning engineers, security architects

---

## Core Philosophy

**Attest before you provision.** In 2026, hardware-backed attestation is not a verification step — it is the **first hard gate** in the provisioning pipeline. A device that fails Remote Key Provisioning (RKP) attestation is rejected before any app installation, fingerprint configuration, or fleet registration occurs. There is no partial onboarding.

**RKP is not optional on modern hardware.** Devices shipped with Android 16 or later support **only RKP** — the system does not fall back to factory-provisioned keys. This policy phases out factory keys and expands on the Android 15 policy, where RKP support was optional. A device that cannot complete RKP cannot be trusted at any later stage.

**The root certificate has changed.** Google transitioned the root certificate used in Android hardware key attestation chains. The **April 10, 2026 cutover has passed** — any attestation verification system that did not add the new root before that date now rejects certificates from RKP-enabled devices, which includes most modern Android hardware.

**Keys can be revoked individually.** RKP prevents key leakage because the system does not program keys directly onto the device. If a key needs to be revoked, the revocation can be scoped to a single device — not the entire fleet.

---

## What RKP Is

RKP (Remote Key Provisioning) is Google's mechanism for managing hardware attestation keys without programming them directly into the device at the factory. It was introduced in Android 12 and made mandatory in Android 13.

### How it works

| Step | Actor | Action |
|------|-------|--------|
| 1 | Device | Generates a unique static key pair in secure hardware |
| 2 | OEM (factory) | Extracts the **public** portion and uploads it to Google servers as the trust foundation |
| 3 | Device (runtime) | Sends a Certificate Signing Request (CSR) to the Google RKP backend |
| 4 | Google backend | Verifies the request, signs the public key, and returns the certificate chain |
| 5 | Device | Uses the provisioned certificate for attestation |

The private key **never leaves the secure environment** where it was generated.

### Why RKP replaced factory keys

| Factory-provisioned keys (legacy) | RKP (current) |
|-----------------------------------|---------------|
| Keys programmed at factory | Keys generated on-device |
| Cannot be rotated | Supports key rotation |
| Revocation affects entire batch | Revocation scoped to individual device |
| Private key may exist outside device | Private key never leaves secure hardware |
| No longer supported on Android 16+ devices | Mandatory on Android 16+ devices |

### The RemoteProvisioner app

The `RemoteProvisioner` platform application drives the RKP process between device and server. It registers a periodic job using WorkManager, scheduled to run **once every ~24 hours**, to check the status of the attestation key pool and determine if further provisioning is needed.

---

## The 2026 Root Certificate Change

Google introduced a **new Android Key Attestation root certificate** using an **ECDSA P-384 key**. The new root replaced the old root for all RKP-enabled devices on **10 April 2026**.

### Timeline

| Date | Event |
|------|-------|
| **January 2026** | New root certificate made available; apps should add it to trust stores |
| **February 2026** | RKP devices begin receiving certificates rooted in the new certificate |
| **31 March 2026** | Deadline to add new root to trust stores |
| **10 April 2026** | RKP-enabled devices **exclusively** use the new root |
| **Post-April 2026** | Trust stores without the new root reject certificates from RKP-enabled devices |

### Who is affected

Any system that validates Android key attestation certificates must update its trust store to include the new root:

- EMM platforms performing device integrity checks via attestation
- Zero-trust access solutions using hardware-backed key attestation
- Solutions that verify device attestation as part of compliance
- Identity providers using Device Trust signals alongside attestation

### What did NOT change

- The certificate extension schema is unchanged — only the root certificate changed
- Both the human-readable and machine-readable forms of the new root are publicly available
- Older devices with factory-provisioned keys that do not support key rotation will continue using the previous root **indefinitely**

### Download both roots

Both the old and new root certificates are published at:

```
https://android.googleapis.com/attestation/root
```

Download **both** certificates. Trust stores must retain both roots because older factory-keyed devices will continue chaining to the old root.

---

## Verification Commands

### Check RKP support

```bash
adb shell cmd remote_provisioning dump
```

Expected output should include:

```
default: hwVersion=[INTEGER] rpcAuthorName=[DEVICE MAKER]
```

- `hwVersion` — implementation version of the remotely provisioned component hardware
- `rpcAuthorName` — name of the author of the `IRemotelyProvisionedComponent` implementation (organization name, not individual)

**2026 note:** Most devices sold from 2025 onward support RKP. If `rpcAuthorName` is absent, the device does not support RKP and should be excluded from the fleet.

### Certify the default key

```bash
adb shell cmd remote_provisioning certify default
```

The output is an **X.509 certificate chain in PEM format**. The **last certificate is the root certificate** — verify it matches the Android Key Attestation CA.

**Expected new root certificate (post-April 2026):**

```
-----BEGIN CERTIFICATE-----
MIICIjCCAaigAwIBAgIRAISp0Cl7DrWK5/8OgN52BgUwCgYIKoZIzj0EAwMwUjEcMBoGA1UEAwwTS2V5
IEF0dGVzdGF0aW9uIENBMTEQMA4GA1UECwwHQW5kcm9pZDETMBEGA1UECgwKR29vZ2xlIExMQzELMAkG
A1UEBhMCVVMwHhcNMjUwNzE3MjIzMjE4WhcNMzUwNzE1MjIzMjE4WjBSMRwwGgYDVQQDDBNLZXkgQXR0
ZXN0YXRpb24gQ0ExMRAwDgYDVQQLDAdBbmRyb2lkMRMwEQYDVQQKDApHb29nbGUgTExDMQswCQYDVQQG
EwJVUzB2MBAGByqGSM49AgEGBSuBBAAiA2IABCPaI3FO3z5bBQo8cuiEas4HjqCtG/mLFfRT0MsIssPB
EEU5Cfbt6sH5yOAxqEi5QagpU1yX4HwnGb7OtBYpDTB57uH5Eczm34A5FNijV3s0/f0UPl7zbJcTx6xw
qMIRq6NCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYEFFIyuyz7RkOb
3NaBqQ5lZuA0QepAMAoGCCqGSM49BAMDA2gAMGUCMETfjPO/HwqReR2CS7p0ZWoD/LHs6hDi422opifH
EUaYLxwGlT9SLdjkVpz0UUOR5wIxAIoGyxGKRHVTpqpGRFiJtQEOOTp/+s1GcxeYuR2zh/80lQyu9vAF
Cj6E4AXc+osmRg==
-----END CERTIFICATE-----
```

Source: 

### Certify the StrongBox key (if present)

```bash
adb shell cmd remote_provisioning certify strongbox
```

Devices with a discrete secure element may support StrongBox-attested keys in addition to the default TEE-backed keys. Certify both if available.

### Force certificate rotation for testing

If a device is still chaining to the old root and you need to test the new root path:

1. Set the device clock forward a few weeks temporarily (clears old certificates)
2. Or factory reset the device to clear all previously-provisioned certificates
3. Re-run `adb shell cmd remote_provisioning certify default`

**Warning:** Clock manipulation can affect other time-sensitive operations. Factory reset destroys on-device diagnostic context — export Intrusion Logs first (see `docs/security-posture.md`).

### Register a test device for new-root certificates

To proactively test compatibility with the new root:

1. Download the test device registration tool: `google_root_register.py`
2. Run: `python3 google_root_register.py`
3. Factory reset the device (required to clear previously-provisioned certificates)
4. Verify: `adb shell cmd remote_provisioning certify default`

Source: 

---

## Certificate Revocation

Attestation keys can be revoked for various reasons, including accidental compromise or suspected extraction by an attacker. The status of **every certificate in the attestation chain** must be checked against the official Certificate Revocation List (CRL).

### Revocation status list

Google maintains and publishes the CRL at:

```
https://android.googleapis.com/attestation/status
```

The HTTP response's `Cache-Control` header determines how often to check for updates — you do not need to make a network request for every certificate you verify.

### Status values

| Status | Meaning |
|--------|---------|
| `REVOKED` | Permanent removal — certificate no longer valid |
| `SUSPENDED` | Temporary suspension — certificate may become valid again |
| (no entry) | Certificate is valid |

Source: 

### Revocation reasons

Common revocation reasons include:

- `KEY_COMPROMISE` — private key compromise detected
- `SUPERSEDED` — key replaced by a newer key
- `CESSATION_OF_OPERATION` — device decommissioned

Source: 

---

## Attestation Verification Library

Google provides the **Android Key Attestation Verifier** — a Kotlin library for verifying Android key attestation certificate chains.

### Why use the library

The library already has the **new root certificate integrated**. If you are using a different verification tool, migrate to the Kotlin library — it is well-tested and covers edge cases that custom verifiers tend to miss.

### Basic usage

```kotlin
// Create a verifier with trust anchors, revocation info, and time source
val verifier = Verifier(
    trustAnchors = listOf(newRootCert, oldRootCert),
    revocationList = fetchedCRL,
    timeSource = System::currentTimeMillis
)

// Verify an attestation certificate chain
val result = verifier.verify(certificateChain)
```

Source: 

### Repository

```
https://github.com/android/keyattestation
```

Source: 

---

## Fleet Integration

### Provisioning gate

In the phonefarm provisioning pipeline (`skills/provision-device.md`, stage 1), RKP attestation is the **first hard gate**:

```python
from phonefarm.device.rkp import check_rkp_support, certify

def provision_device(serial: str) -> dict:
    rkp = check_rkp_support(serial)
    if not rkp.get("supported"):
        raise ProvisionError(f"device {serial} fails RKP attestation")
    
    cert = certify(serial)
    if not cert.get("ok"):
        raise ProvisionError(f"device {serial} failed RKP certification")
    
    # Proceed to app installation, network config, identity setup...
```

### Fleet-wide RKP sweep

Before admitting any batch of devices, run the RKP sweep:

```bash
scripts/rkp_certify_all.sh
```

```bash
for serial in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
  echo "== $serial =="
  adb -s "$serial" shell cmd remote_provisioning certify default || true
done
```

Any device that fails RKP is **excluded**. Do not proceed to app installation for that device.

### Health check integration

The `phonefarm.fleet.check-health` MCP tool includes RKP status as part of the **security posture** dimension:

| Signal | Pass criteria | Fail action |
|--------|---------------|-------------|
| RKP support | `rpcAuthorName` present in dump | Exclude from fleet |
| RKP certification | Root matches Android Key Attestation CA (new root) | Re-run certify; if still failing, exclude |
| Trust store | New 2026 root present | Update trust store before proceeding |

---

## Anti-Patterns

### ❌ Never Do

- **Query the attestation root endpoint at runtime** — this introduces a security risk. Handle trust-root changes through a formal process, not dynamic fetching.
- **Use a trust store that only contains the old root** — after 10 April 2026, RKP-enabled devices will fail validation.
- **Assume all devices support RKP** — devices with factory-provisioned keys may still chain to the old root. Check `rpcAuthorName` presence.
- **Skip the CRL check** — a revoked certificate chain is invalid even if the root matches. Always check each certificate's status.
- **Trust a device that fails RKP because "it works anyway"** — a device that cannot complete hardware-backed attestation cannot be trusted for any security-sensitive operation.
- **Factory reset a device without exporting Intrusion Logs first** — the on-device access to trigger an export is lost after reset.

### ✅ Do Instead

- **Add both the new and old root certificates** to your trust store — older factory-keyed devices continue chaining to the old root.
- **Use the Android Key Attestation Verifier Kotlin library** — it has the new root already integrated and handles edge cases.
- **Check `rpcAuthorName` presence** as the RKP support gate — absence means the device does not support RKP.
- **Verify the last certificate in the `certify default` output** — this is the root certificate; it must match the expected new root.
- **Register test devices with the Google RKP backend** to validate the new-root path before fleet-wide rollout.
- **Run the RKP sweep before every new batch** — `scripts/rkp_certify_all.sh` catches failures early.

---

## Reference: RKP Commands and URLs

| Item | Value |
|------|-------|
| Check RKP support | `adb shell cmd remote_provisioning dump` |
| Certify default key | `adb shell cmd remote_provisioning certify default` |
| Certify StrongBox key | `adb shell cmd remote_provisioning certify strongbox` |
| Root certificate URL | `https://android.googleapis.com/attestation/root` |
| Revocation status list (CRL) | `https://android.googleapis.com/attestation/status` |
| Expected root prefix | `MIICIjCCAaigAwIBAgIRAISp0Cl7DrWK5/8OgN52BgU` |
| Attestation verifier library | `https://github.com/android/keyattestation` |
| Test device registration | `google_root_register.py` (from Google) |

---

## References

- `skills/provision-device.md` — provisioning pipeline with RKP gate
- `skills/diagnose-device.md` — five-dimension health check
- `references/tradein-mode.md` — Android 16+ device health API
- `references/fleet-health-2026.md` — fleet-level monitoring patterns
- `docs/security-posture.md` — RKP, Intrusion Logging, Advanced Protection, CVE-2026-0073
- `docs/onboarding.md` — device onboarding pipeline
- `docs/fleet-operations.md` — operational loops and cadence

**External sources:** Android Developers — Verifying hardware-backed key pairs with Key Attestation (2026), Google Key Attestation Verifier (GitHub), Jason Bayton Android Enterprise FAQ (April 2026), RemoteProvisioner AOSP Documentation, Android Key Attestation CRL (Google)

---

*Last updated: September 2026. Review quarterly against Android Security Bulletins and Google RKP release notes. The root certificate cutover date has passed — verify that every attestation verification system in your fleet has added the new root before April 10, 2026. Devices shipped with Android 16 support only RKP; there is no fallback.*
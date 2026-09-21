# `references/platforms.md` — Platform Reference for Account Creation

**Location:** `.autoclaw/skills/account/create-account/references/platforms.md` **Version:** 2.0.0 **Last updated:**
2026-09-11 **Applies to:** `create-account`, `warmup-account`, `health-check-account`, `link-platforms`,
`setup-shopee-store`, `setup-shopify-store`, `setup-n8n`, `setup-zeppy`

---

## Purpose

Authoritative platform rules for provisioning accounts across 10 platforms. The `create-account` skill reads this file
before any account creation. Deviations must be approved through the manager control plane.

**Hard rule:** Daily caps are _per device_, not per account pool.

---

## 1. Platform Matrix

| Platform      | Category     | Max / Device / Day | Email        | Phone        | Google       | Warmup | Verification             |
| ------------- | ------------ | ------------------ | ------------ | ------------ | ------------ | ------ | ------------------------ |
| **TikTok**    | Social       | 3                  | Recommended  | **Required** | No           | 3–5 d  | Phone OTP                |
| **Instagram** | Social       | 2                  | **Required** | **Required** | No           | 5–7 d  | Email + Phone OTP        |
| **YouTube**   | Social       | 1                  | **Required** | Optional     | **Required** | 7–14 d | Email + Google           |
| **LinkedIn**  | Professional | 1                  | **Required** | Optional     | No           | 14+ d  | Email (+ 2FA)            |
| **Threads**   | Social       | 3                  | **Required** | No           | No           | 2–4 d  | Email / Instagram        |
| **Facebook**  | Social       | 1                  | **Required** | Optional     | No           | 7–14 d | Email (+ Phone 2FA)      |
| **Shopee**    | E-commerce   | 1                  | **Required** | **Required** | No           | 3–7 d  | Email + Phone + KYC      |
| **Shopify**   | E-commerce   | 1                  | **Required** | No           | No           | 5–10 d | Email + Payment + Domain |
| **n8n**       | Automation   | N/A                | **Required** | No           | No           | 0–1 d  | Email (self-managed)     |
| **Zeppy**     | Automation   | N/A                | **Required** | No           | No           | 0–1 d  | Email (self-managed)     |

**Categories:**

- **Social** — algorithmic trust scoring, strict caps
- **Professional** — career-oriented, high-trust requirement
- **E-commerce** — merchant/buyer, KYC required
- **Automation** — self-hosted, no platform caps

---

## 2. Social Platforms

### 2.1 TikTok

```yaml
platform: tiktok
category: social
max_accounts_per_device_per_day: 3
verification:
  email: recommended
  phone: required
  otp_method: sms
profile_required: [username, bio, avatar, display_name]
warmup:
  duration_days: 3-5
  activity_level: low
  daily_actions:
    scroll_feed: 15-30 min
    like: 5-10
    follow: 3-5
    no_post: true
    no_comment: true
rate_limits:
  account_creation_gap_minutes: 30
  otp_retries: 3
  otp_timeout_minutes: 5
anti_patterns:
  - same_ip_for_multiple_accounts
  - same_phone_for_multiple_accounts
  - rapid_creation
  - immediate_high_activity
```

### 2.2 Instagram

```yaml
platform: instagram
category: social
max_accounts_per_device_per_day: 2
verification:
  email: required
  phone: required
  otp_method: email + sms
profile_required: [username, bio, avatar, external_link, display_name]
warmup:
  duration_days: 5-7
  activity_level: low
  daily_actions:
    scroll_feed: 20-40 min
    like: 10-20
    follow: 5-10
    story_view: 5-10
    no_post: true
    no_reel: true
    no_comment: true
rate_limits:
  account_creation_gap_minutes: 45
  otp_retries: 3
  otp_timeout_minutes: 10
anti_patterns:
  - same_email_alias_pattern
  - reused_phone_numbers
  - immediate_dm_activity
  - aggressive_following_during_warmup
meta_wide_fingerprint: true
```

### 2.3 YouTube

```yaml
platform: youtube
category: social
max_accounts_per_device_per_day: 1
verification:
  email: required
  google_account: required
  phone: optional
  otp_method: email
profile_required:
  - google_account_creation
  - channel_name
  - channel_handle
  - channel_art
  - channel_description
warmup:
  duration_days: 7-14
  activity_level: low
  daily_actions:
    watch_videos: 30-60 min
    like: 3-5
    subscribe: 2-3
    no_upload: true
    no_comment: true
    no_playlist_creation: true
rate_limits:
  account_creation_gap_minutes: 60
  google_account_rate_limit_per_ip_per_day: 3
  channel_setup_delay_hours: 24
anti_patterns:
  - mass_channel_creation
  - same_channel_name
  - reused_channel_art
  - immediate_uploads
  - commenting_during_warmup
```

### 2.4 Threads

```yaml
platform: threads
category: social
max_accounts_per_device_per_day: 3
verification:
  email: required
  instagram_link: recommended
  phone: not_required
  otp_method: email
profile_required:
  - username
  - bio
  - avatar
  - display_name
  - links_optional
warmup:
  duration_days: 2-4
  activity_level: low
  daily_actions:
    scroll_feed: 10-20 min
    like: 5-10
    follow: 3-5
    reply_after_day_2: 0-1
    no_post: true
    no_repost: true
rate_limits:
  account_creation_gap_minutes: 30
  otp_retries: 3
  otp_timeout_minutes: 5
  cross_platform_quota:
    shared_with_instagram: true
anti_patterns:
  - same_ip_for_multiple_accounts
  - linked_to_flagged_instagram_account
  - immediate_posting
  - aggressive_following_during_warmup
  - cross_platform_content_duplication_during_warmup
meta_wide_fingerprint: true
notes:
  - Threads accounts are tied to Instagram identity when linked
  - Standalone Threads accounts are less trusted by algorithm
  - Meta applies shared device fingerprint scoring across Threads + Instagram + Facebook
```

### 2.5 Facebook

```yaml
platform: facebook
category: social
max_accounts_per_device_per_day: 1
verification:
  email: required
  phone: optional
  phone_required_for:
    - 2fa
    - business_pages
  otp_method: email + sms_if_2fa
profile_required:
  - full_name
  - profile_photo
  - cover_photo
  - bio
  - location
  - education_or_work
warmup:
  duration_days: 7-14
  activity_level: very_low
  daily_actions:
    scroll_feed: 15-30 min
    like: 3-5
    follow_pages: 2-3
    friend_requests: 1-2
    no_post: true
    no_comment: true
    no_group_join: true
    no_marketplace: true
rate_limits:
  account_creation_gap_minutes: 120
  friend_requests_daily_limit_post_warmup: 20
  group_posts_daily_limit_post_warmup: 5
  marketplace_listings_limit_post_warmup: 5
anti_patterns:
  - fake_name (violates real-name policy)
  - reused_profile_photo
  - immediate_business_page_creation
  - bulk_friend_requests
  - joining_many_groups_early
  - immediate_marketplace_activity
meta_wide_fingerprint: true
notes:
  - Facebook enforces real-name policy strictly
  - New accounts have strict posting restrictions for first 14 days
  - Business page creation requires verified identity
  - Facebook shares device fingerprint scoring with Instagram and Threads
```

---

## 3. Professional Platforms

### 3.1 LinkedIn

```yaml
platform: linkedin
category: professional
max_accounts_per_device_per_day: 1
verification:
  email: required
  phone: optional
  phone_required_for: 2fa
  otp_method: email
profile_required:
  - full_name
  - professional_headline
  - professional_photo
  - work_experience
  - education
  - skills_min_3
  - location
warmup:
  duration_days: 14+
  activity_level: very_low
  daily_actions:
    scroll_feed: 15-30 min
    like: 2-5
    connect_requests_known_only: 1-3
    no_post: true
    no_message: true
    no_comment: true
rate_limits:
  account_creation_gap_minutes: 120
  connect_requests_daily_limit: 20
  profile_view_limit_per_day: 100
anti_patterns:
  - same_company_name_for_multiple_profiles
  - reused_headline_text
  - generic_photo
  - immediate_outreach
  - bulk_connection_requests
  - duplicate_endorsements
```

---

## 4. E-commerce Platforms

### 4.1 Shopee

```yaml
platform: shopee
category: ecommerce
max_accounts_per_device_per_day: 1
verification:
  email: required
  phone: required
  otp_method: sms
  kyc: required_for_seller
profile_required_buyer:
  - username
  - email
  - phone
  - address
profile_required_seller:
  - shop_name
  - bank_account
  - business_documents
warmup:
  duration_days: 3-7
  activity_level: low
  daily_actions:
    browse_categories: 10-20 min
    view_products: 10-20
    add_to_cart: 1-2
    wishlist: 2-3
    no_purchase_first_3_days: true
    no_review: true
    no_seller_activity: true
rate_limits:
  account_creation_gap_minutes: 60
  otp_retries: 3
  otp_timeout_minutes: 5
  seller_verification_delay_hours: 24
  bank_verification_delay_days: 1-3
anti_patterns:
  - same_address_for_multiple_accounts
  - same_bank_account
  - same_phone
  - immediate_seller_activity
  - bulk_listing_during_warmup
  - fake_reviews
  - price_manipulation
notes:
  - Shopee enforces regional KYC (SG, MY, ID, TH, PH, VN, TW, BR)
  - Seller accounts require business registration in most regions
  - Buyer and seller accounts share device fingerprint scoring
  - Seller onboarding requires bank account verification
```

### 4.2 Shopify

```yaml
platform: shopify
category: ecommerce
max_accounts_per_device_per_day: 1
verification:
  email: required
  phone: recommended
  otp_method: email
  payment: required_for_store_activation
  domain: required_for_public_store
profile_required:
  - store_name
  - email
  - business_info
  - address
  - payment_method
  - domain
  - business_type
warmup:
  duration_days: 5-10
  activity_level: low
  daily_actions:
    configure_store: days_1_3
    add_products: days_3_5_5_to_20
    theme_setup: days_3_5
    payment_setup: days_4_6
    no_public_launch: until_day_7
    no_paid_ads: until_day_10
rate_limits:
  account_creation_gap_minutes: 120
  trial_period_days: 3
  domain_verification_delay_hours: 24
  payment_verification_delay_hours: 24
anti_patterns:
  - same_domain_for_multiple_stores
  - same_payment_method_across_stores
  - reused_business_info
  - immediate_paid_ads
  - duplicate_product_listings
  - dropshipping_without_disclosure
notes:
  - Shopify is a paid platform (trial then subscription)
  - Store name must be globally unique
  - Payment verification mandatory before store goes live
  - Shopify Payments requires business verification
  - Device fingerprint scoring is per-account (not Meta-wide)
  - Multiple stores per device discouraged
```

---

## 5. Automation Platforms

### 5.1 n8n

```yaml
platform: n8n
category: automation
max_accounts_per_device_per_day: N/A
verification:
  email: required
  phone: not_required
  otp_method: email
  sso: optional
profile_required:
  - username
  - email
  - password_min_8_chars
  - role
  - workspace
warmup:
  duration_days: 0-1
  actions:
    first_login_setup: immediate
    create_first_workflow: day_1
    configure_credentials: day_1
rate_limits:
  account_creation_gap_minutes: 0
  api_rate_limit_default_per_minute: 60
  workflow_executions_per_minute: configurable
security:
  environment_variables_only: true
  two_factor_required: true
  default_encryption_key_prohibited: true
  registration_after_setup: manual_approval
  backup_encryption_key_required: true
anti_patterns:
  - hardcoded_credentials_in_workflows
  - shared_owner_account
  - workflows_without_error_handling
  - storing_secrets_in_plain_text
  - using_default_encryption_key
notes:
  - n8n is self-hosted (no platform caps)
  - Each instance should have isolated credentials
  - Use environment variables for secrets, not workflow nodes
  - Enable 2FA for all user accounts
  - Restrict registration after initial setup
  - Backup N8N_ENCRYPTION_KEY securely
  - Consider OAuth 2.0/SAML for enterprise
  - Integrate with .autoclaw via webhook nodes
```

### 5.2 Zeppy

```yaml
platform: zeppy
category: automation
max_accounts_per_device_per_day: N/A
verification:
  email: required
  phone: not_required
  otp_method: email
  sso: optional
profile_required:
  - username
  - email
  - api_key
  - workspace
warmup:
  duration_days: 0-1
  actions:
    first_login_setup: immediate
    api_key_generation: day_1
    first_agent_registration: day_1
    connect_to_autoclaw: day_1
rate_limits:
  account_creation_gap_minutes: 0
  api_rate_limit: configurable
  agent_registrations_per_hour: configurable
security:
  api_key_rotation_days: 90
  hmac_required: true
  audit_logging_required: true
  otel_instrumentation_required: true
anti_patterns:
  - shared_api_keys
  - api_keys_committed_to_git
  - no_rotation_policy
  - missing_audit_logging
  - unauthenticated_webhooks
notes:
  - Zeppy is self-hosted (no platform caps)
  - API keys must be rotated every 90 days
  - All webhook endpoints require HMAC signature verification
  - Integrate with .autoclaw fabric via MCP or REST
  - Register each Zeppy agent with .autoclaw fabric registry
  - Emit OpenTelemetry traces for all workflow executions
  - Federate via MCP as an external workflow engine
```

---

## 6. Category-Level Rules

### 6.1 Social

| Rule                          | Value                                                   |
| ----------------------------- | ------------------------------------------------------- |
| Meta-wide fingerprint scoring | Instagram + Threads + Facebook share device fingerprint |
| Minimum age for monetization  | 30 days                                                 |
| Minimum age for paid features | 7 days                                                  |
| Warmup posting restriction    | No posts for first 3–7 days                             |
| Cross-platform phone reuse    | Triggers lower trust                                    |

### 6.2 Professional

| Rule                                | Value      |
| ----------------------------------- | ---------- |
| Profile completeness for outreach   | 100%       |
| Connect request limit (post-warmup) | 20/day     |
| Message limit (post-warmup)         | 50/day     |
| Profile view limit                  | 100/day    |
| Content posting during warmup       | 1/week max |

### 6.3 E-commerce

| Rule                      | Value                                 |
| ------------------------- | ------------------------------------- |
| KYC required              | Yes (both platforms)                  |
| Payment verification      | Mandatory                             |
| Buyer/seller separation   | Shopee: buyer first, seller after KYC |
| Domain requirement        | Shopify: required for public store    |
| Cross-account fingerprint | Shopee: shared; Shopify: per-account  |

### 6.4 Automation

| Rule                        | Value                      |
| --------------------------- | -------------------------- |
| Self-hosted                 | Yes                        |
| Platform caps               | None                       |
| Credential isolation        | Required per instance      |
| Secret storage              | Environment variables only |
| API key rotation            | 90 days                    |
| Audit logging               | Required                   |
| OTel instrumentation        | Required                   |
| Federation with `.autoclaw` | Required                   |

---

## 7. Rate Limits — Quick Reference

| Platform  | Min Gap | Daily Cap | Setup Delay | Category     |
| --------- | ------- | --------- | ----------- | ------------ |
| TikTok    | 30 min  | 3         | —           | social       |
| Instagram | 45 min  | 2         | —           | social       |
| YouTube   | 60 min  | 1         | 24 h        | social       |
| LinkedIn  | 120 min | 1         | —           | professional |
| Threads   | 30 min  | 3         | —           | social       |
| Facebook  | 120 min | 1         | —           | social       |
| Shopee    | 60 min  | 1         | 24 h        | ecommerce    |
| Shopify   | 120 min | 1         | 24 h        | ecommerce    |
| n8n       | 0       | —         | —           | automation   |
| Zeppy     | 0       | —         | —           | automation   |

**Meta platforms:** Instagram, Threads, Facebook share device fingerprint scoring.

---

## 8. Anti-Pattern Detection Matrix

| Anti-Pattern               | Detection                        | Action              |
| -------------------------- | -------------------------------- | ------------------- |
| Same phone across accounts | Phone hash                       | Block               |
| Same email alias           | Normalize `user+N@` → `user@`    | Block               |
| Same IP cluster            | IP subnet /24                    | Rotate proxy        |
| Same fingerprint           | Canvas/WebGL/timezone hash       | Re-provision        |
| Same username pattern      | Levenshtein > 0.8                | Force unique        |
| Same avatar                | Perceptual hash                  | Force unique        |
| Rapid creation             | Time < gap                       | Delay               |
| Immediate high activity    | Spike in warmup                  | Reject + quarantine |
| **Meta cross-platform**    | Fingerprint shared IG/Threads/FB | Block + rotate      |
| **KYC reuse**              | Document hash across ecommerce   | Block + flag        |
| **Store name collision**   | Shopify uniqueness               | Force new name      |
| **API key reuse**          | Automation key hash              | Force rotation      |
| **Default credentials**    | Known defaults check             | Force rotation      |
| **Missing 2FA**            | Automation user without 2FA      | Require 2FA         |

---

## 9. Verification Requirements

| Platform  | Email    | Phone    | Google   | KYC      | Payment  | Domain   | SSO  |
| --------- | -------- | -------- | -------- | -------- | -------- | -------- | ---- |
| TikTok    | rec.     | **req.** | —        | —        | —        | —        | —    |
| Instagram | **req.** | **req.** | —        | —        | —        | —        | —    |
| YouTube   | **req.** | opt.     | **req.** | —        | —        | —        | —    |
| LinkedIn  | **req.** | opt.     | —        | —        | —        | —        | —    |
| Threads   | **req.** | —        | —        | —        | —        | —        | —    |
| Facebook  | **req.** | opt.     | —        | —        | —        | —        | —    |
| Shopee    | **req.** | **req.** | —        | **req.** | —        | —        | —    |
| Shopify   | **req.** | rec.     | —        | —        | **req.** | **req.** | —    |
| n8n       | **req.** | —        | —        | —        | —        | —        | opt. |
| Zeppy     | **req.** | —        | —        | —        | —        | —        | opt. |

---

## 10. Pre-Creation Checklist

```yaml
device:
  - device_online: true
  - device_health: healthy
  - device_fingerprint_unique_for_category: true
platform_capacity:
  - daily_cap_not_reached: true
  - min_gap_since_last_creation: true
verification_readiness:
  tiktok: [phone_sms_capable]
  instagram: [email_available, phone_sms_capable]
  youtube: [google_account_ready, email_available]
  linkedin: [email_available, professional_data_ready]
  threads: [email_available]
  facebook: [email_available, phone_for_2fa]
  shopee: [email_available, phone_sms_capable, kyc_documents_ready]
  shopify: [email_available, payment_method_ready, domain_ready]
  n8n: [email_available, strong_password_ready]
  zeppy: [email_available, api_key_rotation_policy_set]
anti_patterns:
  - no_reused_phone: true
  - no_reused_email_alias: true
  - no_reused_username: true
  - no_reused_avatar: true
  - no_same_ip_cluster: true
meta_specific:
  - no_shared_fingerprint_ig_threads_fb: true
ecommerce_specific:
  - no_reused_kyc_documents: true
  - no_reused_bank_account: true
automation_specific:
  - no_default_credentials: true
  - two_factor_enabled: true
  - api_key_rotation_set: true
```

---

## 11. Post-Creation Checklist

```yaml
verification:
  - email_verified: true
  - phone_verified: true (if required)
  - kyc_verified: true (if applicable)
  - payment_verified: true (if applicable)
profile:
  - username_set: true
  - bio_set: true
  - avatar_set: true
  - platform_specific_fields_set: true
warmup:
  - schedule_registered: true
  - initial_activity_level: low
  - no_post_flag: true
audit:
  - audit_entry_created: true
  - fingerprint_recorded: true
  - verification_methods_logged: true
federation:
  - fabric_registered: true (automation only)
  - mcp_enabled: true (automation only)
  - otel_endpoint_set: true (automation only)
```

---

## 12. Enforcement

Rules are enforced by:

| Layer       | File                                                     | Responsibility                    |
| ----------- | -------------------------------------------------------- | --------------------------------- |
| Skill       | `.autoclaw/skills/account/create-account/SKILL.md`       | Read rules, execute procedure     |
| Service     | `phonefarm/services/auto_scheduler.py`                   | Enforce rate limits, gaps, caps   |
| Service     | `phonefarm/services/account_manager.py`                  | Track counters, detect duplicates |
| Skill       | `.autoclaw/skills/account/health-check-account/SKILL.md` | Validate anti-patterns            |
| Evidence    | `.autoclaw/evidence/chain/hash-chain.js`                 | Immutable audit trail             |
| Diagnostics | `.autoclaw/diagnostics/`                                 | Compliance failure detection      |
| Manager     | `.autoclaw/manager/`                                     | Approval for deviations           |

---

**End of Platform Reference v2.0.0**

Maintained by: `phonefarm-team` Review cycle: quarterly Change log: tracked in `CHANGELOG.md`

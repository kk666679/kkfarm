// ─────────────────────────────────────────────────────────────────────────────
//  Analytics Seed Generators
//
//  Deterministic, reproducible seed data for:
//    • Alerts                 (seedAlerts)
//    • Cost records + summary (seedCost)
//    • Telemetry samples      (seedTelemetry)
//    • Recommendations        (seedRecommendations)
//    • Compliance checks      (seedCompliance)
//
//  Every generator uses a seeded PRNG so running `prisma db seed` twice on
//  a clean DB produces byte-identical rows. That keeps CI snapshots stable
//  and lets you diff seed runs across branches.
// ─────────────────────────────────────────────────────────────────────────────

import type { PrismaClient } from '../../src/generated/prisma/client'

// ═════════════════════════════════════════════════════════════════════════════
//  Seeded PRNG — mulberry32
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Creates a deterministic pseudo-random number generator.
 * Same seed → same sequence → same seed data every time.
 */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return function rand(): number {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Turn a tenant id into a stable 32-bit integer seed. */
function seedFromString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

type Rand = () => number

/** Pick a random element from an array. */
function pick<T>(rand: Rand, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!
}

/** Integer in [min, max] inclusive. */
function int(rand: Rand, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

/** Float rounded to `decimals`. */
function float(rand: Rand, min: number, max: number, decimals = 2): number {
  const v = rand() * (max - min) + min
  return Number(v.toFixed(decimals))
}

/** UTC date N days ago at a random hour. */
function daysAgo(rand: Rand, days: number, hourJitter = true): Date {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  if (hourJitter) d.setUTCHours(int(rand, 0, 23), int(rand, 0, 59), 0, 0)
  else d.setUTCHours(0, 0, 0, 0)
  return d
}

// ═════════════════════════════════════════════════════════════════════════════
//  ALERTS
// ═════════════════════════════════════════════════════════════════════════════

const ALERT_TEMPLATES = [
  { title: 'Device went offline',              severity: 'WARNING',  source: 'device-monitor',   msg: 'No ADB heartbeat received for over 5 minutes.' },
  { title: 'CPU saturation detected',          severity: 'WARNING',  source: 'telemetry',        msg: 'Sustained CPU usage above 92% for 10 minutes.' },
  { title: 'Memory pressure critical',         severity: 'CRITICAL', source: 'telemetry',        msg: 'Available memory dropped below 200 MB.' },
  { title: 'Storage almost full',              severity: 'WARNING',  source: 'telemetry',        msg: 'Internal storage usage above 90%.' },
  { title: 'Battery temperature high',         severity: 'CRITICAL', source: 'telemetry',        msg: 'Battery temperature exceeded 45°C.' },
  { title: 'App install failed',               severity: 'WARNING',  source: 'application',      msg: 'APK installation returned non-zero exit code.' },
  { title: 'Workflow execution failed',        severity: 'CRITICAL', source: 'workflow-engine',  msg: 'Step timed out after 3 retry attempts.' },
  { title: 'Workload terminated unexpectedly', severity: 'CRITICAL', source: 'workload-runner',  msg: 'Runner process exited with signal SIGKILL.' },
  { title: 'Provisioning failed',              severity: 'WARNING',  source: 'provisioning',     msg: 'Provider refused container allocation.' },
  { title: 'Rate limit exceeded',              severity: 'INFO',     source: 'api-gateway',      msg: 'Client exceeded 100 req/min threshold.' },
  { title: 'Compliance check failed',          severity: 'CRITICAL', source: 'security',         msg: 'Device does not meet encryption policy.' },
  { title: 'Cost budget threshold',            severity: 'WARNING',  source: 'cost-tracker',     msg: 'Period-to-date spend exceeded 80% of budget.' },
  { title: 'Unauthorized API access attempt',  severity: 'CRITICAL', source: 'security',         msg: 'Request rejected due to missing permission.' },
  { title: 'Database replication lag',         severity: 'WARNING',  source: 'infra',            msg: 'Replica lag exceeded 30 seconds.' },
  { title: 'Certificate expiring soon',        severity: 'INFO',     source: 'security',         msg: 'Pinned certificate expires in 14 days.' },
] as const

const ALERT_DEVICE_STATUSES = ['ONLINE', 'OFFLINE', 'BUSY', 'ERROR', 'DEGRADED'] as const

/**
 * Creates `count` alerts spread across the last 30 days.
 * About 55% are resolved, 20% acknowledged, 25% open.
 */
export async function seedAlerts(
  prisma: PrismaClient,
  tenantId: string,
  count = 25,
): Promise<number> {
  const rand = mulberry32(seedFromString(`alerts:${tenantId}`))

  const devices = await prisma.device.findMany({
    where: { tenantId },
    select: { id: true },
  })
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true },
  })
  const deviceIds = devices.map((device: { id: string }) => device.id)
  const userIds = users.map((user: { id: string }) => user.id)

  if (devices.length === 0 && users.length === 0) return 0

  const rows = Array.from({ length: count }).map((_, i) => {
    const tpl = pick(rand, ALERT_TEMPLATES)
    const createdAt = daysAgo(rand, int(rand, 0, 30))

    // Status distribution
    const roll = rand()
    let status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
    if (roll < 0.25) status = 'OPEN'
    else if (roll < 0.45) status = 'ACKNOWLEDGED'
    else status = 'RESOLVED'

    const acknowledgedAt =
      status === 'OPEN'
        ? null
        : new Date(createdAt.getTime() + int(rand, 60_000, 3_600_000))
    const resolvedAt =
      status === 'RESOLVED' && acknowledgedAt
        ? new Date(acknowledgedAt.getTime() + int(rand, 60_000, 7_200_000))
        : null

    const deviceId =
      deviceIds.length > 0 && rand() < 0.7
        ? pick(rand, deviceIds)
        : null

    // Dedupe key: one open alert per (source, title, deviceId)
    const dedupeKey = status === 'OPEN' && deviceId
      ? `${tpl.source}:${tpl.title}:${deviceId}`
      : null

    return {
      tenantId,
      deviceId,
      userId: userIds.length > 0 && rand() < 0.4 ? pick(rand, userIds) : null,
      severity: tpl.severity,
      status,
      title: tpl.title,
      message: tpl.msg,
      source: tpl.source,
      dedupeKey,
      acknowledgedAt,
      resolvedAt,
      resolvedById:
        resolvedAt && userIds.length > 0 ? pick(rand, userIds) : null,
      createdAt,
    }
  })

  // Deduplicate open alerts by dedupeKey before insert
  const seen = new Set<string>()
  const deduped = rows.filter((r) => {
    if (!r.dedupeKey) return true
    if (seen.has(r.dedupeKey)) return false
    seen.add(r.dedupeKey)
    return true
  })

  await prisma.alert.createMany({ data: deduped })
  return deduped.length
}

// ═════════════════════════════════════════════════════════════════════════════
//  COST
// ═════════════════════════════════════════════════════════════════════════════

const COST_CATEGORIES = ['COMPUTE', 'STORAGE', 'NETWORK', 'AUTOMATION', 'OTHER'] as const
type CostCategoryKey = typeof COST_CATEGORIES[number]

const CATEGORY_WEIGHTS: Record<CostCategoryKey, number> = {
  COMPUTE:    0.55,
  STORAGE:    0.15,
  NETWORK:    0.12,
  AUTOMATION: 0.13,
  OTHER:      0.05,
}

const CATEGORY_UNITS: Record<CostCategoryKey, { unit: string; perUnitCents: number }> = {
  COMPUTE:    { unit: 'device-minute', perUnitCents: 3 },
  STORAGE:    { unit: 'GB-hour',       perUnitCents: 1 },
  NETWORK:    { unit: 'GB',            perUnitCents: 12 },
  AUTOMATION: { unit: 'run',           perUnitCents: 4 },
  OTHER:      { unit: 'unit',          perUnitCents: 1 },
}

/**
 * Generates `days` of per-device cost records plus one aggregated
 * CostSummary row for the whole period.
 */
export async function seedCost(
  prisma: PrismaClient,
  tenantId: string,
  days = 90,
): Promise<{ records: number; summaries: number }> {
  const rand = mulberry32(seedFromString(`cost:${tenantId}`))

  const devices = await prisma.device.findMany({
    where: { tenantId },
    select: { id: true, regionCode: true },
  })
  if (devices.length === 0) {
    // No devices — still emit a summary with zero spend so dashboards render.
    await prisma.costSummary.create({
      data: {
        tenantId,
        periodStart: daysAgo(rand, days, false),
        periodEnd: new Date(),
        totalCents: 0,
        byCategory: {},
        byRegion: {},
        costPerDevice: 0,
        changePercent: 0,
        exceeded: false,
      },
    })
    return { records: 0, summaries: 1 }
  }

  const rows: Array<Parameters<typeof prisma.costRecord.create>[0]['data']> = []
  const byCategory: Record<string, number> = {}
  const byRegion: Record<string, number> = {}

  for (let d = days - 1; d >= 0; d--) {
    // Weekend spend is ~40% lower — realistic pattern
    const isWeekend = daysAgo(rand, d, false).getUTCDay() % 6 === 0
    const dayFactor = isWeekend ? 0.6 : 1.0

    for (const device of devices) {
      // Not every device is billed every day — ~15% idle
      if (rand() < 0.15) continue

      // Each device has 1–3 cost lines per day
      const lineCount = int(rand, 1, 3)
      for (let i = 0; i < lineCount; i++) {
        const category = pick(rand, COST_CATEGORIES)
        const weight = CATEGORY_WEIGHTS[category]
        const meta = CATEGORY_UNITS[category]

        const quantity = float(rand, 60, 1440) * weight * dayFactor
        const amountCents = Math.max(
          1,
          Math.round(quantity * meta.perUnitCents * float(rand, 0.85, 1.15, 3)),
        )

        const periodStart = daysAgo(rand, d, false)
        const periodEnd = new Date(periodStart)
        periodEnd.setUTCHours(23, 59, 59, 999)

        rows.push({
          tenantId,
          deviceId: device.id,
          category,
          amountCents,
          currency: 'USD',
          quantity: Number(quantity.toFixed(2)),
          unit: meta.unit,
          description: `${category.toLowerCase()} usage`,
          periodStart,
          periodEnd,
          createdAt: periodEnd,
        })

        byCategory[category] = (byCategory[category] ?? 0) + amountCents
        const region = device.regionCode ?? 'unknown'
        byRegion[region] = (byRegion[region] ?? 0) + amountCents
      }
    }
  }

  // Chunked inserts — SQLite/Postgres parameter limits
  const CHUNK = 500
  for (let i = 0; i < rows.length; i += CHUNK) {
    await prisma.costRecord.createMany({ data: rows.slice(i, i + CHUNK) })
  }

  const totalCents = Object.values(byCategory).reduce((a, b) => a + b, 0)
  const periodStart = daysAgo(rand, days, false)
  const periodEnd = new Date()

  // Prior-period comparison for changePercent
  const priorTotal = Math.round(totalCents * float(rand, 0.75, 1.1, 3))
  const changePercent = priorTotal === 0
    ? 0
    : Number((((totalCents - priorTotal) / priorTotal) * 100).toFixed(2))

  const budgetCents = Math.round(totalCents * float(rand, 1.05, 1.4, 3))

  await prisma.costSummary.create({
    data: {
      tenantId,
      periodStart,
      periodEnd,
      totalCents,
      currency: 'USD',
      byCategory,
      byRegion,
      costPerDevice: Number((totalCents / 100 / devices.length).toFixed(2)),
      changePercent,
      exceeded: totalCents > budgetCents,
      budgetCents,
    },
  })

  return { records: rows.length, summaries: 1 }
}

// ═════════════════════════════════════════════════════════════════════════════
//  TELEMETRY
// ═════════════════════════════════════════════════════════════════════════════

const TELEMETRY_SERIES: Array<{
  metric: 'CPU_PERCENT' | 'MEMORY_PERCENT' | 'STORAGE_PERCENT' | 'BATTERY_PERCENT' | 'NETWORK_RX_BYTES' | 'NETWORK_TX_BYTES' | 'TEMPERATURE_C' | 'BATTERY_TEMPERATURE_C' | 'UPTIME_SECONDS'
  unit: string
  base: number
  jitter: number
  decimals: number
}> = [
  { metric: 'CPU_PERCENT',           unit: '%',   base: 35,   jitter: 40,   decimals: 1 },
  { metric: 'MEMORY_PERCENT',        unit: '%',   base: 55,   jitter: 30,   decimals: 1 },
  { metric: 'STORAGE_PERCENT',       unit: '%',   base: 62,   jitter: 10,   decimals: 1 },
  { metric: 'BATTERY_PERCENT',       unit: '%',   base: 78,   jitter: 20,   decimals: 1 },
  { metric: 'NETWORK_RX_BYTES',      unit: 'B',   base: 2_000_000, jitter: 1_500_000, decimals: 0 },
  { metric: 'NETWORK_TX_BYTES',      unit: 'B',   base: 500_000,   jitter: 400_000,   decimals: 0 },
  { metric: 'TEMPERATURE_C',         unit: '°C',  base: 38,   jitter: 6,    decimals: 1 },
  { metric: 'BATTERY_TEMPERATURE_C', unit: '°C',  base: 32,   jitter: 5,    decimals: 1 },
  { metric: 'UPTIME_SECONDS',        unit: 's',   base: 43_200, jitter: 43_200, decimals: 0 },
]

/**
 * Generates telemetry samples for each device over the last `hours` hours.
 * Default is 24 hours at 1 sample per hour per metric.
 */
export async function seedTelemetry(
  prisma: PrismaClient,
  tenantId: string,
  hours = 24,
  samplesPerHour = 1,
): Promise<number> {
  const rand = mulberry32(seedFromString(`telemetry:${tenantId}`))

  const devices = await prisma.device.findMany({
    where: { tenantId, status: { in: ['ONLINE', 'BUSY', 'DEGRADED'] } },
    select: { id: true },
  })
  if (devices.length === 0) return 0

  const rows: Array<Parameters<typeof prisma.telemetrySample.create>[0]['data']> = []

  for (const device of devices) {
    // Each device gets a slight per-device bias so charts don't look identical
    const bias = float(rand, -0.15, 0.15, 3)

    for (let h = hours - 1; h >= 0; h--) {
      for (let s = 0; s < samplesPerHour; s++) {
        const recordedAt = new Date()
        recordedAt.setUTCHours(recordedAt.getUTCHours() - h)
        recordedAt.setUTCMinutes(Math.floor((60 / samplesPerHour) * s))
        recordedAt.setUTCSeconds(0, 0)

        for (const series of TELEMETRY_SERIES) {
          const value = Math.max(
            0,
            series.base * (1 + bias) + float(rand, -series.jitter, series.jitter),
          )
          rows.push({
            tenantId,
            deviceId: device.id,
            metric: series.metric,
            value: Number(value.toFixed(series.decimals)),
            unit: series.unit,
            recordedAt,
          })
        }
      }
    }
  }

  const CHUNK = 1000
  for (let i = 0; i < rows.length; i += CHUNK) {
    await prisma.telemetrySample.createMany({ data: rows.slice(i, i + CHUNK) })
  }
  return rows.length
}

// ═════════════════════════════════════════════════════════════════════════════
//  RECOMMENDATIONS
// ═════════════════════════════════════════════════════════════════════════════

const RECOMMENDATION_TEMPLATES = [
  { category: 'COST',        title: 'Downsize idle devices',        body: '12 devices have been idle for over 7 days. Stopping them saves ~$0.42/device-day.',            impact: 8.2,  confidence: 0.91 },
  { category: 'COST',        title: 'Switch to annual reservation', body: 'Your compute spend pattern suggests a 20% discount is available on a 12-month commit.',         impact: 6.5,  confidence: 0.78 },
  { category: 'PERFORMANCE', title: 'Enable hardware acceleration', body: 'Device group "regression" shows 40% higher frame times than peers.',                          impact: 7.1,  confidence: 0.84 },
  { category: 'PERFORMANCE', title: 'Rebalance region allocation',  body: 'ap-southeast is at 92% capacity while us-east is at 34%. Rebalance for lower latency.',        impact: 5.9,  confidence: 0.88 },
  { category: 'RELIABILITY', title: 'Increase restart backoff',     body: '3 devices restarted more than 5 times in 24h. Backoff may be too aggressive.',                 impact: 6.8,  confidence: 0.82 },
  { category: 'RELIABILITY', title: 'Add redundancy to hot group',  body: 'Group "payments" has no standby capacity. A single device failure blocks the workflow.',       impact: 9.1,  confidence: 0.75 },
  { category: 'SECURITY',    title: 'Rotate API keys',              body: '4 API keys are older than 180 days. Rotate them to reduce blast radius.',                     impact: 7.4,  confidence: 0.95 },
  { category: 'SECURITY',    title: 'Enforce certificate pinning',  body: 'Two devices are missing the pinned certificate header on outbound requests.',                 impact: 8.0,  confidence: 0.87 },
  { category: 'CAPACITY',    title: 'Reserve capacity for peak',    body: 'Predicted peak load next Tuesday exceeds current capacity by ~18%.',                          impact: 7.7,  confidence: 0.79 },
  { category: 'CAPACITY',    title: 'Consolidate underutilized groups', body: '3 groups have fewer than 2 devices each. Consolidation reduces overhead.',               impact: 4.5,  confidence: 0.83 },
] as const

/**
 * Generates `count` recommendations across all categories.
 * Distribution: 20% pending, 30% accepted, 30% dismissed, 20% applied.
 */
export async function seedRecommendations(
  prisma: PrismaClient,
  tenantId: string,
  count = 12,
): Promise<number> {
  const rand = mulberry32(seedFromString(`recs:${tenantId}`))

  const devices = await prisma.device.findMany({
    where: { tenantId },
    select: { id: true },
  })
  const deviceIds = devices.map((device: { id: string }) => device.id)

  const now = Date.now()
  const rows = Array.from({ length: count }).map(() => {
    const tpl = pick(rand, RECOMMENDATION_TEMPLATES)
    const createdAt = daysAgo(rand, int(rand, 0, 14))

    const roll = rand()
    let status: 'PENDING' | 'ACCEPTED' | 'DISMISSED' | 'APPLIED'
    if (roll < 0.20) status = 'PENDING'
    else if (roll < 0.50) status = 'ACCEPTED'
    else if (roll < 0.80) status = 'DISMISSED'
    else status = 'APPLIED'

    const acceptedAt =
      status === 'ACCEPTED' || status === 'APPLIED'
        ? new Date(createdAt.getTime() + int(rand, 60_000, 86_400_000))
        : null
    const dismissedAt =
      status === 'DISMISSED'
        ? new Date(createdAt.getTime() + int(rand, 60_000, 86_400_000))
        : null
    const appliedAt =
      status === 'APPLIED' && acceptedAt
        ? new Date(acceptedAt.getTime() + int(rand, 60_000, 172_800_000))
        : null

    return {
      tenantId,
      deviceId:
        deviceIds.length > 0 && rand() < 0.5 ? pick(rand, deviceIds) : null,
      category: tpl.category,
      status,
      title: tpl.title,
      body: tpl.body,
      impactScore: tpl.impact,
      confidence: tpl.confidence,
      acceptedAt,
      dismissedAt,
      appliedAt,
      expiresAt: new Date(now + int(rand, 7, 30) * 86_400_000),
      createdAt,
    }
  })

  await prisma.recommendation.createMany({ data: rows })
  return rows.length
}

// ═════════════════════════════════════════════════════════════════════════════
//  COMPLIANCE
// ═════════════════════════════════════════════════════════════════════════════

const COMPLIANCE_CHECKS = [
  { name: 'encryption_at_rest',      passRate: 0.95 },
  { name: 'certificate_pinning',     passRate: 0.82 },
  { name: 'root_policy',             passRate: 0.98 },
  { name: 'os_patch_level',          passRate: 0.71 },
  { name: 'network_isolation',       passRate: 0.88 },
  { name: 'secure_boot',             passRate: 0.93 },
  { name: 'adb_auth_required',       passRate: 0.99 },
  { name: 'screen_lock_policy',      passRate: 0.76 },
] as const

/**
 * Runs every compliance check against every device once.
 * Uses the `passRate` per check to decide PASS / FAIL / WARN.
 */
export async function seedCompliance(
  prisma: PrismaClient,
  tenantId: string,
): Promise<number> {
  const rand = mulberry32(seedFromString(`compliance:${tenantId}`))

  const devices = await prisma.device.findMany({
    where: { tenantId },
    select: { id: true },
  })
  if (devices.length === 0) return 0

  const rows: Array<Parameters<typeof prisma.complianceCheck.create>[0]['data']> = []

  for (const device of devices) {
    for (const check of COMPLIANCE_CHECKS) {
      const roll = rand()
      let result: 'PASS' | 'FAIL' | 'WARN'
      if (roll < check.passRate) result = 'PASS'
      else if (roll < check.passRate + 0.06) result = 'WARN'
      else result = 'FAIL'

      rows.push({
        tenantId,
        deviceId: device.id,
        checkName: check.name,
        result,
        details: {
          policy: `policy:${check.name}`,
          observed: result === 'PASS' ? 'compliant' : 'non-compliant',
          checkedBy: 'seed-generator',
        },
        checkedAt: daysAgo(rand, int(rand, 0, 7)),
      })
    }
  }

  const CHUNK = 500
  for (let i = 0; i < rows.length; i += CHUNK) {
    await prisma.complianceCheck.createMany({ data: rows.slice(i, i + CHUNK) })
  }
  return rows.length
}

// ═════════════════════════════════════════════════════════════════════════════
//  AGGREGATE RUNNER
// ═════════════════════════════════════════════════════════════════════════════

export interface AnalyticsSeedResult {
  alerts: number
  costRecords: number
  costSummaries: number
  telemetry: number
  recommendations: number
  compliance: number
}

/**
 * Runs every analytics generator in dependency order.
 * Devices must already exist — call this after seeding devices.
 */
export async function seedAnalytics(
  prisma: PrismaClient,
  tenantId: string,
  options: {
    alerts?: number
    costDays?: number
    telemetryHours?: number
    recommendations?: number
  } = {},
): Promise<AnalyticsSeedResult> {
  const alerts = await seedAlerts(prisma, tenantId, options.alerts ?? 25)
  const cost = await seedCost(prisma, tenantId, options.costDays ?? 90)
  const telemetry = await seedTelemetry(prisma, tenantId, options.telemetryHours ?? 24)
  const recommendations = await seedRecommendations(
    prisma,
    tenantId,
    options.recommendations ?? 12,
  )
  const compliance = await seedCompliance(prisma, tenantId)

  return {
    alerts,
    costRecords: cost.records,
    costSummaries: cost.summaries,
    telemetry,
    recommendations,
    compliance,
  }
}
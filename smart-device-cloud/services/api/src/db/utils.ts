import { getPostgresPool } from './postgres';
import { getRedisClient, REDIS_KEYS, setCache, getCache } from './redis';
import { queryAll, queryOne, execute } from './postgres';

/**
 * Database utilities and helpers
 */

/**
 * Set tenant context for RLS policies
 */
export async function setTenantContext(tenantId: string): Promise<void> {
  const pool = getPostgresPool();
  const client = await pool.connect();
  try {
    await client.query(`SELECT set_config('app.current_tenant_id', $1::text, false)`, [tenantId]);
  } finally {
    client.release();
  }
}

/**
 * Get total row count for a table
 */
export async function getTableRowCount(table: string): Promise<number> {
  const result = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM ${table}`);
  return parseInt(result?.count || '0', 10);
}

/**
 * Check if a device exists
 */
export async function deviceExists(deviceId: string): Promise<boolean> {
  const result = await queryOne('SELECT id FROM devices WHERE id = $1 LIMIT 1', [deviceId]);
  return !!result;
}

/**
 * Get device by serial number
 */
export async function getDeviceBySerial(tenantId: string, serial: string) {
  return queryOne('SELECT * FROM devices WHERE tenant_id = $1 AND serial = $2', [tenantId, serial]);
}

/**
 * Get all devices for a tenant
 */
export async function getTenantDevices(tenantId: string, status?: string) {
  const query = status
    ? 'SELECT * FROM devices WHERE tenant_id = $1 AND status = $2 ORDER BY created_at DESC'
    : 'SELECT * FROM devices WHERE tenant_id = $1 ORDER BY created_at DESC';

  const params = status ? [tenantId, status] : [tenantId];
  return queryAll(query, params);
}

/**
 * Get user by email
 */
export async function getUserByEmail(tenantId: string, email: string) {
  return queryOne('SELECT * FROM users WHERE tenant_id = $1 AND email = $2', [tenantId, email]);
}

/**
 * Get recent telemetry for a device
 */
export async function getRecentTelemetry(
  tenantId: string,
  deviceId: string,
  hoursBack: number = 24
) {
  return queryAll(
    `SELECT * FROM device_telemetry 
     WHERE tenant_id = $1 AND device_id = $2 
     AND timestamp > NOW() - INTERVAL $3
     ORDER BY timestamp DESC`,
    [tenantId, deviceId, `${hoursBack} hours`]
  );
}

/**
 * Get telemetry aggregates from continuous views
 */
export async function getTelemetryAggregates(
  tenantId: string,
  deviceId: string,
  granularity: '5min' | '1hour' = '5min',
  hoursBack: number = 24
) {
  const table = granularity === '5min' ? 'device_telemetry_5min' : 'device_telemetry_1hour';
  return queryAll(
    `SELECT * FROM ${table}
     WHERE tenant_id = $1 AND device_id = $2
     AND time_bucket > NOW() - INTERVAL '${hoursBack} hours'
     ORDER BY time_bucket DESC`,
    [tenantId, deviceId]
  );
}

/**
 * Get active alerts for a device
 */
export async function getDeviceAlerts(tenantId: string, deviceId: string) {
  return queryAll(
    `SELECT * FROM alerts 
     WHERE tenant_id = $1 AND device_id = $2 AND status = 'active'
     ORDER BY created_at DESC`,
    [tenantId, deviceId]
  );
}

/**
 * Create an alert
 */
export async function createAlert(
  tenantId: string,
  alert: {
    deviceId?: string;
    deviceName?: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    description: string;
    recommendedAction: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { deviceId, deviceName, severity, description, recommendedAction, metadata } = alert;
  return queryOne(
    `INSERT INTO alerts (tenant_id, device_id, device_name, severity, description, recommended_action, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      tenantId,
      deviceId || null,
      deviceName || null,
      severity,
      description,
      recommendedAction,
      JSON.stringify(metadata || {}),
    ]
  );
}

/**
 * Cache device state for quick access
 */
export async function cacheDeviceState(
  tenantId: string,
  deviceId: string,
  state: Record<string, unknown>
): Promise<void> {
  const cacheKey = REDIS_KEYS.DEVICE_STATE(`${tenantId}:${deviceId}`);
  await setCache(cacheKey, state, 3600); // 1 hour TTL
}

/**
 * Get cached device state
 */
export async function getCachedDeviceState(tenantId: string, deviceId: string) {
  const cacheKey = REDIS_KEYS.DEVICE_STATE(`${tenantId}:${deviceId}`);
  return getCache(cacheKey);
}

/**
 * Buffer telemetry data in Redis before batch insertion
 */
export async function bufferTelemetry(
  tenantId: string,
  deviceId: string,
  telemetry: Record<string, unknown>
): Promise<void> {
  const client = getRedisClient();
  const key = REDIS_KEYS.TELEMETRY_BUFFER(`${tenantId}:${deviceId}`);

  const entry = {
    ...telemetry,
    timestamp: new Date().toISOString(),
  };

  await client.rPush(key, JSON.stringify(entry));

  // Keep buffer to reasonable size
  await client.lTrim(key, -1000, -1);

  // Set TTL
  await client.expire(key, 86400); // 24 hours
}

/**
 * Flush telemetry buffer to database
 */
export async function flushTelemetryBuffer(tenantId: string, deviceId: string): Promise<void> {
  const client = getRedisClient();
  const key = REDIS_KEYS.TELEMETRY_BUFFER(`${tenantId}:${deviceId}`);

  const items = await client.lRange(key, 0, -1);
  if (items.length === 0) return;

  const telemetryData = items.map((item: string) => JSON.parse(item));

  // Batch insert
  for (const data of telemetryData) {
    await execute(
      `INSERT INTO device_telemetry (tenant_id, device_id, timestamp, cpu, memory, storage, battery, temperature, network_latency, packet_loss)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        tenantId,
        deviceId,
        data.timestamp,
        data.cpu,
        data.memory,
        data.storage,
        data.battery,
        data.temperature,
        data.network_latency,
        data.packet_loss,
      ]
    );
  }

  // Clear buffer
  await client.del(key);
}

/**
 * Get audit log entries
 */
export async function getAuditLog(
  tenantId: string,
  options?: {
    operatorId?: string;
    action?: string;
    targetType?: string;
    limit?: number;
    offset?: number;
  }
) {
  let query = 'SELECT * FROM audit_log WHERE tenant_id = $1';
  const params: unknown[] = [tenantId];

  if (options?.operatorId) {
    query += ` AND operator_id = $${params.length + 1}`;
    params.push(options.operatorId);
  }

  if (options?.action) {
    query += ` AND action = $${params.length + 1}`;
    params.push(options.action);
  }

  if (options?.targetType) {
    query += ` AND target_type = $${params.length + 1}`;
    params.push(options.targetType);
  }

  query += ' ORDER BY created_at DESC';

  if (options?.limit) {
    query += ` LIMIT $${params.length + 1}`;
    params.push(options.limit);
  }

  if (options?.offset) {
    query += ` OFFSET $${params.length + 1}`;
    params.push(options.offset);
  }

  return queryAll(query, params);
}

/**
 * Log an audit event
 */
export async function logAuditEvent(
  tenantId: string,
  event: {
    operatorId: string;
    operatorRole: string;
    action: string;
    targetType: string;
    targetId?: string;
    description: string;
    parameters?: Record<string, unknown>;
  }
) {
  const { operatorId, operatorRole, action, targetType, targetId, description, parameters } = event;

  return execute(
    `INSERT INTO audit_log (tenant_id, operator_id, operator_role, action, target_type, target_id, description, parameters)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      tenantId,
      operatorId,
      operatorRole,
      action,
      targetType,
      targetId || null,
      description,
      JSON.stringify(parameters || {}),
    ]
  );
}

/**
 * Health check - verify database connectivity
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const pool = getPostgresPool();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      return !!result.rows[0];
    } finally {
      client.release();
    }
  } catch {
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  return {
    devices: await getTableRowCount('devices'),
    telemetry: await getTableRowCount('device_telemetry'),
    workloads: await getTableRowCount('workloads'),
    workflows: await getTableRowCount('workflows'),
    applications: await getTableRowCount('applications'),
    alerts: await getTableRowCount('alerts'),
    users: await getTableRowCount('users'),
    auditLogs: await getTableRowCount('audit_log'),
  };
}

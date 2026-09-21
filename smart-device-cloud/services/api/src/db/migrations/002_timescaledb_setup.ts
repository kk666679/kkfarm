export async function up(knex: any): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS timescaledb');

  try {
    await knex.raw(`
      SELECT create_hypertable('device_telemetry', 'timestamp',
        if_not_exists => TRUE
      )
    `);
    console.log('Created device_telemetry hypertable');
  } catch (error) {
    console.log(
      'device_telemetry table already exists as hypertable or hypertable creation deferred'
    );
  }

  try {
    await knex.raw(`
      SELECT set_chunk_time_interval('device_telemetry', INTERVAL '1 day')
    `);
    console.log('Set device_telemetry chunk interval');
  } catch (error) {
    console.log('Could not set chunk interval (may already be set)');
  }

  try {
    await knex.raw(`
      ALTER TABLE device_telemetry SET (
        timescaledb.compress,
        timescaledb.compress_segmentby = 'tenant_id, device_id',
        timescaledb.compress_orderby = 'timestamp DESC'
      )
    `);
    console.log('Enabled compression on device_telemetry');
  } catch (error) {
    console.log('Compression configuration already applied');
  }

  try {
    await knex.raw(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS device_telemetry_5min AS
      SELECT
        tenant_id,
        device_id,
        time_bucket('5 minutes', timestamp) AS time_bucket,
        AVG(cpu) AS avg_cpu,
        AVG(memory) AS avg_memory,
        AVG(battery) AS avg_battery,
        AVG(temperature) AS avg_temperature,
        AVG(network_latency) AS avg_latency,
        MAX(packet_loss) AS max_packet_loss
      FROM device_telemetry
      GROUP BY tenant_id, device_id, time_bucket
      WITH DATA
    `);
    console.log('Created 5-minute continuous aggregate');
  } catch (error) {
    console.log('5-minute aggregate already exists');
  }

  try {
    await knex.raw(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS device_telemetry_1hour AS
      SELECT
        tenant_id,
        device_id,
        time_bucket('1 hour', timestamp) AS time_bucket,
        AVG(cpu) AS avg_cpu,
        AVG(memory) AS avg_memory,
        AVG(battery) AS avg_battery,
        AVG(temperature) AS avg_temperature,
        AVG(network_latency) AS avg_latency,
        MAX(packet_loss) AS max_packet_loss
      FROM device_telemetry
      GROUP BY tenant_id, device_id, time_bucket
      WITH DATA
    `);
    console.log('Created 1-hour continuous aggregate');
  } catch (error) {
    console.log('1-hour aggregate already exists');
  }

  try {
    await knex.raw(
      `CREATE INDEX idx_device_telemetry_5min_tenant_device ON device_telemetry_5min (tenant_id, device_id, time_bucket DESC)`
    );
  } catch {
    console.log('Index may already exist');
  }

  try {
    await knex.raw(
      `CREATE INDEX idx_device_telemetry_1hour_tenant_device ON device_telemetry_1hour (tenant_id, device_id, time_bucket DESC)`
    );
  } catch {
    console.log('Index may already exist');
  }
}

export async function down(knex: any): Promise<void> {
  await knex.raw('DROP MATERIALIZED VIEW IF EXISTS device_telemetry_1hour CASCADE');
  await knex.raw('DROP MATERIALIZED VIEW IF EXISTS device_telemetry_5min CASCADE');

  try {
    await knex.raw(`
      ALTER TABLE device_telemetry SET (
        timescaledb.compress = false
      )
    `);
  } catch {
    console.log('Table may not be compressed');
  }
}

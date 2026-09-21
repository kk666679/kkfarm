import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

export async function seed(knex: any): Promise<void> {
  // Check if we already have a default tenant
  const existingTenant = await knex('tenants').where('slug', 'default').first();

  if (!existingTenant) {
    // Create default tenant
    const tenantId = randomUUID();
    await knex('tenants').insert({
      id: tenantId,
      name: 'Default Tenant',
      slug: 'default',
      description: 'Default development tenant',
      metadata: {
        type: 'development',
      },
      is_active: true,
    });

    console.log('✓ Created default tenant');

    // Create default admin user
    const adminUserId = randomUUID();
    const passwordHash = await bcrypt.hash('admin123', 10);

    await knex('users').insert({
      id: adminUserId,
      tenant_id: tenantId,
      email: 'admin@device-farm.local',
      name: 'Administrator',
      password_hash: passwordHash,
      role: 'admin',
      permissions: ['*'],
      is_active: true,
    });

    console.log('✓ Created admin user (email: admin@device-farm.local, password: admin123)');

    // Create sample devices for testing
    const deviceIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const deviceId = randomUUID();
      deviceIds.push(deviceId);

      await knex('devices').insert({
        id: deviceId,
        tenant_id: tenantId,
        serial: `DEVICE_${String(i + 1).padStart(3, '0')}`,
        name: `Test Device ${i + 1}`,
        provider: 'local',
        android_version: '14.0',
        api_level: 34,
        status: 'online',
        adb_host: 'localhost',
        adb_port: 5037 + i,
        metadata: {
          brand: 'Samsung',
          model: 'Galaxy S24',
          cpu_cores: 8,
          ram_gb: 8,
        },
      });
    }

    console.log(`✓ Created ${deviceIds.length} test devices`);

    // Create sample applications
    for (let i = 0; i < 2; i++) {
      const appId = randomUUID();
      await knex('applications').insert({
        id: appId,
        tenant_id: tenantId,
        package_name: `com.example.app${i + 1}`,
        version_name: '1.0.0',
        version_code: 1,
        min_sdk: 24,
        target_sdk: 34,
        install_status: 'installed',
        health_status: 'healthy',
        size_bytes: 50000000 + i * 10000000,
        permissions: ['android.permission.INTERNET', 'android.permission.CAMERA'],
        installed_device_count: 3,
        healthy_device_count: 3,
      });
    }

    console.log('✓ Created sample applications');

    // Create sample workload
    const workloadId = randomUUID();
    await knex('workloads').insert({
      id: workloadId,
      tenant_id: tenantId,
      name: 'Sample Workload',
      description: 'A sample workload for testing',
      category: 'testing',
      status: 'completed',
      device_ids: JSON.stringify(deviceIds),
      progress: 100,
      success_rate: 95,
      failure_count: 0,
      runtime_seconds: 3600,
      started_at: new Date(Date.now() - 86400000), // 24 hours ago
      completed_at: new Date(Date.now() - 82800000), // 23 hours ago
    });

    console.log('✓ Created sample workload');

    // Create sample workflows
    for (let i = 0; i < 2; i++) {
      const workflowId = randomUUID();
      await knex('workflows').insert({
        id: workflowId,
        tenant_id: tenantId,
        name: `Sample Workflow ${i + 1}`,
        description: `A sample workflow for ${i === 0 ? 'manual' : 'scheduled'} execution`,
        trigger_type: i === 0 ? 'manual' : 'scheduled',
        cron_expression: i === 0 ? null : '0 */4 * * *', // Every 4 hours for workflow 2
        steps: JSON.stringify([
          {
            id: randomUUID(),
            name: 'Step 1',
            type: 'device_check',
            config: {},
          },
          {
            id: randomUUID(),
            name: 'Step 2',
            type: 'application_test',
            config: { package: 'com.example.app1' },
          },
        ]),
        status: 'active',
      });
    }

    console.log('✓ Created sample workflows');

    // Create sample alerts
    for (let i = 0; i < 2; i++) {
      const alertId = randomUUID();
      await knex('alerts').insert({
        id: alertId,
        tenant_id: tenantId,
        device_id: deviceIds[0],
        device_name: 'Test Device 1',
        severity: i === 0 ? 'warning' : 'info',
        status: 'active',
        description: i === 0 ? 'High CPU usage detected' : 'Device offline for 30 minutes',
        recommended_action: i === 0 ? 'Investigate running processes' : 'Restart the device',
        metadata: {
          cpu_percent: i === 0 ? 95 : null,
          offline_duration_minutes: i === 0 ? null : 30,
        },
      });
    }

    console.log('✓ Created sample alerts');

    // Create sample telemetry data
    const now = new Date();
    for (let deviceIdx = 0; deviceIdx < deviceIds.length; deviceIdx++) {
      for (let hourOffset = 0; hourOffset < 24; hourOffset++) {
        const timestamp = new Date(now.getTime() - hourOffset * 3600000);

        await knex('telemetry').insert({
          tenant_id: tenantId,
          device_id: deviceIds[deviceIdx],
          timestamp,
          cpu_percent: Math.random() * 80 + 10, // 10-90%
          memory_mb: Math.random() * 2000 + 2000, // 2000-4000 MB
          battery_percent: Math.random() * 30 + 50, // 50-80%
          temperature_celsius: Math.random() * 10 + 35, // 35-45°C
          network_latency_ms: Math.random() * 30 + 10, // 10-40ms
          packet_loss_percent: Math.random() * 2, // 0-2%
        });
      }
    }

    console.log('✓ Created sample telemetry data');
  } else {
    console.log('Default tenant already exists, skipping seed');
  }
}

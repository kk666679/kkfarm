import type { Knex } from 'knex';

export async function createTenantTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('tenants', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable().unique();
    table.string('slug', 255).notNullable().unique();
    table.text('description');
    table.json('metadata').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('slug');
    table.index('is_active');
  });
}

export async function createUsersTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('users', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('email', 255).notNullable();
    table.string('name', 255).notNullable();
    table.string('password_hash', 255);
    table.string('role', 50).notNullable().defaultTo('viewer');
    table.json('permissions').defaultTo('[]');
    table.timestamp('last_login_at');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'email']);
    table.index(['tenant_id', 'is_active']);
    table.index('created_at');
  });
}

export async function createDevicesTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('devices', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('serial', 255).notNullable();
    table.string('name', 255);
    table.string('provider', 100).notNullable();
    table.string('manufacturer', 255);
    table.string('model', 255);
    table.string('android_version', 50);
    table.integer('api_level');
    table.string('status', 50).notNullable().defaultTo('offline');
    table.string('state', 50).notNullable().defaultTo('provisioning');
    table.string('container_id', 255);
    table.string('adb_host', 255);
    table.integer('adb_port');
    table.uuid('assigned_task_id');
    table.string('agent_version', 50);
    table.timestamp('security_patch_date');
    table.string('cloud_region', 100);
    table.uuid('session_id');
    table.uuid('current_workload_id');
    table.string('management_state', 50).defaultTo('managed');
    table.json('metadata').defaultTo('{}');
    table.float('battery_level').defaultTo(0);
    table.float('cpu_usage').defaultTo(0);
    table.float('memory_usage').defaultTo(0);
    table.float('storage_usage').defaultTo(0);
    table.float('temperature').defaultTo(0);
    table.float('network_latency').defaultTo(0);
    table.timestamp('last_heartbeat');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'serial']);
    table.index(['tenant_id', 'status']);
    table.index(['tenant_id', 'state']);
    table.index(['tenant_id', 'provider']);
    table.index(['tenant_id', 'cloud_region']);
    table.index('last_heartbeat');
  });
}

export async function createDeviceTelemetryTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('device_telemetry', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('device_id').notNullable().references('id').inTable('devices').onDelete('CASCADE');
    table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now());
    table.float('cpu');
    table.float('memory');
    table.float('storage');
    table.float('battery');
    table.float('temperature');
    table.float('network_latency');
    table.float('packet_loss');

    table.index(['tenant_id', 'device_id', 'timestamp']);
    table.index(['device_id', 'timestamp']);
    table.index('timestamp');
  });
}

export async function createTasksTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('tasks', (table: Knex.CreateTableBuilder) => {
    table.string('id').primary();
    table.string('type').notNullable();
    table.string('status').notNullable().defaultTo('queued');
    table.string('device_id');
    table.integer('priority').notNullable().defaultTo(0);
    table.json('payload').defaultTo('{}');
    table.integer('progress').notNullable().defaultTo(0);
    table.text('error');
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('status');
    table.index('device_id');
  });
}

export async function createTaskEventsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('task_events', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('task_id').notNullable();
    table.string('event').notNullable();
    table.json('data').defaultTo('{}');
    table.timestamp('timestamp').defaultTo(knex.fn.now());

    table.index('task_id');
  });
}

export async function createScheduledJobsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('scheduled_jobs', (table: Knex.CreateTableBuilder) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('cron').notNullable();
    table.string('timezone').notNullable().defaultTo('UTC');
    table.boolean('enabled').notNullable().defaultTo(true);
    table.json('task_template').defaultTo('{}');
    table.timestamp('last_run_at');
    table.timestamp('next_run_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function createRefreshTokensTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('refresh_tokens', (table: Knex.CreateTableBuilder) => {
    table.string('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token').notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['user_id', 'expires_at']);
    table.index('token');
  });
}

export async function createWorkloadsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('workloads', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('category', 100).notNullable();
    table.string('status', 50).notNullable().defaultTo('pending');
    table.json('device_ids').defaultTo('[]');
    table.integer('device_count').defaultTo(0);
    table.float('progress').defaultTo(0);
    table.float('success_rate').defaultTo(0);
    table.integer('failure_count').defaultTo(0);
    table.float('runtime_seconds').defaultTo(0);
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamp('last_execution');
    table.timestamp('next_execution');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'status']);
    table.index(['tenant_id', 'created_at']);
  });
}

export async function createWorkloadExecutionsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists(
    'workload_executions',
    (table: Knex.CreateTableBuilder) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
      table
        .uuid('workload_id')
        .notNullable()
        .references('id')
        .inTable('workloads')
        .onDelete('CASCADE');
      table.uuid('device_id').notNullable().references('id').inTable('devices').onDelete('CASCADE');
      table.string('status', 50).notNullable().defaultTo('pending');
      table.float('duration_seconds').defaultTo(0);
      table.json('result').defaultTo('{}');
      table.timestamp('started_at').defaultTo(knex.fn.now());
      table.timestamp('completed_at');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index(['tenant_id', 'workload_id']);
      table.index(['device_id', 'status']);
      table.index('created_at');
    }
  );
}

export async function createWorkflowsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('workflows', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('trigger_type', 50).notNullable().defaultTo('manual');
    table.string('cron_expression', 255);
    table.json('steps').defaultTo('[]');
    table.string('status', 50).notNullable().defaultTo('draft');
    table.uuid('current_step_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'status']);
    table.index(['tenant_id', 'trigger_type']);
  });
}

export async function createWorkflowExecutionsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists(
    'workflow_executions',
    (table: Knex.CreateTableBuilder) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
      table
        .uuid('workflow_id')
        .notNullable()
        .references('id')
        .inTable('workflows')
        .onDelete('CASCADE');
      table.string('status', 50).notNullable().defaultTo('running');
      table.uuid('current_step_id');
      table.timestamp('started_at').defaultTo(knex.fn.now());
      table.timestamp('completed_at');
      table.json('result').defaultTo('{}');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index(['tenant_id', 'workflow_id']);
      table.index('status');
    }
  );
}

export async function createApplicationsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('applications', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('package_name', 255).notNullable();
    table.string('version_name', 50);
    table.integer('version_code');
    table.integer('min_sdk');
    table.integer('target_sdk');
    table.string('install_status', 50).notNullable().defaultTo('pending');
    table.string('health_status', 50).notNullable().defaultTo('unknown');
    table.string('apk_url', 1024);
    table.string('apk_hash', 255);
    table.bigInteger('size_bytes');
    table.json('permissions').defaultTo('[]');
    table.integer('installed_device_count').defaultTo(0);
    table.integer('healthy_device_count').defaultTo(0);
    table.integer('failed_device_count').defaultTo(0);
    table.string('update_status', 50).defaultTo('none');
    table.string('previous_version_name', 50);
    table.integer('previous_version_code');
    table.timestamp('last_deployed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['tenant_id', 'package_name', 'version_code']);
    table.index(['tenant_id', 'package_name']);
  });
}

export async function createApplicationInstallationsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists(
    'application_installations',
    (table: Knex.CreateTableBuilder) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
      table
        .uuid('application_id')
        .notNullable()
        .references('id')
        .inTable('applications')
        .onDelete('CASCADE');
      table.uuid('device_id').notNullable().references('id').inTable('devices').onDelete('CASCADE');
      table.string('status', 50).notNullable().defaultTo('pending');
      table.string('health_status', 50).notNullable().defaultTo('unknown');
      table.timestamp('installed_at');
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.unique(['tenant_id', 'application_id', 'device_id']);
      table.index(['tenant_id', 'device_id']);
    }
  );
}

export async function createAlertsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('alerts', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('device_id').references('id').inTable('devices').onDelete('SET NULL');
    table.string('device_name', 255);
    table.string('title', 255);
    table.string('severity', 50).notNullable().defaultTo('info');
    table.string('status', 50).notNullable().defaultTo('active');
    table.text('description').notNullable();
    table.text('recommended_action');
    table.json('metadata').defaultTo('{}');
    table.timestamp('resolved_at');
    table.uuid('resolved_by');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'status']);
    table.index(['tenant_id', 'severity']);
    table.index(['device_id', 'created_at']);
    table.index('created_at');
  });
}

export async function createAuditLogsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('audit_log', (table: Knex.CreateTableBuilder) => {
    table.string('id').primary();
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.uuid('operator_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('operator_role', 50);
    table.string('action', 100).notNullable();
    table.string('target_type', 100).notNullable();
    table.string('target_id');
    table.text('description').notNullable();
    table.json('parameters').defaultTo('{}');
    table.string('status', 50).defaultTo('success');
    table.text('error_message');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'created_at']);
    table.index(['operator_id', 'created_at']);
    table.index(['action', 'created_at']);
    table.index('created_at');
  });
}

export async function createRecommendationsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('recommendations', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.text('description').notNullable();
    table.integer('affected_device_count').defaultTo(0);
    table.string('cluster_id');
    table.string('cluster_type');
    table.string('action').notNullable();
    table.float('confidence').notNullable();
    table.json('metric_trends').defaultTo('[]');
    table.text('root_cause_hypothesis').notNullable();
    table.string('status', 50).notNullable().defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'status']);
  });
}

export async function createCostRecordsTable(knex: any): Promise<void> {
  await knex.schema.createTableIfNotExists('cost_records', (table: Knex.CreateTableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('tenant_id').notNullable().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('category', 100).notNullable();
    table.string('region', 100).notNullable();
    table.float('amount').notNullable();
    table.string('unit', 50).notNullable();
    table.float('quantity').notNullable();
    table.float('rate').notNullable();
    table.timestamp('recorded_at').defaultTo(knex.fn.now());

    table.index(['tenant_id', 'category']);
    table.index(['tenant_id', 'region']);
    table.index('recorded_at');
  });
}

export async function createAllTables(knex: any): Promise<void> {
  console.log('Creating database schema...');

  await createTenantTable(knex);
  console.log('Created tenants table');

  await createUsersTable(knex);
  console.log('Created users table');

  await createDevicesTable(knex);
  console.log('Created devices table');

  await createDeviceTelemetryTable(knex);
  console.log('Created device_telemetry table');

  await createTasksTable(knex);
  console.log('Created tasks table');

  await createTaskEventsTable(knex);
  console.log('Created task_events table');

  await createScheduledJobsTable(knex);
  console.log('Created scheduled_jobs table');

  await createRefreshTokensTable(knex);
  console.log('Created refresh_tokens table');

  await createWorkloadsTable(knex);
  console.log('Created workloads table');

  await createWorkloadExecutionsTable(knex);
  console.log('Created workload_executions table');

  await createWorkflowsTable(knex);
  console.log('Created workflows table');

  await createWorkflowExecutionsTable(knex);
  console.log('Created workflow_executions table');

  await createApplicationsTable(knex);
  console.log('Created applications table');

  await createApplicationInstallationsTable(knex);
  console.log('Created application_installations table');

  await createAlertsTable(knex);
  console.log('Created alerts table');

  await createAuditLogsTable(knex);
  console.log('Created audit_log table');

  await createRecommendationsTable(knex);
  console.log('Created recommendations table');

  await createCostRecordsTable(knex);
  console.log('Created cost_records table');

  console.log('Database schema created successfully');
}

export async function enableRLS(knex: any): Promise<void> {
  console.log('Enabling RLS policies...');

  const tables = [
    'users',
    'devices',
    'device_telemetry',
    'workloads',
    'workload_executions',
    'workflows',
    'workflow_executions',
    'applications',
    'application_installations',
    'alerts',
    'audit_log',
    'recommendations',
    'cost_records',
  ];

  for (const table of tables) {
    try {
      await knex.raw(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      console.log(`Enabled RLS on ${table}`);
    } catch (error) {
      console.log(`RLS already enabled or failed on ${table}: ${(error as Error).message}`);
    }

    try {
      await knex.raw(`
        CREATE POLICY ${table}_tenant_isolation ON ${table}
        FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
      `);
    } catch (error) {
      console.log(`RLS policy already exists or failed on ${table}: ${(error as Error).message}`);
    }

    try {
      await knex.raw(`
        CREATE POLICY ${table}_tenant_modification ON ${table}
        FOR UPDATE
        USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
      `);
    } catch (error) {
      console.log(`RLS policy already exists or failed on ${table}: ${(error as Error).message}`);
    }

    try {
      await knex.raw(`
        CREATE POLICY ${table}_tenant_deletion ON ${table}
        FOR DELETE
        USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
      `);
    } catch (error) {
      console.log(`RLS policy already exists or failed on ${table}: ${(error as Error).message}`);
    }
  }

  console.log('RLS policies enabled successfully');
}

import * as schema from '../schema';

export async function up(knex: any): Promise<void> {
  await schema.createAllTables(knex);
}

export async function down(knex: any): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('cost_records');
  await knex.schema.dropTableIfExists('recommendations');
  await knex.schema.dropTableIfExists('audit_log');
  await knex.schema.dropTableIfExists('alerts');
  await knex.schema.dropTableIfExists('application_installations');
  await knex.schema.dropTableIfExists('applications');
  await knex.schema.dropTableIfExists('workflow_executions');
  await knex.schema.dropTableIfExists('workflows');
  await knex.schema.dropTableIfExists('workload_executions');
  await knex.schema.dropTableIfExists('workloads');
  await knex.schema.dropTableIfExists('scheduled_jobs');
  await knex.schema.dropTableIfExists('task_events');
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('device_telemetry');
  await knex.schema.dropTableIfExists('devices');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('tenants');
}

import { initDatabase, runMigrations } from './database.ts';

export { runMigrations } from './database.ts';

const migrate = async () => {
  await initDatabase();
  runMigrations();
  console.log('Migrations complete');
};

migrate();

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

process.env.NODE_ENV = 'test';

const envPath = resolve(__dirname, '../.env.test');

if (!existsSync(envPath)) {
  throw new Error(
    'E2E tests require .env.test. Create it from .env.test.example and point DATABASE_URL to a test database.',
  );
}

const result = config({
  path: envPath,
  override: true,
});

if (result.error) {
  throw result.error;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.test');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in .env.test');
}

const databaseName = new URL(process.env.DATABASE_URL).pathname
  .replace('/', '')
  .toLowerCase();

if (
  !databaseName.includes('test') &&
  process.env.ALLOW_E2E_NON_TEST_DB !== 'true'
) {
  throw new Error(
    'E2E DATABASE_URL must point to a test database. Include "test" in the database name or set ALLOW_E2E_NON_TEST_DB=true explicitly.',
  );
}

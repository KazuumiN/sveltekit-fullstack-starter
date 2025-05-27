import { DATABASE_URL } from '$env/static/private';
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely';
import pg from 'pg';
const { Pool } = pg;
import type { DB } from './types';

const connectionString = DATABASE_URL || process.env.DATABASE_URL || '';

if (!connectionString) {
	throw new Error('DATABASE_URL environment variable is not set.');
}

export const pool = new Pool({
	connectionString
});

const dialect = new PostgresDialect({
	pool
});

const db = new Kysely<DB>({
	dialect,
	plugins: [new CamelCasePlugin()],
	log(event) {
		if (event.level === 'error') {
			console.error({ dbError: event.error });
		}
	}
});

export default db;

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function runMigrations() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    const db = drizzle(pool);

    console.log('Running migrations...');

    try {
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('✓ Migrations completed successfully');
    } catch (error) {
        console.error('✗ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();

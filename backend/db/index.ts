import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Standard Postgres driver over TCP — works with local Postgres and Neon alike.
// SSL is enabled automatically when the connection string asks for it
// (e.g. ?sslmode=require); local connections without it stay plaintext.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

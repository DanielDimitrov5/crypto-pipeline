import pkg from 'pg';
import isLocal from '../config/env.js';

const { Pool } = pkg;

// Create a new PostgreSQL connection pool
export const db = new Pool({
  user: 'postgres',
  host: isLocal ? 'localhost' : 'postgres', // Docker: 'postgres' | Local: 'localhost'
  database: 'crypto_assets',
  password: 'yourpassword',
  port: isLocal ? 5555 : 5432, // Docker: 5432 | Local: 5555
});

// Connect to the PostgreSQL database
await db.connect();

// Create the table if it doesn't exist
await db.query(`
  CREATE TABLE IF NOT EXISTS assets (
  symbol TEXT PRIMARY KEY,
  price NUMERIC,
  updated_at TIMESTAMPTZ);
`);

console.log('[✓] Connected to PostgreSQL and ensured table exists');
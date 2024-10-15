import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'your_username',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'monopoly',
  password: process.env.DB_PASSWORD || 'your_password',
  port: Number(process.env.DB_PORT) || 5432,
});

export default pool;

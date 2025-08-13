import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'app_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'culture_connect',
  password: process.env.DB_PASSWORD || 'securepassword',
  port: process.env.DB_PORT || 5432,
});

export default pool;

const { Pool } = require('pg');
require('dotenv').config();

console.log('Connecting with:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function test() {
  try {
    const res = await pool.query('SELECT * FROM restaurants');
    console.log('✅ Success! Found', res.rows.length, 'restaurants');
    console.log('Restaurants:', res.rows);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  pool.end();
}

test();
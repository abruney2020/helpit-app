// db/index.js

require('dotenv').config(); // load envs first
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',         
  password: process.env.DB_PASSWORD || 'postgres123', 
  database: process.env.DB_NAME || 'helpit',         
  port: process.env.DB_PORT || 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
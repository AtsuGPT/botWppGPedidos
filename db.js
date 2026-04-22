const { Pool } = require("pg");

// banco
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "2108",
  port: 5433,
});

module.exports = { pool };
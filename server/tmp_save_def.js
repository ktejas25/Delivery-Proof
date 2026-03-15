const pool = require("./config/database");
const fs = require('fs');

async function check() {
  try {
    const [rows] = await pool.query("SHOW CREATE TABLE deliveries");
    fs.writeFileSync('table_def.txt', rows[0]['Create Table']);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

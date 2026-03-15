const pool = require("./config/database");
const fs = require('fs');

async function check() {
  try {
    const [rows] = await pool.query("SHOW CREATE PROCEDURE sp_get_customer_delivery_history");
    fs.writeFileSync('proc_def.txt', rows[0]['Create Procedure']);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

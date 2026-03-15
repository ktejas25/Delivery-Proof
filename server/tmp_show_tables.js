const pool = require("./config/database");

async function check() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    console.log(rows.map(r => Object.values(r)[0]));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

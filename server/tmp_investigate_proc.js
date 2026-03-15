const pool = require("./config/database");

async function check() {
  try {
    const [rows] = await pool.query("CALL sp_get_customer_delivery_history(3)");
    console.log("Columns:", Object.keys(rows[0][0] || {}));
    console.log("Data:", JSON.stringify(rows[0].slice(0, 2), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

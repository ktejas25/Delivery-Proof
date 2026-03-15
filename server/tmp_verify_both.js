const pool = require("./config/database");

async function check() {
  try {
    const [rows] = await pool.query("CALL sp_get_customer_delivery_history(2)");
    console.log("Customer 2 Deliveries:", rows[0].length);
    const [rows3] = await pool.query("CALL sp_get_customer_delivery_history(3)");
    console.log("Customer 3 Deliveries:", rows3[0].length);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

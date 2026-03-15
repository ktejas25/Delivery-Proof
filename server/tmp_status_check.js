const pool = require("./config/database");

async function check() {
  try {
    const [rows] = await pool.query("DESCRIBE deliveries");
    const statusCol = rows.find(r => r.Field === 'delivery_status');
    console.log("Status Column Definition:", statusCol.Type);

    const [sample] = await pool.query("SELECT delivery_status FROM deliveries LIMIT 5");
    console.log("Sample Data Statuses:", sample.map(s => s.delivery_status));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

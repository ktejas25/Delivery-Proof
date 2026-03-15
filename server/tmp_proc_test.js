const pool = require("./config/database");

async function check() {
  try {
    const [customers] = await pool.query("SELECT id, name, email FROM customers");
    for (const c of customers) {
      console.log(`Checking deliveries for ${c.name} (ID: ${c.id})...`);
      const [rows] = await pool.query("CALL sp_get_customer_delivery_history(?)", [c.id]);
      console.log(`Found ${rows[0].length} deliveries`);
      if (rows[0].length > 0) {
        console.log("Sample:", JSON.stringify(rows[0][0], null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

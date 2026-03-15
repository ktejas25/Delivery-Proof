const pool = require("./config/database");

async function check() {
  try {
    const [deliveries] = await pool.query("SELECT * FROM deliveries");
    console.log("Total deliveries:", deliveries.length);
    if (deliveries.length > 0) {
      console.log("Sample delivery:", JSON.stringify(deliveries[0], null, 2));
    }

    const [customers] = await pool.query("SELECT * FROM customers");
    console.log("Total customers:", customers.length);

    const [users] = await pool.query("SELECT * FROM users WHERE user_type = 'customer'");
    console.log("Total customer users:", users.length);

    const [procs] = await pool.query("SHOW PROCEDURE STATUS WHERE Db = DATABASE()");
    console.log("Procedures:", procs.map(p => p.Name));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

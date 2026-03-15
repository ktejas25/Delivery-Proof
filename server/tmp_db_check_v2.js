const pool = require("./config/database");

async function check() {
  try {
    const [users] = await pool.query("SELECT id, email, user_type FROM users");
    console.log("Users:", JSON.stringify(users, null, 2));

    const [customers] = await pool.query("SELECT id, email, name FROM customers");
    console.log("Customers:", JSON.stringify(customers, null, 2));

    const [deliveries] = await pool.query("SELECT customer_id, count(*) as count FROM deliveries group by customer_id");
    console.log("Deliveries per customer:", JSON.stringify(deliveries, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

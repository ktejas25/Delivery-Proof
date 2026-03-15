const pool = require("./config/database");

async function check() {
  try {
    const [mapping] = await pool.query(`
      SELECT u.id as user_id, u.email, c.id as customer_id
      FROM users u
      LEFT JOIN customers c ON u.email = c.email
      WHERE u.user_type = 'customer'
    `);
    console.log("Customer Mapping:", JSON.stringify(mapping, null, 2));

    const [delCounts] = await pool.query("SELECT customer_id, COUNT(*) as count FROM deliveries GROUP BY customer_id");
    console.log("Delivery Counts:", delCounts);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

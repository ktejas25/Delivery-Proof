const pool = require("./config/database");
const fs = require('fs');

async function check() {
  try {
    const [mapping] = await pool.query(`
      SELECT u.id as user_id, u.email, c.id as customer_id
      FROM users u
      LEFT JOIN customers c ON u.email = c.email
      WHERE u.user_type = 'customer'
    `);
    const [delCounts] = await pool.query("SELECT customer_id, COUNT(*) as count FROM deliveries GROUP BY customer_id");
    fs.writeFileSync('map_results.txt', JSON.stringify({ mapping, delCounts }, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

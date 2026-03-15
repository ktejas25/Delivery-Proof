const pool = require("./config/database");

async function check() {
  try {
    const [users] = await pool.query("SELECT id, email, user_type FROM users");
    console.log("Users:", users);

    const [customers] = await pool.query("SELECT id, email, name FROM customers");
    console.log("Customers:", customers);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();

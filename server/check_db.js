const pool = require("./config/database");

async function checkDrivers() {
  try {
    const [rows] = await pool.query(
      "SELECT d.user_id, u.email, d.current_status, d.is_available FROM drivers d JOIN users u ON d.user_id = u.id",
    );
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDrivers();

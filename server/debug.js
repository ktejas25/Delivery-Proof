const mysql = require("mysql2/promise");
async function run() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "deliveryproof",
  });
  const [users] = await conn.query(
    "SELECT id, uuid, first_name FROM users WHERE user_type='driver'",
  );
  for (let user of users) {
    const [hist] = await conn.query(
      "SELECT d.id, driver_id FROM deliveries d JOIN drivers dr ON d.driver_id = dr.id WHERE dr.user_id = ?",
      [user.id],
    );
    console.log(user.first_name, hist);
  }
  await conn.end();
}
run().catch(console.error);

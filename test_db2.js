const pool = require("./server/config/database");
async function run() {
  const [res] = await pool.query(
    "SELECT driver_id FROM deliveries d WHERE d.uuid='8509ab98-9545-4b1b-96b1-2a2d2b88141e'",
  );
  console.log("driver id for ORD-1022:", res);
  process.exit();
}
run();

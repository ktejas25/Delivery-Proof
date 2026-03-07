const pool = require("./server/config/database");
async function run() {
  const [res] = await pool.query(
    "SELECT driver_id FROM deliveries d WHERE d.uuid='8509ab98-9545-4b1b-96b1-2a2d2b88141e'",
  );
  console.log("driver id for delivery:", res);

  const [res2] = await pool.query(
    "SELECT COUNT(DISTINCT d.id) as totalDeliveries, AVG(dp.verification_score) as avgProofScore FROM deliveries d LEFT JOIN delivery_proofs dp ON d.id = dp.delivery_id WHERE d.driver_id = " +
      res[0].driver_id,
  );
  console.log("summary:", res2);

  const [res3] = await pool.query(
    "SELECT * FROM deliveries WHERE driver_id = " +
      res[0].driver_id +
      " LIMIT 5",
  );
  console.log("recent deliveries actual rows:");
  for (let r of res3) {
    console.log(r.id, r.delivery_status, r.actual_arrival, r.estimated_arrival);
  }

  process.exit();
}
run();

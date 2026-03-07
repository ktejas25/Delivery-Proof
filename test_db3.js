const pool = require("./server/config/database");
async function run() {
  const driverId = 4;
  const [summaryRows] = await pool.query(
    `SELECT 
        COUNT(DISTINCT d.id) as totalDeliveries,
        COUNT(DISTINCT ds.id) as disputesCount,
        AVG(dp.verification_score) as avgProofScore
       FROM deliveries d
       LEFT JOIN delivery_proofs dp ON d.id = dp.delivery_id
       LEFT JOIN disputes ds ON d.id = ds.delivery_id
       WHERE d.driver_id = ?`,
    [driverId],
  );
  console.log("Summary:", summaryRows[0]);
  process.exit();
}
run();

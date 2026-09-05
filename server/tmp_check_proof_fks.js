const pool = require("./config/database");

async function checkProofFks() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_NAME IN ('delivery_proofs', 'disputes', 'deliveries', 'delivery_photos', 'delivery_signatures')
         OR TABLE_NAME IN ('delivery_photos', 'delivery_signatures', 'dispute_comments');
    `);
    console.log(JSON.stringify(rows, null, 2));

    const [dp] = await pool.query("SELECT COUNT(*) as c FROM delivery_proofs");
    const [dph] = await pool.query("SELECT COUNT(*) as c FROM delivery_photos");
    const [ds] = await pool.query("SELECT COUNT(*) as c FROM delivery_signatures");
    const [lt] = await pool.query("SELECT COUNT(*) as c FROM location_tracking");
    const [disp] = await pool.query("SELECT COUNT(*) as c FROM disputes");
    const [dc] = await pool.query("SELECT COUNT(*) as c FROM dispute_comments");
    const [dr] = await pool.query("SELECT COUNT(*) as c FROM driver_ratings");
    const [dad] = await pool.query("SELECT COUNT(*) as c FROM delivery_analytics_daily");

    console.log({
      delivery_proofs: dp[0].c,
      delivery_photos: dph[0].c,
      delivery_signatures: ds[0].c,
      location_tracking: lt[0].c,
      disputes: disp[0].c,
      dispute_comments: dc[0].c,
      driver_ratings: dr[0].c,
      delivery_analytics_daily: dad[0].c
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProofFks();

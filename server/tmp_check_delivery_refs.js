const pool = require("./config/database");

async function checkDeliveryReferences() {
  try {
    const [fks] = await pool.query(`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE REFERENCED_TABLE_NAME = 'deliveries'
         OR TABLE_NAME = 'deliveries';
    `);
    console.log("Foreign keys referencing or in deliveries:");
    console.log(JSON.stringify(fks, null, 2));

    const [delivCols] = await pool.query(`
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE COLUMN_NAME LIKE '%delivery%' AND TABLE_SCHEMA = DATABASE();
    `);
    console.log("Tables with delivery columns:");
    console.log(JSON.stringify(delivCols, null, 2));

    const [delivCount] = await pool.query("SELECT COUNT(*) as cnt FROM deliveries");
    console.log("Current deliveries count:", delivCount[0].cnt);

    const [custCount] = await pool.query("SELECT COUNT(*) as cnt FROM customers");
    console.log("Current customers count:", custCount[0].cnt);

    const [drvCount] = await pool.query("SELECT COUNT(*) as cnt FROM drivers");
    console.log("Current drivers count:", drvCount[0].cnt);

    const [userCount] = await pool.query("SELECT COUNT(*) as cnt FROM users");
    console.log("Current users count:", userCount[0].cnt);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDeliveryReferences();

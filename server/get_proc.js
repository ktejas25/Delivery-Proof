const pool = require('./config/database');
const fs = require('fs');

async function getProc() {
  try {
    const [rows] = await pool.query('SHOW CREATE PROCEDURE sp_track_delivery');
    fs.writeFileSync('proc_full.txt', rows[0]['Create Procedure']);
    console.log('Saved to proc_full.txt');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
getProc();

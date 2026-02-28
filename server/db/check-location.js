require('dotenv').config({path: require('path').resolve('.env'), override: true});
const mysql = require('mysql2/promise');

async function run() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA
    });

    const [r] = await c.query(
        "SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_NAME='customers' AND COLUMN_NAME='location' AND TABLE_SCHEMA=DATABASE()"
    );
    console.log('location IS_NULLABLE:', r[0]?.IS_NULLABLE);
    await c.end();
}

run().catch(e => console.error(e.message));

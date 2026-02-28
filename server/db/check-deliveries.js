require('dotenv').config({path: require('path').resolve('.env'), override: true});
const mysql = require('mysql2/promise');
mysql.createConnection({
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA
}).then(async c => {
    const [r] = await c.query(
        `SELECT uuid, order_number, delivery_status, driver_id FROM deliveries ORDER BY created_at DESC LIMIT 10`
    );
    r.forEach(d => {
        process.stdout.write(`status=${d.delivery_status} | driver_id=${d.driver_id} | uuid=${d.uuid}\n`);
    });
    await c.end();
}).catch(e => console.error(e.message));

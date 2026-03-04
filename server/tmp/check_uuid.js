require('dotenv').config({path: require('path').resolve(__dirname, '../.env'), override: true});
const mysql = require('mysql2/promise');

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA
    });

    const uuid = '79197fd3-5927-4eb1-9695-3f18e56a1a26';
    const [rows] = await connection.query(
        'SELECT * FROM deliveries WHERE uuid = ?',
        [uuid]
    );

    if (rows.length === 0) {
        process.stdout.write(`Delivery with UUID ${uuid} not found in DB\n`);
    } else {
        const d = rows[0];
        process.stdout.write(`Found delivery:\n`);
        process.stdout.write(`  status: ${d.delivery_status}\n`);
        process.stdout.write(`  business_id: ${d.business_id}\n`);
        process.stdout.write(`  photo_url: ${d.photo_url || 'NULL'}\n`);
        process.stdout.write(`  signature_url: ${d.signature_url || 'NULL'}\n`);
    }

    // Check users for business info
    const [users] = await connection.query('SELECT * FROM users LIMIT 5');
    process.stdout.write(`Users in DB:\n`);
    users.forEach(u => {
        process.stdout.write(`  user_id: ${u.id} | business_id: ${u.business_id} | user_type: ${u.user_type}\n`);
    });

    await connection.end();
}

check().catch(e => console.error(e.message));

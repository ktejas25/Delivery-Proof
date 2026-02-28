require('dotenv').config({path: require('path').resolve('.env'), override: true});
const mysql = require('mysql2/promise');

async function fixLocation() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA,
        connectTimeout: 10000
    });
    console.log('Connected. Running ALTER TABLE...');
    try {
        // Find and drop any spatial index on location
        const [indexes] = await c.query(
            "SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_NAME='customers' AND COLUMN_NAME='location' AND TABLE_SCHEMA=DATABASE()"
        );
        for (const idx of indexes) {
            console.log('Dropping index:', idx.INDEX_NAME);
            await c.query(`ALTER TABLE customers DROP INDEX \`${idx.INDEX_NAME}\``);
        }

        // Now make column nullable (must keep SRID 4326 to match original)
        await c.query('ALTER TABLE customers MODIFY COLUMN location POINT SRID 4326 NULL');
        console.log('SUCCESS: customers.location is now nullable with SRID 4326');
    } catch (e) {
        console.error('FAILED:', e.message);
    }
    await c.end();
}

fixLocation();

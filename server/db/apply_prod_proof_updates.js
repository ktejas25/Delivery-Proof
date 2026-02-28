require('dotenv').config({path: require('path').resolve(__dirname, '../.env'), override: true});
const mysql = require('mysql2/promise');

async function applyUpdates() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA
    });

    console.log('Applying production proof system updates to deliveries table...');

    const columnsToAdd = [
        { name: 'photo_url', type: 'TEXT' },
        { name: 'signature_url', type: 'TEXT' },
        { name: 'gps_lat', type: 'DECIMAL(10,8)' },
        { name: 'gps_lng', type: 'DECIMAL(11,8)' },
        { name: 'gps_accuracy', type: 'FLOAT' },
        { name: 'proof_hash', type: 'VARCHAR(255)' },
        { name: 'recorded_at', type: 'TIMESTAMP NULL' }
    ];

    for (const col of columnsToAdd) {
        try {
            await connection.query(`ALTER TABLE deliveries ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Added column: ${col.name}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`Column ${col.name} already exists.`);
            } else {
                console.error(`Error adding ${col.name}:`, err.message);
            }
        }
    }

    await connection.end();
    console.log('Update complete.');
}

applyUpdates().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});

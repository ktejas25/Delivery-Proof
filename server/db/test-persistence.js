const mysql = require('mysql2/promise');
require('dotenv').config();

async function testPersistance() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME || '127.0.0.1',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_SCHEMA || 'deliveryproof'
    });

    try {
        console.log('Testing persistence in DB:', process.env.DB_SCHEMA || 'deliveryproof');
        const [before] = await connection.query('SELECT COUNT(*) as count FROM businesses');
        console.log('Businesses before:', before[0].count);

        const uuid = 'test-' + Date.now();
        await connection.query('INSERT INTO businesses (uuid, name, email) VALUES (?, ?, ?)', [uuid, 'Persistence Test', `test-${Date.now()}@test.com`]);
        console.log('Inserted 1 row.');

        const [after] = await connection.query('SELECT COUNT(*) as count FROM businesses');
        console.log('Businesses after:', after[0].count);
    } catch (e) {
        console.error('Test failed:', e.message);
    } finally {
        await connection.end();
    }
}

testPersistance();

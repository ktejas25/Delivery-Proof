const mysql = require('c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/node_modules/mysql2/promise');

async function checkDrivers() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root123',
            database: 'deliveryproof'
        });

        const [rows] = await connection.query('SELECT d.id, u.email FROM drivers d JOIN users u ON d.user_id = u.id');
        console.log('Drivers:', JSON.stringify(rows, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Error in checkDrivers:', err);
    }
}

checkDrivers();

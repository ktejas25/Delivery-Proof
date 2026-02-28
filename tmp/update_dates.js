const mysql = require('c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/node_modules/mysql2/promise');

async function updateDates() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root123',
            database: 'deliveryproof'
        });

        await connection.query('UPDATE deliveries SET scheduled_time = CURRENT_TIMESTAMP');
        console.log('All deliveries updated to current timestamp');

        await connection.end();
    } catch (err) {
        console.error('Error in updateDates:', err);
    }
}

updateDates();

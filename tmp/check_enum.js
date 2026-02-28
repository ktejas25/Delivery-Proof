const mysql = require('c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/node_modules/mysql2/promise');

async function checkEnum() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root123',
            database: 'deliveryproof'
        });

        const [rows] = await connection.query("SHOW COLUMNS FROM deliveries WHERE Field = 'delivery_status'");
        console.log('ENUM Definition:', rows[0].Type);

        const [distinct] = await connection.query("SELECT DISTINCT delivery_status FROM deliveries");
        console.log('Distinct values in DB:', distinct.map(d => d.delivery_status));

        await connection.end();
    } catch (err) {
        console.error('Error in checkEnum:', err);
    }
}

checkEnum();

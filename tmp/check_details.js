const mysql = require('c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/node_modules/mysql2/promise');

async function checkDetails() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root123',
            database: 'deliveryproof'
        });

        const [customers] = await connection.query('SELECT * FROM customers');
        console.log('Customers:', JSON.stringify(customers, null, 2));

        const [drivers] = await connection.query('SELECT * FROM drivers');
        console.log('Drivers:', JSON.stringify(drivers, null, 2));

        const [deliveries] = await connection.query('SELECT * FROM deliveries');
        console.log('Deliveries:', JSON.stringify(deliveries, null, 2));

        await connection.end();
    } catch (err) {
        console.error('Error in checkDetails:', err);
    }
}

checkDetails();

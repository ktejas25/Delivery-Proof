const mysql = require('c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/node_modules/mysql2/promise');

async function checkDb() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root123',
            database: 'deliveryproof'
        });

        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]));

        const [businesses] = await connection.query('SELECT count(*) as count FROM businesses');
        const [users] = await connection.query('SELECT count(*) as count FROM users');
        const [customers] = await connection.query('SELECT count(*) as count FROM customers');
        const [drivers] = await connection.query('SELECT count(*) as count FROM drivers');
        const [deliveries] = await connection.query('SELECT count(*) as count FROM deliveries');

        console.log('Businesses:', businesses[0].count);
        console.log('Users:', users[0].count);
        console.log('Customers:', customers[0].count);
        console.log('Drivers:', drivers[0].count);
        console.log('Deliveries:', deliveries[0].count);

        await connection.end();
    } catch (err) {
        console.error('Error in checkDb:', err);
    }
}

checkDb();

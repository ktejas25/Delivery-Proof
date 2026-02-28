const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/.env' });

async function checkDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA
    });

    try {
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

        if (users[0].count > 0) {
            const [userRows] = await connection.query('SELECT email, business_id, user_type FROM users');
            console.log('Users list:', JSON.stringify(userRows, null, 2));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

checkDb();

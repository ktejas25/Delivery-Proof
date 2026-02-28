const path = require('path');
const serverDir = 'c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server';
const mysql = require(path.join(serverDir, 'node_modules/mysql2/promise'));
const dotenv = require(path.join(serverDir, 'node_modules/dotenv'));

dotenv.config({ path: path.join(serverDir, '.env') });

async function checkDb() {
    console.log('Connecting to:', process.env.DB_SCHEMA, 'as', process.env.DB_USERNAME);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOSTNAME || '127.0.0.1',
            user: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || 'root123',
            database: process.env.DB_SCHEMA || 'deliveryproof'
        });

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

        await connection.end();
    } catch (err) {
        console.error('Error in checkDb:', err);
    }
}

checkDb();

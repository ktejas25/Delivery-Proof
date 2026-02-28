const mysql = require('c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/node_modules/mysql2/promise');

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root123',
            database: 'deliveryproof'
        });

        const [users] = await connection.query('SELECT id, business_id, email, user_type FROM users');
        console.log('Users:', JSON.stringify(users, null, 2));

        for (const user of users) {
             const [deliveries] = await connection.query('SELECT count(*) as count FROM deliveries WHERE business_id = ?', [user.business_id]);
             console.log(`Business ${user.business_id} (User ${user.email}) has ${deliveries[0].count} deliveries`);
        }

        await connection.end();
    } catch (err) {
        console.error('Error in checkUsers:', err);
    }
}

checkUsers();

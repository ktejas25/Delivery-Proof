const mysql = require('c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/node_modules/mysql2/promise');

async function checkDisputes() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root123',
            database: 'deliveryproof'
        });

        const [disputes] = await connection.query('SELECT count(*) as count FROM disputes');
        console.log('Disputes:', disputes[0].count);

        await connection.end();
    } catch (err) {
        console.error('Error in checkDisputes:', err);
    }
}

checkDisputes();

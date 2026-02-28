const mysql = require('c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/node_modules/mysql2/promise');

async function checkCounts() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root123',
            database: 'deliveryproof'
        });

        const [businesses] = await connection.query('SELECT id, name FROM businesses');
        
        for (const biz of businesses) {
            const [deliveries] = await connection.query('SELECT count(*) as count FROM deliveries WHERE business_id = ?', [biz.id]);
            const [customers] = await connection.query('SELECT count(*) as count FROM customers WHERE business_id = ?', [biz.id]);
            const [drivers] = await connection.query('SELECT count(*) as count FROM users WHERE business_id = ? AND user_type = "driver"', [biz.id]);
            
            console.log(`Business ${biz.id} (${biz.name}):`);
            console.log(`  Deliveries: ${deliveries[0].count}`);
            console.log(`  Customers: ${customers[0].count}`);
            console.log(`  Drivers: ${drivers[0].count}`);
        }

        await connection.end();
    } catch (err) {
        console.error('Error in checkCounts:', err);
    }
}

checkCounts();

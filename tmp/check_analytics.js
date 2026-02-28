const mysql = require('c:/Users/itste/Desktop/Tejas/Projects/DeliveryProofSample/server/node_modules/mysql2/promise');

async function checkAnalytics() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'root123',
            database: 'deliveryproof'
        });

        const [analytics] = await connection.query('SELECT count(*) as count FROM delivery_analytics_daily');
        console.log('Analytics records:', analytics[0].count);

        if (analytics[0].count > 0) {
            const [rows] = await connection.query('SELECT * FROM delivery_analytics_daily');
            console.log('Analytics data:', JSON.stringify(rows, null, 2));
        }

        await connection.end();
    } catch (err) {
        console.error('Error in checkAnalytics:', err);
    }
}

checkAnalytics();

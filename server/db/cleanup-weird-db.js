const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME || '127.0.0.1',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123'
    });

    try {
        const dbName = 'personalghost, deliveryproof';
        await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
        console.log(`Dropped weird database: ${dbName}`);
        
        // Ensure clean DB exists
        await connection.query('CREATE DATABASE IF NOT EXISTS `deliveryproof`');
        console.log('Ensure deliveryproof exists');
    } catch (e) {
        console.error('Cleanup failed:', e.message);
    } finally {
        await connection.end();
    }
}

cleanup();

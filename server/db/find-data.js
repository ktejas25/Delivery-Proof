const mysql = require('mysql2/promise');
require('dotenv').config();

async function findData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME || '127.0.0.1',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123'
    });

    try {
        const [dbs] = await connection.query('SHOW DATABASES');
        for (const dbRow of dbs) {
            const db = dbRow.Database;
            if (['information_schema', 'mysql', 'performance_schema', 'sys'].includes(db)) continue;
            
            try {
                await connection.query(`USE \`${db}\``);
                const [tables] = await connection.query('SHOW TABLES');
                const tableNames = tables.map(t => Object.values(t)[0]);
                
                if (tableNames.includes('businesses')) {
                    const [rows] = await connection.query('SELECT name FROM businesses');
                    console.log(`DB: ${db} -> Businesses:`, rows.map(r => r.name));
                }
            } catch (e) {}
        }
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

findData();

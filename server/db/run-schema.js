const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSQLFile(filePath) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME || '127.0.0.1',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_SCHEMA || 'deliveryproof',
        multipleStatements: true
    });

    try {
        let sql = fs.readFileSync(filePath, 'utf8');
        
        // Remove DELIMITER lines
        sql = sql.replace(/DELIMITER \/\/|DELIMITER ;/g, '');
        
        // Replace // with ; inside blocks if needed, but since we are using multipleStatements,
        // we might just need to be careful.
        // Actually, mysql2's multipleStatements can handle standard SQL separated by ;.
        // For stored procedures using //, it's easier to split manually or use a library.
        
        // Let's try to just split by ; AND //
        const statements = sql.split(/;|\/\//);

        for (let statement of statements) {
            statement = statement.trim();
            if (statement) {
                try {
                    await connection.query(statement);
                } catch (err) {
                    console.error('Error executing statement:', statement.substring(0, 100));
                    console.error(err.message);
                }
            }
        }
        
        console.log(`Successfully executed ${filePath}`);
    } catch (error) {
        console.error('Failed to run SQL file:', error);
    } finally {
        await connection.end();
    }
}

async function init() {
    await runSQLFile(path.join(__dirname, 'schema.sql'));
    await runSQLFile(path.join(__dirname, 'seed.sql'));
}

init();

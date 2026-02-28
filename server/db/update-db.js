const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

async function runSQLUpdate() {
    console.log('Starting DB Update...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME || '127.0.0.1',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_SCHEMA || 'deliveryproof',
        multipleStatements: true
    });

    try {
        let sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        // Split by standard delimiter first, but ignore what's inside procedures
        // This is complex. Let's try a simpler approach:
        // 1. Remove comments
        sql = sql.replace(/--.*$/gm, '');
        
        // 2. Extract procedures manually
        const procedureMatches = sql.match(/CREATE PROCEDURE[\s\S]*?END \/\//g);
        let standardSql = sql.replace(/CREATE PROCEDURE[\s\S]*?END \/\//g, ' ');
        
        // 3. Remove DELIMITER lines from standard SQL
        standardSql = standardSql.replace(/DELIMITER.*;/g, '');
        
        // 4. Split standard SQL by ;
        const standardStatements = standardSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        
        console.log(`Executing ${standardStatements.length} standard statements...`);
        for (const statement of standardStatements) {
            try {
                await connection.query(statement);
            } catch (err) {
                console.error('Error in standard statement:', statement.substring(0, 100));
                console.error(err.message);
            }
        }

        if (procedureMatches) {
            console.log(`Executing ${procedureMatches.length} stored procedures...`);
            for (let proc of procedureMatches) {
                // Remove the "END //" and "CREATE PROCEDURE" delimiters if needed
                proc = proc.replace(/\/\/$/, '').trim();
                try {
                    await connection.query(proc);
                } catch (err) {
                    console.error('Error in procedure:', proc.substring(0, 100));
                    console.error(err.message);
                }
            }
        }

        // Run seed.sql
        console.log('Running seed.sql...');
        const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
        const seedStatements = seedSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const statement of seedStatements) {
            try {
                await connection.query(statement);
            } catch (err) {
                console.error('Error in seed statement:', statement.substring(0, 100));
                console.error(err.message);
            }
        }

        console.log('Database refresh completed.');
    } catch (error) {
        console.error('Update failed:', error);
    } finally {
        await connection.end();
    }
}

runSQLUpdate();

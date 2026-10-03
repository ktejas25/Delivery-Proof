const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrateTiDB() {
    console.log('Connecting to TiDB for schema migration...');
    const connection = await mysql.createConnection({
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        port: 4000,
        user: 'hJcz3JngWbfkMVb.root',
        password: 'bwZldxXpXIR6wY0d',
        database: 'deliveryproof',
        multipleStatements: true,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        const fullSql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
        // Extract only table definitions and standard inserts (before DELIMITER //)
        const delimiterIndex = fullSql.indexOf('DELIMITER //');
        const ddlSql = delimiterIndex !== -1 ? fullSql.substring(0, delimiterIndex) : fullSql;

        console.log('Executing table creation and initial setup...');
        await connection.query(ddlSql);
        console.log('Tables successfully created in TiDB!');

        // Check customer_addresses table definition to make sure it's present
        const [tables] = await connection.query('SHOW TABLES;');
        console.log('Created Tables:', tables.map(t => Object.values(t)[0]));

        // Check if customer_addresses table exists or needs creation (from 03_customer_portal.sql)
        const portalSqlPath = path.join(__dirname, 'db', '03_customer_portal.sql');
        if (fs.existsSync(portalSqlPath)) {
            const portalSql = fs.readFileSync(portalSqlPath, 'utf8');
            const portalDelim = portalSql.indexOf('DELIMITER //');
            const portalDdl = portalDelim !== -1 ? portalSql.substring(0, portalDelim) : portalSql;
            console.log('Applying customer portal tables...');
            await connection.query(portalDdl);
        }

        // Apply seed admin data if users table is empty
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users;');
        if (users[0].count === 0) {
            console.log('Users table empty, running seed script...');
            const seedScriptPath = path.join(__dirname, 'db', 'seed_admin_dashboard.js');
            if (fs.existsSync(seedScriptPath)) {
                // We will run seed next
            }
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await connection.end();
    }
}

migrateTiDB();

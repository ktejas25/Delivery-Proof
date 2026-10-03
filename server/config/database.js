const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

const dbConfig = process.env.DATABASE_URL
    ? {
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
    }
    : {
        host: process.env.DB_HOSTNAME || '127.0.0.1',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_SCHEMA || 'deliveryproof',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
    };

const pool = mysql.createPool(dbConfig);

module.exports = pool;

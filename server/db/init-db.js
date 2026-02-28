const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME || '127.0.0.1',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123'
    });

    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_SCHEMA || 'deliveryproof'}\``);
        console.log(`Database ${process.env.DB_SCHEMA || 'deliveryproof'} created or already exists.`);
    } catch (error) {
        console.error('Failed to create database:', error);
    } finally {
        await connection.end();
    }
}

initDB();

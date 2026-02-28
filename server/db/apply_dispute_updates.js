const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

async function applyUpdates() {
    console.log('Starting Dispute Enhancements Schema Update (Safe Mode)...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME || '127.0.0.1',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_SCHEMA || 'deliveryproof',
        multipleStatements: true
    });

    const addColumn = async (table, column, definition) => {
        try {
            await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
            console.log(`Added column ${column} to ${table}.`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`Column ${column} already exists in ${table}.`);
            } else {
                console.error(`Error adding column ${column}:`, err.message);
            }
        }
    };

    try {
        // 1. Add uuid to disputes
        await addColumn('disputes', 'uuid', 'VARCHAR(36) UNIQUE NOT NULL AFTER id');

        // 2. Add ai_explanation to disputes
        await addColumn('disputes', 'ai_explanation', 'TEXT AFTER fraud_score');

        // 3. Add internal_notes to disputes
        await addColumn('disputes', 'internal_notes', 'TEXT AFTER resolution');

        // 4. Modify user_type enum
        try {
            await connection.query("ALTER TABLE users MODIFY COLUMN user_type ENUM('driver', 'manager', 'admin', 'analyst', 'support') NOT NULL");
            console.log('Updated users.user_type enum.');
        } catch (err) {
            console.error('Error modifying user_type:', err.message);
        }

        // 5. Create dispute_comments table
        const createCommentsTable = `
            CREATE TABLE IF NOT EXISTS dispute_comments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                uuid VARCHAR(36) UNIQUE NOT NULL,
                dispute_id INT NOT NULL,
                user_id INT NOT NULL,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_comment_dispute (dispute_id),
                INDEX idx_comment_user (user_id)
            )
        `;
        await connection.query(createCommentsTable);
        console.log('Ensured dispute_comments table exists.');

        // 6. Ensure UUIDs exist for existing disputes
        await connection.query('UPDATE disputes SET uuid = UUID() WHERE uuid IS NULL OR uuid = ""');
        console.log('Ensured disputes have UUIDs.');

        console.log('Dispute enhancements schema applied successfully.');
    } catch (error) {
        console.error('Update failed:', error);
    } finally {
        await connection.end();
    }
}

applyUpdates();

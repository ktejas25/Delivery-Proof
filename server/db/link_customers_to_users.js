const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

async function applyUpdates() {
  console.log("Adding user_id to customers table...");
  const connection = await mysql.createConnection({
    host: process.env.DB_HOSTNAME || "127.0.0.1",
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root123",
    database: process.env.DB_SCHEMA || "deliveryproof",
    multipleStatements: true,
  });

  try {
    // 1. Add user_id column
    try {
      await connection.query(
        "ALTER TABLE customers ADD COLUMN user_id INT AFTER business_id",
      );
      await connection.query(
        "ALTER TABLE customers ADD CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL",
      );
      console.log("Added user_id column and foreign key to customers.");
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("user_id column already exists.");
      } else {
        console.error("Error adding user_id:", err.message);
      }
    }

    // 2. Link existing customers to users by email
    console.log("Linking existing customers to users...");
    await connection.query(`
            UPDATE customers c
            JOIN users u ON c.email = u.email
            SET c.user_id = u.id
            WHERE c.user_id IS NULL AND u.user_type = 'customer'
        `);
    console.log("Linked existing customers.");
  } catch (error) {
    console.error("Update failed:", error);
  } finally {
    await connection.end();
  }
}

applyUpdates();

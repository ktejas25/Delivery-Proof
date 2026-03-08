const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

async function applyUpdates() {
  console.log("Starting Customer Portal Schema Update...");
  const connection = await mysql.createConnection({
    host: process.env.DB_HOSTNAME || "127.0.0.1",
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root123",
    database: process.env.DB_SCHEMA || "deliveryproof",
    multipleStatements: true,
  });

  try {
    await connection.query(
      "ALTER TABLE users MODIFY COLUMN user_type ENUM('driver', 'manager', 'admin', 'analyst', 'support', 'customer') NOT NULL",
    );
    console.log("Updated users.user_type enum.");
  } catch (err) {
    console.error("Error modifying user_type:", err.message);
  }

  const queries = [
    `CREATE TABLE IF NOT EXISTS customer_addresses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            label VARCHAR(100),
            address TEXT NOT NULL,
            location POINT NOT NULL SRID 4326,
            is_default BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
            SPATIAL INDEX idx_customer_address_location (location)
        )`,
    `CREATE TABLE IF NOT EXISTS driver_ratings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            delivery_id INT NOT NULL,
            driver_id INT NOT NULL,
            customer_id INT NOT NULL,
            rating INT CHECK (rating BETWEEN 1 AND 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
            FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )`,
    `CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            reset_token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_password_reset_email (email)
        )`,
    `DROP PROCEDURE IF EXISTS sp_get_customer_delivery_history`,
    `CREATE PROCEDURE sp_get_customer_delivery_history(
            IN p_customer_id INT
        )
        BEGIN
            SELECT
                d.uuid,
                d.order_number,
                d.delivery_status,
                d.scheduled_time,
                d.actual_arrival,
                dr.id as driver_id,
                CONCAT(u.first_name,' ',u.last_name) as driver_name
            FROM deliveries d
            LEFT JOIN drivers dr ON d.driver_id = dr.id
            LEFT JOIN users u ON dr.user_id = u.id
            WHERE d.customer_id = p_customer_id
            ORDER BY d.created_at DESC;
        END`,
    `DROP PROCEDURE IF EXISTS sp_track_delivery`,
    `CREATE PROCEDURE sp_track_delivery(
            IN p_delivery_uuid VARCHAR(36)
        )
        BEGIN
            SELECT
                d.uuid,
                d.delivery_status,
                d.scheduled_time,
                d.estimated_arrival,
                c.name as customer_name,
                c.address as customer_address,
                dr.id as driver_id,
                CONCAT(u.first_name,' ',u.last_name) as driver_name,
                dr.last_location_lat,
                dr.last_location_lng
            FROM deliveries d
            JOIN customers c ON d.customer_id = c.id
            LEFT JOIN drivers dr ON d.driver_id = dr.id
            LEFT JOIN users u ON dr.user_id = u.id
            WHERE d.uuid = p_delivery_uuid;
        END`,
    `DROP PROCEDURE IF EXISTS sp_submit_driver_rating`,
    `CREATE PROCEDURE sp_submit_driver_rating(
            IN p_delivery_id INT,
            IN p_driver_id INT,
            IN p_customer_id INT,
            IN p_rating INT,
            IN p_comment TEXT
        )
        BEGIN
            INSERT INTO driver_ratings(
                delivery_id,
                driver_id,
                customer_id,
                rating,
                comment
            )
            VALUES(
                p_delivery_id,
                p_driver_id,
                p_customer_id,
                p_rating,
                p_comment
            );

            UPDATE drivers
            SET avg_rating = (
                SELECT AVG(rating)
                FROM driver_ratings
                WHERE driver_id = p_driver_id
            )
            WHERE id = p_driver_id;
        END`,
    `DROP PROCEDURE IF EXISTS sp_get_customer_addresses`,
    `CREATE PROCEDURE sp_get_customer_addresses(
            IN p_customer_id INT
        )
        BEGIN
            SELECT
                id,
                label,
                address,
                ST_X(location) AS lat,
                ST_Y(location) AS lng,
                is_default
            FROM customer_addresses
            WHERE customer_id = p_customer_id;
        END`,
  ];

  try {
    for (let q of queries) {
      try {
        await connection.query(q);
      } catch (err) {
        if (err.code === "ER_DUP_KEYNAME") {
          console.log("Index already exists");
        } else {
          throw err;
        }
      }
    }

    // Add indexes explicitly to handle duplication errors easily
    const indexes = [
      `CREATE INDEX idx_driver_rating_driver ON driver_ratings(driver_id)`,
      `CREATE INDEX idx_driver_rating_customer ON driver_ratings(customer_id)`,
    ];

    for (let idx of indexes) {
      try {
        await connection.query(idx);
      } catch (err) {
        if (err.code !== "ER_DUP_KEYNAME") console.error(err);
      }
    }

    console.log("Customer portal schema applied successfully.");
  } catch (error) {
    console.error("Update failed:", error);
  } finally {
    await connection.end();
  }
}

applyUpdates();

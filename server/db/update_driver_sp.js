require('dotenv').config({path: require('path').resolve(__dirname, '../.env'), override: true});
const mysql = require('mysql2/promise');

async function fixSP() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_SCHEMA,
        multipleStatements: true
    });

    console.log('Updating sp_get_driver_today_deliveries_i18n...');

    const dropSP = "DROP PROCEDURE IF EXISTS sp_get_driver_today_deliveries_i18n;";
    
    // Added d.customer_phone (aliased as phone), and removed status filter to show completed ones too
    const createSP = `
CREATE PROCEDURE sp_get_driver_today_deliveries_i18n(
    IN p_driver_id INT,
    IN p_language_code VARCHAR(10)
)
BEGIN
    SELECT 
        d.uuid,
        d.order_number,
        d.delivery_status,
        d.scheduled_time,
        d.priority_level,
        d.requires_signature,
        d.requires_photo,
        d.route_optimization_data,
        c.name AS customer_name,
        c.address,
        c.phone AS customer_phone,
        ST_X(c.location) AS address_lat,
        ST_Y(c.location) AS address_lng,
        c.delivery_instructions,
        c.preferred_language_code,
        COALESCE((
            SELECT t.translated_text
            FROM translations t
            JOIN translation_keys tk ON t.key_id = tk.id
            JOIN languages l ON t.language_id = l.id
            WHERE tk.key_name = CONCAT('status_', d.delivery_status)
              AND tk.module = 'delivery'
              AND l.code = p_language_code
        ), d.delivery_status) AS status_display,
        TIMESTAMPDIFF(MINUTE, NOW(), d.scheduled_time) AS minutes_until,
        ST_Distance_Sphere(
            point(dr.last_location_lng, dr.last_location_lat),
            c.location
        ) / 1000 AS distance_km
    FROM deliveries d
    JOIN customers c ON d.customer_id = c.id
    JOIN drivers dr ON d.driver_id = dr.id
    WHERE dr.user_id = p_driver_id
      AND DATE(d.scheduled_time) = CURDATE()
    ORDER BY 
        FIELD(d.delivery_status, 'en_route', 'dispatched', 'scheduled', 'delivered', 'failed', 'cancelled'),
        FIELD(d.priority_level, 'high', 'medium', 'low'),
        d.scheduled_time ASC;
END;
    `;

    try {
        await connection.query(dropSP);
        await connection.query(createSP);
        console.log('Stored procedure updated successfully.');
    } catch (err) {
        console.error('Error updating SP:', err);
    } finally {
        await connection.end();
    }
}

fixSP().catch(console.error);

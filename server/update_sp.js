const pool = require('./config/database');

async function updateProc() {
  try {
    await pool.query('DROP PROCEDURE IF EXISTS sp_track_delivery');
    await pool.query(`
      CREATE PROCEDURE sp_track_delivery(
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
              ST_X(c.location) as delivery_lat,
              ST_Y(c.location) as delivery_lng,
              dr.id as driver_id,
              CONCAT(u.first_name, ' ', u.last_name) as driver_name,
              dr.last_location_lat,
              dr.last_location_lng
          FROM deliveries d
          JOIN customers c ON d.customer_id = c.id
          LEFT JOIN drivers dr ON d.driver_id = dr.id
          LEFT JOIN users u ON dr.user_id = u.id
          WHERE d.uuid = p_delivery_uuid;
      END
    `);
    console.log('Procedure updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error updating procedure:', err);
    process.exit(1);
  }
}

updateProc();

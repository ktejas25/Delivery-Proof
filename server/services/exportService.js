const pool = require('../config/database');

/**
 * Export Service
 * Produces structured CSV and JSON operational and delivery reports with tenant isolation.
 */

const generateExport = async (businessId, { type = 'deliveries', format = 'csv', range = '30d' }) => {
  try {
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    if (type === 'deliveries') {
      const [rows] = await pool.query(
        `SELECT 
          d.order_number as "Order Number",
          d.delivery_status as "Status",
          d.priority_level as "Priority",
          d.scheduled_time as "Scheduled Time",
          d.actual_arrival as "Delivered Time",
          c.name as "Customer Name",
          c.phone as "Customer Phone",
          c.address as "Delivery Address",
          CONCAT_WS(' ', u.first_name, u.last_name) as "Assigned Driver",
          dp.verification_score as "Verification Score",
          dp.blockchain_tx_hash as "Blockchain Hash",
          d.created_at as "Created At"
         FROM deliveries d
         JOIN customers c ON d.customer_id = c.id
         LEFT JOIN drivers dr ON d.driver_id = dr.id
         LEFT JOIN users u ON dr.user_id = u.id
         LEFT JOIN delivery_proofs dp ON dp.delivery_id = d.id
         WHERE d.business_id = ? AND d.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY d.created_at DESC`,
        [businessId, days]
      );

      if (format === 'json') {
        return { data: rows, contentType: 'application/json', filename: `deliveries_export_${range}.json` };
      }

      // Format to CSV
      if (rows.length === 0) {
        return { data: 'Order Number,Status,Priority,Customer Name\n', contentType: 'text/csv', filename: `deliveries_export_${range}.csv` };
      }

      const headers = Object.keys(rows[0]).map(h => `"${h}"`).join(',');
      const lines = rows.map(r => 
        Object.values(r).map(val => {
          if (val === null || val === undefined) return '""';
          if (val instanceof Date) return `"${val.toISOString()}"`;
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      );

      const csvContent = [headers, ...lines].join('\n');
      return { data: csvContent, contentType: 'text/csv', filename: `deliveries_export_${range}.csv` };
    }

    if (type === 'drivers') {
      const [rows] = await pool.query(
        `SELECT 
          CONCAT_WS(' ', u.first_name, u.last_name) as "Driver Name",
          u.email as "Email",
          u.phone as "Phone",
          d.license_number as "License Number",
          d.vehicle_type as "Vehicle",
          d.current_status as "Current Status",
          d.avg_rating as "Rating",
          COUNT(DISTINCT del.id) as "Total Deliveries",
          COALESCE(AVG(dp.verification_score), 0) as "Avg Proof Score"
         FROM drivers d
         JOIN users u ON d.user_id = u.id
         LEFT JOIN deliveries del ON del.driver_id = d.id
         LEFT JOIN delivery_proofs dp ON dp.delivery_id = del.id
         WHERE u.business_id = ?
         GROUP BY d.id, u.first_name, u.last_name, u.email, u.phone, d.license_number, d.vehicle_type, d.current_status, d.avg_rating`,
        [businessId]
      );

      if (format === 'json') {
        return { data: rows, contentType: 'application/json', filename: `drivers_export.json` };
      }

      if (rows.length === 0) {
        return { data: 'Driver Name,Email,Status\n', contentType: 'text/csv', filename: `drivers_export.csv` };
      }

      const headers = Object.keys(rows[0]).map(h => `"${h}"`).join(',');
      const lines = rows.map(r => 
        Object.values(r).map(val => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      );

      const csvContent = [headers, ...lines].join('\n');
      return { data: csvContent, contentType: 'text/csv', filename: `drivers_export.csv` };
    }

    throw new Error('Unsupported export type');
  } catch (error) {
    console.error('generateExport error:', error);
    throw error;
  }
};

module.exports = {
  generateExport
};

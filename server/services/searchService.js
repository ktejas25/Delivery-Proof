const pool = require('../config/database');

/**
 * Global Search Service
 * Fast indexed search across orders, deliveries, drivers, customers, and disputes with tenant isolation.
 */

const globalSearch = async (businessId, query) => {
  if (!query || query.trim().length === 0) {
    return {
      deliveries: [],
      orders: [],
      drivers: [],
      customers: [],
      disputes: []
    };
  }

  const searchTerm = `%${query.trim()}%`;

  try {
    // 1. Search Deliveries / Orders
    const [deliveries] = await pool.query(
      `SELECT 
        d.id,
        d.uuid,
        d.order_number,
        d.delivery_status,
        d.scheduled_time,
        d.priority_level,
        c.name as customer_name,
        c.address as customer_address,
        CONCAT_WS(' ', u.first_name, u.last_name) as driver_name
       FROM deliveries d
       JOIN customers c ON d.customer_id = c.id
       LEFT JOIN drivers dr ON d.driver_id = dr.id
       LEFT JOIN users u ON dr.user_id = u.id
       WHERE d.business_id = ? AND (
         d.order_number LIKE ? OR 
         d.uuid LIKE ? OR 
         c.name LIKE ? OR 
         c.address LIKE ? OR
         u.first_name LIKE ? OR
         u.last_name LIKE ?
       )
       ORDER BY d.created_at DESC
       LIMIT 8`,
      [businessId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    // 2. Search Drivers
    const [drivers] = await pool.query(
      `SELECT 
        d.id as driver_id,
        u.uuid,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.email,
        u.phone,
        d.license_number,
        d.vehicle_type,
        d.current_status,
        d.avg_rating
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE u.business_id = ? AND (
         u.first_name LIKE ? OR 
         u.last_name LIKE ? OR 
         u.email LIKE ? OR 
         d.license_number LIKE ?
       )
       LIMIT 6`,
      [businessId, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    // 3. Search Customers
    const [customers] = await pool.query(
      `SELECT 
        id,
        uuid,
        name,
        email,
        phone,
        address,
        total_orders
       FROM customers
       WHERE business_id = ? AND (
         name LIKE ? OR 
         email LIKE ? OR 
         phone LIKE ? OR 
         address LIKE ?
       )
       LIMIT 6`,
      [businessId, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    // 4. Search Disputes
    const [disputes] = await pool.query(
      `SELECT 
        ds.id,
        ds.uuid,
        ds.dispute_type,
        ds.status,
        ds.fraud_score,
        d.order_number,
        c.name as customer_name
       FROM disputes ds
       JOIN deliveries d ON ds.delivery_id = d.id
       JOIN customers c ON d.customer_id = c.id
       WHERE d.business_id = ? AND (
         d.order_number LIKE ? OR 
         ds.dispute_type LIKE ? OR 
         ds.customer_claim LIKE ? OR 
         c.name LIKE ?
       )
       LIMIT 6`,
      [businessId, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    return {
      deliveries: deliveries.map(d => ({
        id: d.id,
        uuid: d.uuid,
        orderNumber: d.order_number,
        status: d.delivery_status,
        scheduledTime: d.scheduled_time,
        priority: d.priority_level,
        customerName: d.customer_name,
        customerAddress: d.customer_address,
        driverName: d.driver_name
      })),
      drivers: drivers.map(dr => ({
        id: dr.driver_id,
        uuid: dr.uuid,
        name: dr.name,
        email: dr.email,
        phone: dr.phone,
        licenseNumber: dr.license_number,
        vehicleType: dr.vehicle_type,
        status: dr.current_status,
        rating: dr.avg_rating
      })),
      customers: customers.map(c => ({
        id: c.id,
        uuid: c.uuid,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        totalOrders: c.total_orders
      })),
      disputes: disputes.map(ds => ({
        id: ds.id,
        uuid: ds.uuid,
        orderNumber: ds.order_number,
        type: ds.dispute_type,
        status: ds.status,
        fraudScore: ds.fraud_score,
        customerName: ds.customer_name
      }))
    };
  } catch (error) {
    console.error('globalSearch error:', error);
    throw error;
  }
};

module.exports = {
  globalSearch
};

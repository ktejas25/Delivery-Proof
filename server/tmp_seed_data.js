const pool = require("./config/database");

async function seed() {
  try {
    const { v4: uuidv4 } = await import("uuid");
    
    // Find a customer or create one
    const [customers] = await pool.query("SELECT id FROM customers LIMIT 1");
    if (customers.length === 0) {
      console.log("No customers found. Please register a customer first.");
      return;
    }
    const customerId = customers[0].id;

    // Find a business
    const [businesses] = await pool.query("SELECT id FROM businesses LIMIT 1");
    const businessId = businesses[0].id;

    // Create 5 deliveries for this customer
    for (let i = 1; i <= 5; i++) {
      const uuid = "DELV-" + Math.random().toString(36).substr(2, 9).toUpperCase();
      const orderNum = "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      const statuses = ['pending', 'scheduled', 'dispatched', 'en_route', 'delivered'];
      const status = statuses[i % statuses.length];

      await pool.query(
        "INSERT INTO deliveries (uuid, business_id, customer_id, order_number, delivery_status, scheduled_time) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))",
        [uuid, businessId, customerId, orderNum, status, i - 2]
      );
      console.log(`Created delivery ${uuid} for customer ${customerId}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

seed();

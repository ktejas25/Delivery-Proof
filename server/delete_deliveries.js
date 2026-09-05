const pool = require("./config/database");

async function deleteDeliveriesData() {
  const connection = await pool.getConnection();
  try {
    console.log("=== PRE-DELETE STATUS ===");
    const [preUsers] = await connection.query("SELECT COUNT(*) as c FROM users");
    const [preDrivers] = await connection.query("SELECT COUNT(*) as c FROM drivers");
    const [preCustomers] = await connection.query("SELECT COUNT(*) as c FROM customers");
    const [preCustAddresses] = await connection.query("SELECT COUNT(*) as c FROM customer_addresses");
    const [preBusinesses] = await connection.query("SELECT COUNT(*) as c FROM businesses");
    const [preDeliveries] = await connection.query("SELECT COUNT(*) as c FROM deliveries");
    const [preProofs] = await connection.query("SELECT COUNT(*) as c FROM delivery_proofs");
    const [prePhotos] = await connection.query("SELECT COUNT(*) as c FROM delivery_photos");
    const [preSignatures] = await connection.query("SELECT COUNT(*) as c FROM delivery_signatures");
    const [preTracking] = await connection.query("SELECT COUNT(*) as c FROM location_tracking");
    const [preDisputes] = await connection.query("SELECT COUNT(*) as c FROM disputes");
    const [preRatings] = await connection.query("SELECT COUNT(*) as c FROM driver_ratings");

    console.log({
      users: preUsers[0].c,
      drivers: preDrivers[0].c,
      customers: preCustomers[0].c,
      customer_addresses: preCustAddresses[0].c,
      businesses: preBusinesses[0].c,
      deliveries: preDeliveries[0].c,
      delivery_proofs: preProofs[0].c,
      delivery_photos: prePhotos[0].c,
      delivery_signatures: preSignatures[0].c,
      location_tracking: preTracking[0].c,
      disputes: preDisputes[0].c,
      driver_ratings: preRatings[0].c,
    });

    console.log("\nStarting deletion of deliveries and related data...");
    await connection.beginTransaction();

    // Disable foreign keys temporarily for clean truncation/deletion order
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    await connection.query("DELETE FROM dispute_comments");
    await connection.query("DELETE FROM disputes");
    await connection.query("DELETE FROM delivery_photos");
    await connection.query("DELETE FROM delivery_signatures");
    await connection.query("DELETE FROM delivery_proofs");
    await connection.query("DELETE FROM location_tracking");
    await connection.query("DELETE FROM driver_ratings");
    await connection.query("DELETE FROM deliveries");
    await connection.query("ALTER TABLE deliveries AUTO_INCREMENT = 1");

    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    await connection.commit();
    console.log("Deletion committed successfully.\n");

    console.log("=== POST-DELETE STATUS ===");
    const [postUsers] = await connection.query("SELECT COUNT(*) as c FROM users");
    const [postDrivers] = await connection.query("SELECT COUNT(*) as c FROM drivers");
    const [postCustomers] = await connection.query("SELECT COUNT(*) as c FROM customers");
    const [postCustAddresses] = await connection.query("SELECT COUNT(*) as c FROM customer_addresses");
    const [postBusinesses] = await connection.query("SELECT COUNT(*) as c FROM businesses");
    const [postDeliveries] = await connection.query("SELECT COUNT(*) as c FROM deliveries");
    const [postProofs] = await connection.query("SELECT COUNT(*) as c FROM delivery_proofs");
    const [postPhotos] = await connection.query("SELECT COUNT(*) as c FROM delivery_photos");
    const [postSignatures] = await connection.query("SELECT COUNT(*) as c FROM delivery_signatures");
    const [postTracking] = await connection.query("SELECT COUNT(*) as c FROM location_tracking");
    const [postDisputes] = await connection.query("SELECT COUNT(*) as c FROM disputes");
    const [postRatings] = await connection.query("SELECT COUNT(*) as c FROM driver_ratings");

    console.log({
      users: postUsers[0].c,
      drivers: postDrivers[0].c,
      customers: postCustomers[0].c,
      customer_addresses: postCustAddresses[0].c,
      businesses: postBusinesses[0].c,
      deliveries: postDeliveries[0].c,
      delivery_proofs: postProofs[0].c,
      delivery_photos: postPhotos[0].c,
      delivery_signatures: postSignatures[0].c,
      location_tracking: postTracking[0].c,
      disputes: postDisputes[0].c,
      driver_ratings: postRatings[0].c,
    });

    console.log("\nSuccess: Deliveries data deleted. Customer and driver accounts safely preserved.");
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error("Error during deletion, rolled back:", err);
    process.exit(1);
  } finally {
    connection.release();
  }
}

deleteDeliveriesData();

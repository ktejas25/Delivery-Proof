const pool = require('../config/database');
const crypto = require('crypto');

async function seedAdminDashboard() {
  console.log('--- Starting Admin Dashboard Database Seed ---');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get existing businesses
    const [businesses] = await connection.query('SELECT id, name FROM businesses');
    if (businesses.length === 0) {
      console.log('No businesses found. Please create a business first.');
      return;
    }

    for (const biz of businesses) {
      const bizId = biz.id;
      console.log(`Seeding data for business ID: ${bizId} (${biz.name})...`);

      // Ensure drivers exist
      const [drivers] = await connection.query(
        `SELECT d.id as driver_id, d.user_id, u.first_name, u.last_name, u.email 
         FROM drivers d 
         JOIN users u ON d.user_id = u.id 
         WHERE u.business_id = ?`,
        [bizId]
      );

      // If business has no drivers, create a couple of drivers
      let driverList = [...drivers];
      if (driverList.length === 0) {
        console.log(`Creating demo drivers for business ${bizId}...`);
        const demoDrivers = [
          { first: 'Rahul', last: 'Sharma', email: `rahul.driver.${bizId}@deliveryproof.io`, phone: '+91 98201 12345', license: 'MH12AB1001', vehicle: 'Van', lat: 18.5204, lng: 73.8567, status: 'available' },
          { first: 'Amit', last: 'Patil', email: `amit.driver.${bizId}@deliveryproof.io`, phone: '+91 98201 23456', license: 'MH12CD2002', vehicle: 'Motorcycle', lat: 18.5314, lng: 73.8446, status: 'on_delivery' },
          { first: 'Priya', last: 'Deshmukh', email: `priya.driver.${bizId}@deliveryproof.io`, phone: '+91 98201 34567', license: 'MH12EF3003', vehicle: 'EV Cargo', lat: 18.5089, lng: 73.8052, status: 'available' },
          { first: 'Vikram', last: 'Singh', email: `vikram.driver.${bizId}@deliveryproof.io`, phone: '+91 98201 45678', license: 'MH12GH4004', vehicle: 'Van', lat: 18.5590, lng: 73.7868, status: 'available' },
          { first: 'Sneha', last: 'Kulkarni', email: `sneha.driver.${bizId}@deliveryproof.io`, phone: '+91 98201 56789', license: 'MH12IJ5005', vehicle: 'Scooter', lat: 18.4900, lng: 73.8200, status: 'offline' }
        ];

        for (const d of demoDrivers) {
          const { v4: uuidv4 } = await import('uuid');
          const userUuid = uuidv4();
          const hash = '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.qH0.6r11e.sP5u09bE39gD7e8c3.d6C'; // Password123!
          const [uRes] = await connection.query(
            `INSERT INTO users (uuid, business_id, email, phone, password_hash, first_name, last_name, user_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'driver')
             ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
            [userUuid, bizId, d.email, d.phone, hash, d.first, d.last]
          );
          const userId = uRes.insertId;

          const [dRes] = await connection.query(
            `INSERT INTO drivers (user_id, license_number, vehicle_type, last_location_lat, last_location_lng, last_location_update, is_available, current_status, avg_rating, total_deliveries)
             VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, 4.85, 120)
             ON DUPLICATE KEY UPDATE last_location_lat=VALUES(last_location_lat), last_location_lng=VALUES(last_location_lng), current_status=VALUES(current_status)`,
            [userId, d.license, d.vehicle, d.lat, d.lng, d.status === 'offline' ? 0 : 1, d.status]
          );
          driverList.push({ driver_id: dRes.insertId || userId, user_id: userId, first_name: d.first, last_name: d.last });
        }
      }

      // Update existing driver coordinates so they show on live map
      const sampleCoords = [
        { lat: 18.5204, lng: 73.8567, status: 'available' },
        { lat: 18.5314, lng: 73.8446, status: 'on_delivery' },
        { lat: 18.5089, lng: 73.8052, status: 'available' },
        { lat: 18.5590, lng: 73.7868, status: 'on_delivery' },
        { lat: 18.4900, lng: 73.8200, status: 'available' },
      ];
      for (let i = 0; i < driverList.length; i++) {
        const coord = sampleCoords[i % sampleCoords.length];
        await connection.query(
          `UPDATE drivers SET 
             last_location_lat = ?, 
             last_location_lng = ?, 
             last_location_update = NOW(), 
             current_status = ?, 
             is_available = ?,
             avg_rating = GREATEST(4.2, COALESCE(avg_rating, 4.8))
           WHERE id = ?`,
          [coord.lat, coord.lng, coord.status, coord.status === 'available' ? 1 : 0, driverList[i].driver_id]
        );
      }

      // Ensure customers exist
      let [customers] = await connection.query('SELECT id, name, address FROM customers WHERE business_id = ?', [bizId]);
      if (customers.length < 5) {
        console.log(`Creating demo customers for business ${bizId}...`);
        const demoCustomers = [
          { name: 'Aditi Rao', email: `aditi.${bizId}@gmail.com`, phone: '+91 99881 11223', address: 'Flat 402, Green Valley Apts, Kothrud, Pune', lat: 18.5074, lng: 73.8077 },
          { name: 'Rajesh Nair', email: `rajesh.${bizId}@gmail.com`, phone: '+91 99882 22334', address: 'B-12, Cyber City Towers, Magarpatta, Pune', lat: 18.5158, lng: 73.9272 },
          { name: 'Sunita Joshi', email: `sunita.${bizId}@gmail.com`, phone: '+91 99883 33445', address: 'Plot 88, Baner Road, Near Balewadi High St, Pune', lat: 18.5679, lng: 73.7769 },
          { name: 'Karan Mehra', email: `karan.${bizId}@gmail.com`, phone: '+91 99884 44556', address: 'Shop 4, Phoenix Marketcity, Viman Nagar, Pune', lat: 18.5626, lng: 73.9168 },
          { name: 'Deepak Verma', email: `deepak.${bizId}@gmail.com`, phone: '+91 99885 55667', address: 'A-301, Amanora Gateway Towers, Hadapsar, Pune', lat: 18.5081, lng: 73.9317 },
          { name: 'Pooja Hegde', email: `pooja.${bizId}@gmail.com`, phone: '+91 99886 66778', address: '12 Shivaji Nagar, FC Road, Pune', lat: 18.5308, lng: 73.8475 }
        ];

        for (const c of demoCustomers) {
          const { v4: uuidv4 } = await import('uuid');
          const custUuid = uuidv4();
          await connection.query(
            `INSERT INTO customers (uuid, business_id, name, email, phone, address, location, preferred_language_code, total_orders)
             VALUES (?, ?, ?, ?, ?, ?, ST_GeomFromText('POINT(${c.lat} ${c.lng})', 4326), 'en', 12)`,
            [custUuid, bizId, c.name, c.email, c.phone, c.address]
          );
        }
        [customers] = await connection.query('SELECT id, name, address FROM customers WHERE business_id = ?', [bizId]);
      }

      // Check deliveries count
      const [existingDeliveries] = await connection.query(
        'SELECT COUNT(*) as count FROM deliveries WHERE business_id = ?',
        [bizId]
      );

      console.log(`Current deliveries for business ${bizId}: ${existingDeliveries[0].count}`);

      // Seed historical deliveries across the last 30 days
      const targetHistoricalDeliveries = 45;
      if (existingDeliveries[0].count < targetHistoricalDeliveries) {
        console.log(`Seeding realistic deliveries and proofs for business ${bizId}...`);
        const statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'failed', 'disputed', 'en_route', 'dispatched', 'scheduled'];
        const priorities = ['low', 'medium', 'high', 'medium', 'high'];

        const { v4: uuidv4 } = await import('uuid');

        for (let i = 0; i < 40; i++) {
          const delUuid = uuidv4();
          const customer = customers[i % customers.length];
          const driver = driverList.length > 0 ? driverList[i % driverList.length] : null;
          const status = statuses[i % statuses.length];
          const priority = priorities[i % priorities.length];

          // Distribute dates over the last 30 days
          const daysAgo = Math.floor((i / 40) * 28);
          const hoursAgo = (i % 24);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          date.setHours(date.getHours() - hoursAgo);
          const dateStr = date.toISOString().slice(0, 19).replace('T', ' ');

          const isDelivered = status === 'delivered';
          const isDisputed = status === 'disputed';
          const isFailed = status === 'failed';

          const actualArrival = (isDelivered || isDisputed) ? dateStr : null;
          const photoUrl = (isDelivered || isDisputed) 
            ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60' 
            : null;
          const signatureUrl = (isDelivered || isDisputed)
            ? 'https://upload.wikimedia.org/wikipedia/commons/f/fa/John_Hancock_signature.svg'
            : null;
          const proofHash = (isDelivered || isDisputed)
            ? crypto.createHash('sha256').update(`proof-${delUuid}-${i}`).digest('hex')
            : null;

          const [ins] = await connection.query(
            `INSERT INTO deliveries (
              uuid, business_id, customer_id, driver_id, order_number, 
              delivery_status, scheduled_time, estimated_arrival, actual_arrival, 
              delivery_notes, priority_level, requires_signature, requires_photo,
              photo_url, signature_url, gps_lat, gps_lng, proof_hash, recorded_at,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              delUuid, bizId, customer.id, driver ? driver.driver_id : null,
              `ORD-${2000 + i}`, status, dateStr, dateStr, actualArrival,
              `Package handling instructions for ${customer.name}`, priority, 1, 1,
              photoUrl, signatureUrl, 18.5204 + (Math.random() * 0.05 - 0.025), 73.8567 + (Math.random() * 0.05 - 0.025),
              proofHash, actualArrival, dateStr, dateStr
            ]
          );

          const deliveryId = ins.insertId;

          // Insert delivery proofs for delivered / disputed items
          if (isDelivered || isDisputed) {
            const verificationScore = isDisputed ? 52.5 : (85 + Math.floor(Math.random() * 14));
            const proofData = JSON.stringify({
              photo_url: photoUrl,
              signature_url: signatureUrl,
              gps_lat: 18.5204,
              gps_lng: 73.8567,
              verified_at: dateStr,
              has_photo: 1,
              has_signature: 1
            });

            const [pRes] = await connection.query(
              `INSERT INTO delivery_proofs (delivery_id, proof_type, proof_data, verification_score, blockchain_tx_hash, blockchain_confirmed, created_at)
               VALUES (?, 'comprehensive', ?, ?, ?, 1, ?)`,
              [deliveryId, proofData, verificationScore, `0x${proofHash.substring(0, 40)}`, dateStr]
            );

            const proofId = pRes.insertId;

            await connection.query(
              `INSERT INTO delivery_photos (proof_id, s3_url, s3_key, gps_lat, gps_lng, image_hash, created_at)
               VALUES (?, ?, 'cloudinary_seed', 18.5204, 73.8567, ?, ?)`,
              [proofId, photoUrl, proofHash, dateStr]
            );

            await connection.query(
              `INSERT INTO delivery_signatures (proof_id, s3_url, signer_type, verification_score, created_at)
               VALUES (?, ?, 'customer', ?, ?)`,
              [proofId, signatureUrl, verificationScore, dateStr]
            );
          }

          // Insert disputes for disputed deliveries
          if (isDisputed) {
            const disputeUuid = uuidv4();
            const disputeTypes = ['damaged', 'wrong_item', 'not_received', 'late'];
            const disputeType = disputeTypes[i % disputeTypes.length];
            const fraudScore = 65 + (i % 30);

            const [dispRes] = await connection.query(
              `INSERT INTO disputes (uuid, delivery_id, dispute_type, customer_claim, status, fraud_score, created_at)
               VALUES (?, ?, ?, ?, 'open', ?, ?)`,
              [
                disputeUuid, deliveryId, disputeType,
                `Customer reported issue with order #ORD-${2000 + i}: ${disputeType.replace('_', ' ')}. Requesting investigation.`,
                fraudScore, dateStr
              ]
            );

            // Audit log for dispute
            await connection.query(
              `INSERT INTO audit_logs (business_id, user_id, user_type, action, entity_type, entity_id, new_values, created_at)
               VALUES (?, ?, 'customer', 'DISPUTE_FILED', 'dispute', ?, ?, ?)`,
              [bizId, customer.id, dispRes.insertId, JSON.stringify({ dispute_type: disputeType, fraud_score: fraudScore }), dateStr]
            );
          }

          // Add audit logs for delivered & failed deliveries
          if (isDelivered) {
            await connection.query(
              `INSERT INTO audit_logs (business_id, user_id, user_type, action, entity_type, entity_id, new_values, created_at)
               VALUES (?, ?, 'driver', 'DELIVERY_COMPLETED', 'delivery', ?, ?, ?)`,
              [bizId, driver ? driver.user_id : 1, deliveryId, JSON.stringify({ status: 'delivered', order_number: `ORD-${2000 + i}` }), dateStr]
            );
          } else if (isFailed) {
            await connection.query(
              `INSERT INTO audit_logs (business_id, user_id, user_type, action, entity_type, entity_id, new_values, created_at)
               VALUES (?, ?, 'driver', 'DELIVERY_FAILED', 'delivery', ?, ?, ?)`,
              [bizId, driver ? driver.user_id : 1, deliveryId, JSON.stringify({ reason: 'Customer unavailable at location', status: 'failed' }), dateStr]
            );
          }
        }
      }

      // Populate location tracking points for active drivers
      console.log(`Populating live telemetry & tracking breadcrumbs for drivers...`);
      for (const d of driverList) {
        for (let step = 0; step < 12; step++) {
          const trackTime = new Date(Date.now() - (12 - step) * 5 * 60 * 1000);
          const trackLat = 18.5204 + (step * 0.003) + (Math.random() * 0.001);
          const trackLng = 73.8567 + (step * 0.002) + (Math.random() * 0.001);
          const speed = 25 + Math.floor(Math.random() * 20);

          const [delRows] = await connection.query(
            'SELECT id FROM deliveries WHERE business_id = ? AND driver_id = ? LIMIT 1',
            [bizId, d.driver_id]
          );
          const sampleDelId = delRows.length > 0 ? delRows[0].id : 1;

          await connection.query(
            `INSERT INTO location_tracking (delivery_id, driver_id, latitude, longitude, accuracy, speed, heading, recorded_at)
             VALUES (?, ?, ?, ?, 5.0, ?, ?, ?)`,
            [sampleDelId, d.driver_id, trackLat, trackLng, speed, 90.0, trackTime]
          );
        }
      }

      // Populate daily analytics summary table for past 30 days
      console.log(`Generating delivery_analytics_daily summary...`);
      for (let day = 0; day < 30; day++) {
        const d = new Date();
        d.setDate(d.getDate() - day);
        const dayStr = d.toISOString().slice(0, 10);

        const [dailyStats] = await connection.query(
          `SELECT 
             COUNT(*) as total,
             SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) as successful,
             SUM(CASE WHEN delivery_status = 'failed' THEN 1 ELSE 0 END) as failed,
             SUM(CASE WHEN delivery_status = 'disputed' THEN 1 ELSE 0 END) as disputed
           FROM deliveries 
           WHERE business_id = ? AND DATE(scheduled_time) = ?`,
          [bizId, dayStr]
        );

        const total = dailyStats[0].total || 0;
        const successful = dailyStats[0].successful || 0;
        const failed = dailyStats[0].failed || 0;
        const disputed = dailyStats[0].disputed || 0;
        const savings = disputed > 0 ? (disputed * 120.0) : (successful * 15.0);

        await connection.query(
          `INSERT INTO delivery_analytics_daily (business_id, date, total_deliveries, successful_deliveries, failed_deliveries, disputed_deliveries, avg_delivery_time_minutes, total_distance_km, fraud_prevention_savings)
           VALUES (?, ?, ?, ?, ?, ?, 32.5, ?, ?)
           ON DUPLICATE KEY UPDATE 
             total_deliveries = VALUES(total_deliveries),
             successful_deliveries = VALUES(successful_deliveries),
             failed_deliveries = VALUES(failed_deliveries),
             disputed_deliveries = VALUES(disputed_deliveries),
             fraud_prevention_savings = VALUES(fraud_prevention_savings)`,
          [bizId, dayStr, total, successful, failed, disputed, total * 5.4, savings]
        );
      }
    }

    await connection.commit();
    console.log('--- Admin Dashboard Database Seed Successfully Completed! ---');
  } catch (error) {
    await connection.rollback();
    console.error('Seed script error:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedAdminDashboard();

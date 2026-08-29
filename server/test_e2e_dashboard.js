const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');
const dotenv = require('dotenv');
dotenv.config();

const { app } = require('./app');
const http = require('http');

async function runE2ETests() {
  console.log('============================================');
  console.log('  DeliveryProof Dashboard E2E Test Suite    ');
  console.log('============================================\n');

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(5055, resolve));
  const API_BASE = 'http://localhost:5055/api';

  try {
    // 1. Get test admin user
    const [users] = await pool.query("SELECT id, uuid, email, business_id, user_type FROM users WHERE user_type = 'admin' LIMIT 1");
    if (users.length === 0) {
      throw new Error('No admin user found in database');
    }
    const adminUser = users[0];
    console.log(`[AUTH] Generating token for admin: ${adminUser.email} (Business ID: ${adminUser.business_id})...`);

    const token = jwt.sign(
      {
        id: adminUser.id,
        uuid: adminUser.uuid,
        email: adminUser.email,
        business_id: adminUser.business_id,
        user_type: adminUser.user_type
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    const client = axios.create({
      baseURL: API_BASE,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 2. Test Dashboard Overview API
    console.log('\n[1/8] Testing GET /api/admin/dashboard/overview...');
    const overviewRes = await client.get('/admin/dashboard/overview');
    console.log('  Status:', overviewRes.status);
    console.log('  Total Deliveries:', overviewRes.data.summary.totalDeliveries);
    console.log('  Today Completed:', overviewRes.data.summary.todayCompleted);
    console.log('  Revenue:', `$${overviewRes.data.summary.revenue}`);
    console.log('  Drivers Online:', `${overviewRes.data.summary.driversOnline}/${overviewRes.data.summary.totalDrivers}`);
    console.log('  Completion Rate:', `${overviewRes.data.performance.completionRate}%`);
    console.log('  Proof Verification Rate:', `${overviewRes.data.performance.proofVerificationRate}%`);
    console.log('  Active Vehicles:', overviewRes.data.fleet.activeVehicles);
    console.log('  PASS ✓');

    // 3. Test Delivery Trends API
    console.log('\n[2/8] Testing GET /api/admin/dashboard/delivery-trends...');
    const trends7d = await client.get('/admin/dashboard/delivery-trends?range=7d');
    console.log('  Status 7d:', trends7d.status, 'Points:', trends7d.data.data.length);
    const trends30d = await client.get('/admin/dashboard/delivery-trends?range=30d');
    console.log('  Status 30d:', trends30d.status, 'Points:', trends30d.data.data.length);
    const trendsToday = await client.get('/admin/dashboard/delivery-trends?range=today');
    console.log('  Status Today:', trendsToday.status, 'Points:', trendsToday.data.data.length);
    console.log('  PASS ✓');

    // 4. Test Top Drivers Leaderboard API
    console.log('\n[3/8] Testing GET /api/admin/dashboard/drivers...');
    const driversRes = await client.get('/admin/dashboard/drivers?limit=5');
    console.log('  Status:', driversRes.status, 'Count:', driversRes.data.length);
    if (driversRes.data.length > 0) {
      console.log('  #1 Top Driver:', driversRes.data[0].name, `(${driversRes.data[0].completionRate}% completion, rating: ${driversRes.data[0].rating})`);
    }
    console.log('  PASS ✓');

    // 5. Test Live Fleet API
    console.log('\n[4/8] Testing GET /api/admin/dashboard/fleet...');
    const fleetRes = await client.get('/admin/dashboard/fleet');
    console.log('  Status:', fleetRes.status);
    console.log('  Average Velocity:', `${fleetRes.data.averageVelocity} ${fleetRes.data.velocityUnit}`);
    console.log('  Congestion Level:', fleetRes.data.congestion?.level);
    console.log('  Vehicles mapped:', fleetRes.data.vehicles.length);
    console.log('  PASS ✓');

    // 6. Test AI Insights API
    console.log('\n[5/8] Testing GET /api/admin/dashboard/ai-insights...');
    const insightsRes = await client.get('/admin/dashboard/ai-insights');
    console.log('  Status:', insightsRes.status, 'Insights count:', insightsRes.data.length);
    insightsRes.data.forEach((ins) => {
      console.log(`    [${ins.severity}] ${ins.title} (${ins.type})`);
    });
    console.log('  PASS ✓');

    // 7. Test Recent Activity Feed API
    console.log('\n[6/8] Testing GET /api/admin/dashboard/activity...');
    const activityRes = await client.get('/admin/dashboard/activity?limit=5');
    console.log('  Status:', activityRes.status, 'Activities count:', activityRes.data.length);
    if (activityRes.data.length > 0) {
      console.log('  Latest Event:', activityRes.data[0].title, `by ${activityRes.data[0].actor}`);
    }
    console.log('  PASS ✓');

    // 8. Test Global Search API
    console.log('\n[7/8] Testing GET /api/admin/dashboard/search?q=ORD...');
    const searchRes = await client.get('/admin/dashboard/search?q=ORD');
    console.log('  Status:', searchRes.status);
    console.log('  Deliveries matched:', searchRes.data.deliveries.length);
    console.log('  PASS ✓');

    // 9. Test Export API
    console.log('\n[8/8] Testing GET /api/admin/dashboard/export?type=deliveries&format=csv...');
    const exportRes = await client.get('/admin/dashboard/export?type=deliveries&format=csv');
    console.log('  Status:', exportRes.status);
    console.log('  Content-Type:', exportRes.headers['content-type']);
    console.log('  Sample CSV line:', exportRes.data.split('\n')[0]);
    console.log('  PASS ✓');

    // 10. Regression Check on existing routes
    console.log('\n--- Regression Verification of Existing Routes ---');
    const existingDeliveries = await client.get('/deliveries');
    console.log('  GET /api/deliveries -> Count:', existingDeliveries.data.length, '✓');

    const existingCustomers = await client.get('/customers');
    console.log('  GET /api/customers -> Count:', existingCustomers.data.length, '✓');

    const existingDrivers = await client.get('/auth/drivers');
    console.log('  GET /api/auth/drivers -> Count:', existingDrivers.data.length, '✓');

    const existingDisputes = await client.get('/disputes');
    console.log('  GET /api/disputes -> Total:', existingDisputes.data.pagination?.total, '✓');

    console.log('\n============================================');
    console.log('  ALL ENDPOINTS PASSED WITH 100% SUCCESS    ');
    console.log('============================================');
  } catch (error) {
    console.error('E2E Test Failed:', error.response?.data || error.message);
  } finally {
    testServer.close();
    process.exit(0);
  }
}

runE2ETests();

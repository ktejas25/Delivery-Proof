const pool = require("../config/database");

const updateLocation = async (req, res) => {
  const { id: user_id } = req.user;
  const { lat, lng } = req.body;

  try {
    await pool.query(
      `UPDATE drivers 
             SET last_location_lat = ?, 
                 last_location_lng = ?, 
                 last_location_update = NOW(),
                 current_status = 'available',
                 is_available = TRUE
             WHERE user_id = ?`,
      [lat, lng, user_id],
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to update driver location:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getDriverPerformance = async (req, res) => {
  const { uuid } = req.params;

  try {
    // 1. Get Driver Info & Summary
    const [driverRows] = await pool.query(
      `SELECT d.id, d.user_id, d.total_deliveries, d.avg_rating, d.current_status,
              u.first_name, u.last_name
       FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE u.uuid = ?`,
      [uuid],
    );

    if (driverRows.length === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const driver = driverRows[0];
    const driverId = driver.id;

    // Summary aggregation dynamically replacing drivers.total_deliveries dependencies
    const [summaryRows] = await pool.query(
      `SELECT 
        COUNT(DISTINCT d.id) as totalDeliveries,
        COUNT(DISTINCT ds.id) as disputesCount,
        AVG(dp.verification_score) as avgProofScore
       FROM deliveries d
       LEFT JOIN delivery_proofs dp ON d.id = dp.delivery_id
       LEFT JOIN disputes ds ON d.id = ds.delivery_id
       WHERE d.driver_id = ?`,
      [driverId],
    );

    // Get distance from analytics or tracking (placeholder for now, or sum from tracking)
    // For now, let's just use 0 if not easily available or sum it from analytics
    const [distanceRows] = await pool.query(
      `SELECT SUM(total_distance_km) as totalDistance
         FROM delivery_analytics_daily
         WHERE business_id = (SELECT business_id FROM users WHERE id = ?)`,
      [driver.user_id],
    );

    // Calculate On-Time Rate (approximate based on estimated vs actual arrival)
    const [onTimeRows] = await pool.query(
      `SELECT 
            (COUNT(CASE WHEN actual_arrival <= estimated_arrival THEN 1 END) * 100.0 / COUNT(*)) as onTimeRate
         FROM deliveries
         WHERE driver_id = ? AND actual_arrival IS NOT NULL AND estimated_arrival IS NOT NULL`,
      [driverId],
    );

    const summary = {
      totalDeliveries: parseInt(summaryRows[0]?.totalDeliveries) || 0,
      avgRating: parseFloat(driver.avg_rating) || 0,
      onTimeRate: parseFloat(onTimeRows[0]?.onTimeRate) || 0,
      avgProofScore: parseFloat(summaryRows[0]?.avgProofScore) || 0,
      disputesCount: parseInt(summaryRows[0]?.disputesCount) || 0,
      totalDistanceKm: parseFloat(distanceRows[0]?.totalDistance) || 0,
      currentStatus: driver.current_status,
    };

    // 2. Performance History (dynamic aggregation by month)
    const [history] = await pool.query(
      `SELECT 
        DATE_FORMAT(d.created_at, '%Y-%m-01') as periodStart,
        LAST_DAY(d.created_at) as periodEnd,
        COUNT(DISTINCT d.id) as deliveries,
        (COUNT(DISTINCT CASE WHEN d.actual_arrival <= d.estimated_arrival THEN d.id END) * 100.0 / NULLIF(COUNT(DISTINCT d.id), 0)) as onTimeRate,
        AVG(dp.verification_score) as proofScoreAvg,
        ? as ratingAvg,
        COUNT(DISTINCT ds.id) as disputes
       FROM deliveries d
       LEFT JOIN delivery_proofs dp ON d.id = dp.delivery_id
       LEFT JOIN disputes ds ON d.id = ds.delivery_id
       WHERE d.driver_id = ?
       GROUP BY periodStart, periodEnd
       ORDER BY periodStart DESC
       LIMIT 12`,
      [parseFloat(driver.avg_rating) || 0, driverId],
    );

    // 3. Recent Deliveries (last 20)
    const [recentDeliveries] = await pool.query(
      `SELECT 
        d.uuid,
        d.order_number as orderNumber,
        c.name as customerName,
        c.address,
        d.delivery_status as status,
        d.actual_arrival as deliveredAt,
        dp.verification_score as proofScore,
        EXISTS(SELECT 1 FROM disputes WHERE delivery_id = d.id) as hasDispute
       FROM deliveries d
       JOIN customers c ON d.customer_id = c.id
       LEFT JOIN delivery_proofs dp ON d.id = dp.delivery_id
       WHERE d.driver_id = ?
       ORDER BY d.created_at DESC
       LIMIT 20`,
      [driverId],
    );

    // 4. Risk Alerts (score < 40)
    const [riskAlerts] = await pool.query(
      `SELECT 
        'LOW_PROOF_SCORE' as type,
        d.order_number as orderNumber,
        dp.verification_score as score
       FROM delivery_proofs dp
       JOIN deliveries d ON dp.delivery_id = d.id
       WHERE d.driver_id = ? AND dp.verification_score < 40`,
      [driverId],
    );

    // 5. Route History (last 100 points)
    const [routeHistory] = await pool.query(
      `SELECT 
        latitude as lat,
        longitude as lng,
        recorded_at as timestamp
       FROM location_tracking
       WHERE driver_id = ?
       ORDER BY recorded_at DESC
       LIMIT 100`,
      [driverId],
    );

    res.json({
      summary,
      history,
      recentDeliveries,
      riskAlerts,
      routeHistory,
    });
  } catch (error) {
    console.error("Failed to fetch driver performance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { updateLocation, getDriverPerformance };

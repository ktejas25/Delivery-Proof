const pool = require('../config/database');

const getDashboardStats = async (business_id) => {
    try {
        // 1. Get KPIs from daily table (primary source)
        const [kpiRows] = await pool.query(
            `SELECT 
                SUM(total_deliveries) as total_deliveries,
                AVG(successful_deliveries / NULLIF(total_deliveries, 0)) * 100 as success_rate,
                SUM(fraud_prevention_savings) as savings
             FROM delivery_analytics_daily 
             WHERE business_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
            [business_id]
        );

        let kpis = kpiRows[0];

        // 2. Fallback: If daily table is empty, aggregate from primary tables
        if (!kpis || kpis.total_deliveries === null) {
            console.log(`Analytics fallback triggered for business_id: ${business_id}`);
            const [deliveryCounts] = await pool.query(
                `SELECT 
                    COUNT(*) as total_deliveries,
                    SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) * 100 as success_rate
                 FROM deliveries 
                 WHERE business_id = ?`,
                [business_id]
            );
            
            const [driverCount] = await pool.query(
                'SELECT COUNT(*) as active_drivers FROM users WHERE business_id = ? AND user_type = "driver" AND is_active = 1',
                [business_id]
            );

            kpis = {
                total_deliveries: deliveryCounts[0].total_deliveries || 0,
                success_rate: deliveryCounts[0].success_rate || 0,
                savings: 0,
                active_drivers: driverCount[0].active_drivers || 0
            };
        }

        // 3. Get Chart Data
        let [chartRows] = await pool.query(
            `SELECT date, total_deliveries, successful_deliveries 
             FROM delivery_analytics_daily 
             WHERE business_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             ORDER BY date ASC`,
            [business_id]
        );

        if (chartRows.length === 0) {
            // Aggregate from deliveries for the last 7 days
            const [aggregatedChart] = await pool.query(
                `SELECT 
                    DATE(scheduled_time) as date, 
                    COUNT(*) as total_deliveries,
                    SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) as successful_deliveries
                 FROM deliveries 
                 WHERE business_id = ? AND scheduled_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                 GROUP BY DATE(scheduled_time)
                 ORDER BY date ASC`,
                [business_id]
            );
            chartRows = aggregatedChart;
        }

        // 4. Get Recent Deliveries for activity feed
        const [recentDeliveries] = await pool.query(
            `SELECT d.order_number, d.delivery_status, d.updated_at, c.name as customer_name
             FROM deliveries d
             JOIN customers c ON d.customer_id = c.id
             WHERE d.business_id = ?
             ORDER BY d.updated_at DESC
             LIMIT 5`,
            [business_id]
        );

        return {
            kpis,
            chart: chartRows,
            recent: recentDeliveries
        };
    } catch (error) {
        console.error('Analytics fetch failed', error);
        throw error;
    }
};

module.exports = {
    getDashboardStats
};

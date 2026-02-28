const { getDashboardStats } = require('../services/analyticsService');

const getStats = async (req, res) => {
    try {
        const stats = await getDashboardStats(req.user.business_id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getStats
};

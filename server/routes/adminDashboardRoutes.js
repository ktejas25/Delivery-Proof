const express = require('express');
const {
  getDashboardOverviewHandler,
  getDeliveryTrendsHandler,
  getTopDriversHandler,
  getFleetHandler,
  getAiInsightsHandler,
  getRecentActivityHandler,
  globalSearchHandler,
  exportDataHandler
} = require('../controllers/adminDashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Enforce authentication on all admin dashboard routes
router.use(authenticateToken);
router.use(authorizeRoles('admin', 'manager', 'analyst', 'support'));

// Operations Command Center Endpoints
router.get('/overview', getDashboardOverviewHandler);
router.get('/delivery-trends', getDeliveryTrendsHandler);
router.get('/drivers', getTopDriversHandler);
router.get('/fleet', getFleetHandler);
router.get('/ai-insights', getAiInsightsHandler);
router.get('/activity', getRecentActivityHandler);
router.get('/search', globalSearchHandler);
router.get('/export', exportDataHandler);
router.post('/export', exportDataHandler);

module.exports = router;

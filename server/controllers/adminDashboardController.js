const {
  getOverview,
  getDeliveryTrends,
  getTopDrivers,
  getRecentActivity
} = require('../services/dashboardService');
const { getFleetOverview } = require('../services/fleetService');
const { getOperationalInsights } = require('../services/insightService');
const { globalSearch } = require('../services/searchService');
const { generateExport } = require('../services/exportService');

const getDashboardOverviewHandler = async (req, res) => {
  const { business_id } = req.user;
  try {
    const overview = await getOverview(business_id);
    const fleet = await getFleetOverview(business_id);
    res.json({
      ...overview,
      fleet
    });
  } catch (error) {
    console.error('getDashboardOverviewHandler error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getDeliveryTrendsHandler = async (req, res) => {
  const { business_id } = req.user;
  const { range, startDate, endDate } = req.query;
  try {
    const trends = await getDeliveryTrends(business_id, { range, startDate, endDate });
    res.json(trends);
  } catch (error) {
    console.error('getDeliveryTrendsHandler error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getTopDriversHandler = async (req, res) => {
  const { business_id } = req.user;
  const { limit = 5 } = req.query;
  try {
    const drivers = await getTopDrivers(business_id, limit);
    res.json(drivers);
  } catch (error) {
    console.error('getTopDriversHandler error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getFleetHandler = async (req, res) => {
  const { business_id } = req.user;
  try {
    const fleet = await getFleetOverview(business_id);
    res.json(fleet);
  } catch (error) {
    console.error('getFleetHandler error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getAiInsightsHandler = async (req, res) => {
  const { business_id } = req.user;
  try {
    const insights = await getOperationalInsights(business_id);
    res.json(insights);
  } catch (error) {
    console.error('getAiInsightsHandler error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getRecentActivityHandler = async (req, res) => {
  const { business_id } = req.user;
  const { limit = 10, page = 1, filter = 'all' } = req.query;
  try {
    const result = await getRecentActivity(business_id, { page, limit, filter });
    res.json(result);
  } catch (error) {
    console.error('getRecentActivityHandler error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const globalSearchHandler = async (req, res) => {
  const { business_id } = req.user;
  const { q } = req.query;
  try {
    const results = await globalSearch(business_id, q);
    res.json(results);
  } catch (error) {
    console.error('globalSearchHandler error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const exportDataHandler = async (req, res) => {
  const { business_id } = req.user;
  const { type = 'deliveries', format = 'csv', range = '30d' } = req.body || req.query;
  try {
    const result = await generateExport(business_id, { type, format, range });
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    if (format === 'json') {
      res.json(result.data);
    } else {
      res.send(result.data);
    }
  } catch (error) {
    console.error('exportDataHandler error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getDashboardOverviewHandler,
  getDeliveryTrendsHandler,
  getTopDriversHandler,
  getFleetHandler,
  getAiInsightsHandler,
  getRecentActivityHandler,
  globalSearchHandler,
  exportDataHandler
};

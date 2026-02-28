const express = require('express');
const { getStats } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);
router.get('/stats', getStats);

module.exports = router;

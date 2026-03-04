const express = require('express');
const { updateLocation } = require('../controllers/driverController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.post('/location', updateLocation);

module.exports = router;

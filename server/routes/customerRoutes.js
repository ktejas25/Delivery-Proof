const express = require('express');
const { getCustomers, createCustomer } = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getCustomers);
router.post('/', createCustomer);

module.exports = router;

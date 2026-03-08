const express = require('express');
const { getCustomers, createCustomer, updateCustomer } = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);

module.exports = router;

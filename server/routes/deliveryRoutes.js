const express = require('express');
const { getDeliveries, getDeliveryByUuid, getDriverDeliveries, createDelivery, updateDelivery, updateDeliveryDriver, updateDeliveryStatus } = require('../controllers/deliveryController');
const { submitProof } = require('../controllers/proofController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/', getDeliveries);
router.get('/driver', getDriverDeliveries);
router.get('/:uuid', getDeliveryByUuid);
router.post('/', createDelivery);
router.put('/:uuid', updateDelivery);
router.patch('/:uuid/driver', updateDeliveryDriver);
router.patch('/:uuid/status', updateDeliveryStatus);
router.post('/:uuid/proof', submitProof);

module.exports = router;

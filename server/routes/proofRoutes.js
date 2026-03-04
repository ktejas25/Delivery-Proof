const express = require('express');
const { getProofByDeliveryUuid } = require('../controllers/proofController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);

router.get('/:uuid', getProofByDeliveryUuid);

module.exports = router;

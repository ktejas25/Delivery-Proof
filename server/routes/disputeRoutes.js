const express = require('express');
const { 
    createDispute, 
    getDisputes, 
    getDisputeDetails, 
    updateDisputeStatus, 
    addDisputeComment,
    getDisputeAnalytics
} = require('../controllers/disputeController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticateToken);
router.get('/', getDisputes);
router.get('/analytics', getDisputeAnalytics);
router.post('/', createDispute);
router.get('/:uuid', getDisputeDetails);
router.patch('/:uuid', updateDisputeStatus);
router.post('/:uuid/comments', addDisputeComment);

module.exports = router;

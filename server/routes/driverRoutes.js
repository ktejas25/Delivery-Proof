const express = require("express");
const {
  updateLocation,
  getDriverPerformance,
} = require("../controllers/driverController");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.post("/location", updateLocation);
router.get("/:uuid/performance", getDriverPerformance);

module.exports = router;

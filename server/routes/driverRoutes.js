const express = require("express");
const {
  updateLocation,
  getDriverPerformance,
  getDriverStatus,
  updateDutyStatus,
  endShift,
} = require("../controllers/driverController");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(authenticateToken);

router.get("/status", getDriverStatus);
router.patch("/duty-status", updateDutyStatus);
router.post("/shift/end", endShift);
router.post("/location", updateLocation);
router.get("/:uuid/performance", getDriverPerformance);

module.exports = router;

const express = require("express");
const {
  register,
  login,
  logout,
  getDrivers,
  createDriver,
} = require("../controllers/authController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.get(
  "/drivers",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  getDrivers,
);
router.post(
  "/drivers",
  authenticateToken,
  authorizeRoles("admin", "manager"),
  createDriver,
);

module.exports = router;

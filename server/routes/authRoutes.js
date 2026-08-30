const express = require("express");
const {
  register,
  login,
  googleAuth,
  logout,
  getDrivers,
  createDriver,
  changePassword,
} = require("../controllers/authController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", authenticateToken, logout);
router.post("/change-password", authenticateToken, changePassword);
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

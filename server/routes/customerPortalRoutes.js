const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const customerPortalCtrl = require("../controllers/customerPortalController");

const router = express.Router();

// Public routes
router.post("/register", customerPortalCtrl.register);
router.post("/login", customerPortalCtrl.login);
router.post("/forgot-password", customerPortalCtrl.forgotPassword);
router.post("/reset-password", customerPortalCtrl.resetPassword);
router.get("/ping", (req, res) => res.json({ pong: true }));

// Protected routes
router.use(authenticateToken);

// Profile
router.get("/profile", customerPortalCtrl.getProfile);
router.put("/profile", customerPortalCtrl.updateProfile);

// Deliveries
router.get("/upcoming-orders-count", customerPortalCtrl.getUpcomingOrdersCount);
router.get("/deliveries", customerPortalCtrl.getDeliveries);
router.get("/delivery/:uuid", customerPortalCtrl.getDeliveryDetails);
router.get("/delivery/:uuid/track", customerPortalCtrl.trackDelivery);

// Driver Ratings
router.post("/rate-driver", customerPortalCtrl.rateDriver);

// Disputes
router.post("/dispute", customerPortalCtrl.submitDispute);

// Addresses
router.get("/addresses", customerPortalCtrl.getAddresses);
router.post("/address", customerPortalCtrl.createAddress);
router.put("/address/:id", customerPortalCtrl.updateAddress);
router.delete("/address/:id", customerPortalCtrl.deleteAddress);

module.exports = router;

const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });
const pool = require("./config/database");

const app = express();
const http = require("http");
const server = http.createServer(app);
const initSocket = require("./config/socket");

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Socket
const io = initSocket(server);
app.set("io", io);

// Routes
const authRoutes = require("./routes/authRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const customerPortalRoutes = require("./routes/customerPortalRoutes");
const i18nRoutes = require("./routes/i18nRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const disputeRoutes = require("./routes/disputeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const driverRoutes = require("./routes/driverRoutes");
const proofRoutes = require("./routes/proofRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/customer", customerPortalRoutes);
app.use("/api/i18n", i18nRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/proofs", proofRoutes);
// Test DB connection
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as result");
    res.json({ status: "connected", result: rows[0].result });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ status: "error", message: err.message || "Something broke!" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

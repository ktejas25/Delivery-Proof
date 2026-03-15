const pool = require("../config/database");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../utils/authUtils");

// ==========================================
// Authentication APIs
// ==========================================

const register = async (req, res) => {
  const { name, email, phone, password, address, business_id } = req.body;
  if (!name || !email || !password || !address || !business_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const { v4: uuidv4 } = await import("uuid");
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check if email already exists in users
    const [existing] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Email already in use" });
    }

    // Insert user
    const userUuid = uuidv4();
    const hashedPassword = await hashPassword(password);
    const [userRes] = await connection.query(
      `INSERT INTO users (uuid, business_id, email, password_hash, first_name, last_name, user_type)
       VALUES (?, ?, ?, ?, ?, ?, 'customer')`,
      [
        userUuid,
        business_id,
        email,
        hashedPassword,
        name.split(" ")[0],
        name.split(" ").slice(1).join(" "),
      ],
    );
    const userId = userRes.insertId;

    // Insert customer
    const customerUuid = uuidv4();
    // Use POINT(0,0) as default if geocoding is missing
    const [customerRes] = await connection.query(
      `INSERT INTO customers (uuid, business_id, name, phone, email, address, location)
       VALUES (?, ?, ?, ?, ?, ?, ST_GeomFromText('POINT(0 0)', 4326))`,
      [customerUuid, business_id, name, phone || "", email, address],
    );

    // Save mapping in users or customer doesn't have an explicit user_id yet!
    // We should link users and customers.
    // The prompt says "Allow customers to authenticate using the same authentication system"
    // So user_type='customer'. We will find the customer record by email.

    await connection.commit();
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  } finally {
    connection.release();
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query(
      "SELECT u.*, b.uuid as business_uuid, b.name as business_name FROM users u JOIN businesses b ON u.business_id = b.id WHERE u.email = ? AND u.is_active = 1",
      [email],
    );

    if (users.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = users[0];
    if (user.user_type !== "customer") {
      return res
        .status(403)
        .json({ message: "Access denied: Not a customer account" });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Find custom record
    const [customers] = await pool.query(
      "SELECT id, uuid, name FROM customers WHERE email = ?",
      [email],
    );
    const customer = customers.length > 0 ? customers[0] : null;

    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const token = generateToken({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      business_id: user.business_id,
      business_uuid: user.business_uuid,
      user_type: user.user_type,
      customer_id: customer.id,
    });

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    res.json({
      token,
      user: {
        uuid: user.uuid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        name: customer.name || `${user.first_name} ${user.last_name}`.trim() || 'Valued Customer',
        user_type: user.user_type,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const { v4: uuidv4 } = await import("uuid");
  const token = uuidv4();

  try {
    const [user] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length > 0) {
      await pool.query(
        "INSERT INTO password_resets (email, reset_token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
        [email, token],
      );
      // Mock sending email
      console.log(`Password reset token for ${email}: ${token}`);
    }
    res.json({
      message: "If your email is registered, you will receive a reset link.",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, new_password } = req.body;
  try {
    const [resets] = await pool.query(
      "SELECT * FROM password_resets WHERE reset_token = ? AND expires_at > NOW()",
      [token],
    );
    if (resets.length === 0)
      return res.status(400).json({ message: "Invalid or expired token" });

    const email = resets[0].email;
    const hashedPassword = await hashPassword(new_password);
    await pool.query("UPDATE users SET password_hash = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);
    await pool.query("DELETE FROM password_resets WHERE email = ?", [email]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed", error: err.message });
  }
};

// ==========================================
// Customer Profile
// ==========================================

const getProfile = async (req, res) => {
  let customer_id = req.user.customer_id;
  try {
    if (!customer_id) {
       const [users] = await pool.query("SELECT email FROM users WHERE id = ?", [req.user.id]);
       if (users[0]) {
         const [customers] = await pool.query("SELECT id FROM customers WHERE email = ?", [users[0].email]);
         customer_id = customers[0]?.id;
       }
    }

    if (!customer_id) return res.status(404).json({ message: "Profile not found" });

    const [rows] = await pool.query(
      `SELECT c.id, c.uuid, c.name, c.phone, c.email, c.address, u.first_name, u.last_name 
       FROM customers c 
       JOIN users u ON c.email = u.email 
       WHERE c.id = ?`,
      [customer_id],
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  let customer_id = req.user.customer_id;
  if (!customer_id) {
     const [users] = await pool.query("SELECT email FROM users WHERE id = ?", [req.user.id]);
     if (users[0]) {
       const [customers] = await pool.query("SELECT id FROM customers WHERE email = ?", [users[0].email]);
       customer_id = customers[0]?.id;
     }
  }
  const { name, phone, address } = req.body;
  try {
    await pool.query(
      "UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?",
      [name, phone, address, customer_id],
    );
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// Deliveries
// ==========================================

const getDeliveries = async (req, res) => {
  let customer_id = req.user.customer_id;
  const email = req.user.email;

  try {
    // Fallback if token doesn't have customer_id (e.g. old session)
    if (!customer_id) {
      const emailToUse = email || (await pool.query("SELECT email FROM users WHERE id = ?", [req.user.id]).then(([r]) => r[0]?.email));
      
      if (emailToUse) {
        console.log(`[DEBUG] customer_id missing. Searching by email: ${emailToUse}`);
        const [customers] = await pool.query(
          "SELECT id FROM customers WHERE email = ?",
          [emailToUse]
        );
        if (customers.length > 0) {
          customer_id = customers[0].id;
          console.log(`[DEBUG] Found customer_id: ${customer_id}`);
        }
      }
    }

    if (!customer_id) {
      console.warn(`[DEBUG] No customer_id found for user ${req.user.id}`);
      return res.json([]);
    }

    console.log(`[DEBUG] Calling sp_get_customer_delivery_history for customer: ${customer_id}`);
    const [rows] = await pool.query(
      "CALL sp_get_customer_delivery_history(?)",
      [customer_id],
    );
    
    const results = rows[0] || [];
    console.log(`[DEBUG] Returning ${results.length} deliveries`);
    res.json(results);
  } catch (err) {
    console.error(`[DEBUG] getDeliveries error:`, err);
    res.status(500).json({ error: err.message });
  }
};

const getDeliveryDetails = async (req, res) => {
  const { uuid } = req.params;
  const customer_id = req.user.customer_id;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM deliveries WHERE uuid = ? AND customer_id = ?",
      [uuid, customer_id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Delivery not found" });

    // Check for proof
    const deliveryId = rows[0].id;
    const [proofs] = await pool.query(
      "SELECT * FROM delivery_proofs WHERE delivery_id = ?",
      [deliveryId],
    );

    res.json({ ...rows[0], proofs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const trackDelivery = async (req, res) => {
  const { uuid } = req.params;
  try {
    const [rows] = await pool.query("CALL sp_track_delivery(?)", [uuid]);
    res.json(rows[0][0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// Ratings
// ==========================================

const rateDriver = async (req, res) => {
  const customer_id = req.user.customer_id;
  const { delivery_id, rating, comment } = req.body;
  try {
    // get driver_id from delivery
    const [dels] = await pool.query(
      "SELECT id, driver_id FROM deliveries WHERE uuid = ? AND customer_id = ?",
      [delivery_id, customer_id],
    );
    if (dels.length === 0)
      return res.status(404).json({ message: "Delivery not found" });

    const internal_delivery_id = dels[0].id;
    const driver_id = dels[0].driver_id;

    // Call sp
    await pool.query("CALL sp_submit_driver_rating(?, ?, ?, ?, ?)", [
      internal_delivery_id,
      driver_id,
      customer_id,
      rating,
      comment,
    ]);
    res.json({ message: "Rating submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// Disputes
// ==========================================

const submitDispute = async (req, res) => {
  const customer_id = req.user.customer_id;
  const { delivery_uuid, issue_type, details } = req.body;
  try {
    const [dels] = await pool.query(
      "SELECT id FROM deliveries WHERE uuid = ? AND customer_id = ?",
      [delivery_uuid, customer_id]
    );
    
    if (dels.length === 0) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    const internal_delivery_id = dels[0].id;
    const { v4: uuidv4 } = await import("uuid");
    const dUuid = uuidv4();
    await pool.query(
      "INSERT INTO disputes (uuid, delivery_id, dispute_type, customer_claim, status) VALUES (?, ?, ?, ?, 'open')",
      [dUuid, internal_delivery_id, issue_type, details],
    );
    res.status(201).json({ message: "Dispute submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// Addresses
// ==========================================

const getAddresses = async (req, res) => {
  let customer_id = req.user.customer_id;
  try {
    if (!customer_id) {
       const [users] = await pool.query("SELECT email FROM users WHERE id = ?", [req.user.id]);
       if (users[0]) {
         const [customers] = await pool.query("SELECT id FROM customers WHERE email = ?", [users[0].email]);
         customer_id = customers[0]?.id;
       }
    }
    const [rows] = await pool.query("CALL sp_get_customer_addresses(?)", [
      customer_id,
    ]);
    res.json(rows[0] || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createAddress = async (req, res) => {
  let customer_id = req.user.customer_id;
  if (!customer_id) {
     const [users] = await pool.query("SELECT email FROM users WHERE id = ?", [req.user.id]);
     if (users[0]) {
       const [customers] = await pool.query("SELECT id FROM customers WHERE email = ?", [users[0].email]);
       customer_id = customers[0]?.id;
     }
  }
  const { label, address, lat, lng, is_default } = req.body;
  try {
    await pool.query(
      `INSERT INTO customer_addresses (customer_id, label, address, location, is_default)
       VALUES (?, ?, ?, ST_GeomFromText(?, 4326), ?)`,
      [
        customer_id,
        label,
        address,
        `POINT(${lat || 0} ${lng || 0})`,
        is_default || 0,
      ],
    );
    res.status(201).json({ message: "Address added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAddress = async (req, res) => {
  const { id } = req.params;
  const customer_id = req.user.customer_id;
  const { label, address, is_default } = req.body;
  try {
    await pool.query(
      "UPDATE customer_addresses SET label = ?, address = ?, is_default = ? WHERE id = ? AND customer_id = ?",
      [label, address, is_default || 0, id, customer_id],
    );
    res.json({ message: "Address updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const customer_id = req.user.customer_id;
  try {
    await pool.query(
      "DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?",
      [id, customer_id],
    );
    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUpcomingOrdersCount = async (req, res) => {
  let customer_id = req.user.customer_id;
  try {
    if (!customer_id) {
       const [users] = await pool.query("SELECT email FROM users WHERE id = ?", [req.user.id]);
       if (users[0]) {
         const [customers] = await pool.query("SELECT id FROM customers WHERE email = ?", [users[0].email]);
         customer_id = customers[0]?.id;
       }
    }
    if (!customer_id) return res.json({ count: 0 });

    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM deliveries WHERE customer_id = ? AND delivery_status IN ('pending', 'scheduled', 'dispatched', 'en_route', 'arrived')",
      [customer_id],
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  getDeliveries,
  getDeliveryDetails,
  trackDelivery,
  rateDriver,
  submitDispute,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getUpcomingOrdersCount,
};

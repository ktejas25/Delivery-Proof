const pool = require("../config/database");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../utils/authUtils");

const register = async (req, res) => {
  const { business_name, email, password, first_name, last_name } = req.body;

  // Dynamic import for ESM-only uuid
  const { v4: uuidv4 } = await import("uuid");

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create Business
    const businessUuid = uuidv4();
    const [bizResult] = await connection.query(
      "INSERT INTO businesses (uuid, name, email) VALUES (?, ?, ?)",
      [businessUuid, business_name, email],
    );
    const businessId = bizResult.insertId;

    // 2. Create Admin User
    const userUuid = uuidv4();
    const hashedPassword = await hashPassword(password);
    await connection.query(
      "INSERT INTO users (uuid, business_id, email, password_hash, first_name, last_name, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        userUuid,
        businessId,
        email,
        hashedPassword,
        first_name,
        last_name,
        "admin",
      ],
    );

    await connection.commit();
    res.status(201).json({
      message: "Registration successful",
      business_uuid: businessUuid,
    });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
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

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id,
      uuid: user.uuid,
      business_id: user.business_id,
      business_uuid: user.business_uuid,
      user_type: user.user_type,
    });

    // Update last login
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    // If the logged-in user is a driver, mark them as available
    if (user.user_type && user.user_type.toLowerCase() === "driver") {
      await pool.query(
        `UPDATE drivers
         SET current_status = 'available',
             is_available = TRUE
         WHERE user_id = ?`,
        [user.id],
      );
    }

    res.json({
      token,
      user: {
        uuid: user.uuid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        business_name: user.business_name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const { id, user_type } = req.user;

    // If the logged-out user is a driver, mark them as offline
    if (user_type && user_type.toLowerCase() === "driver") {
      await pool.query(
        `UPDATE drivers
         SET current_status = 'offline',
             is_available = FALSE
         WHERE user_id = ?`,
        [id],
      );
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

const getDrivers = async (req, res) => {
  const { business_id } = req.user;
  try {
    const [rows] = await pool.query(
      `SELECT d.id as driver_id, u.uuid, u.first_name, u.last_name, u.email, d.current_status as status, d.avg_rating as performance_score, d.last_location_lat, d.last_location_lng
             FROM users u
             JOIN drivers d ON u.id = d.user_id
             WHERE u.business_id = ?`,
      [business_id],
    );
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch drivers", error: error.message });
  }
};

const createDriver = async (req, res) => {
  const { business_id } = req.user;
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    vehicle_type,
    license_number,
  } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      message: "first_name, last_name, email and password are required",
    });
  }

  const { v4: uuidv4 } = await import("uuid");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check email not already used
    const [existing] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res
        .status(409)
        .json({ message: "A user with this email already exists" });
    }

    // 1. Create user row
    const userUuid = uuidv4();
    const hashedPassword = await hashPassword(password);
    const [userResult] = await connection.query(
      "INSERT INTO users (uuid, business_id, email, password_hash, first_name, last_name, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        userUuid,
        business_id,
        email,
        hashedPassword,
        first_name,
        last_name,
        "driver",
      ],
    );
    const userId = userResult.insertId;

    // 2. Create drivers row (no uuid column on this table - uses auto-increment id)
    await connection.query(
      "INSERT INTO drivers (user_id, vehicle_type, license_number) VALUES (?, ?, ?)",
      [userId, vehicle_type || null, license_number || null],
    );

    await connection.commit();
    res
      .status(201)
      .json({ message: "Driver created successfully", uuid: userUuid });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Failed to create driver", error: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  register,
  login,
  logout,
  getDrivers,
  createDriver,
};

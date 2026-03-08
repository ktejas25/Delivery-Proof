const pool = require("../config/database");
const { hashPassword } = require("../utils/authUtils");

const getCustomers = async (req, res) => {
  const { business_id } = req.user;
  try {
    // Calculate total_orders on the fly.
    // We explicitly list columns to avoid collision with the physical 'total_orders' column in the table.
    const [rows] = await pool.query(
      `SELECT c.id, c.uuid, c.name, c.email, c.phone, c.address, c.delivery_instructions, 
                    c.preferred_language_code, c.created_at,
                    CAST(COUNT(d.id) AS UNSIGNED) as total_orders
             FROM customers c
             LEFT JOIN deliveries d ON c.id = d.customer_id
             WHERE c.business_id = ? 
             GROUP BY c.id
             ORDER BY c.name ASC`,
      [business_id],
    );
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch customers", error: error.message });
  }
};

const createCustomer = async (req, res) => {
  const { business_id } = req.user;
  const {
    name,
    email,
    phone,
    address,
    delivery_instructions,
    preferred_language_code,
    lat,
    lng,
    password, // Support adding a password for customer portal login
  } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: "Name and address are required" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { v4: uuidv4 } = await import("uuid");
    const customerUuid = uuidv4();
    let userId = null;

    // If email and password are provided, create a user account for portal login
    if (email && password) {
      // Check if user already exists
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

      const userUuid = uuidv4();
      const hashedPassword = await hashPassword(password);
      const [userResult] = await connection.query(
        `INSERT INTO users (uuid, business_id, email, phone, password_hash, first_name, last_name, user_type) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'customer')`,
        [
          userUuid,
          business_id,
          email,
          phone || null,
          hashedPassword,
          name.split(" ")[0],
          name.split(" ").slice(1).join(" "),
        ],
      );
      userId = userResult.insertId;
    }

    const locationValue =
      lat && lng
        ? `ST_GeomFromText('POINT(${lat} ${lng})', 4326)`
        : `ST_GeomFromText('POINT(0 0)', 4326)`;

    await connection.query(
      `INSERT INTO customers (uuid, business_id, user_id, name, email, phone, address, delivery_instructions, preferred_language_code, location)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${locationValue})`,
      [
        customerUuid,
        business_id,
        userId,
        name,
        email || null,
        phone || null,
        address,
        delivery_instructions || null,
        preferred_language_code || "en",
      ],
    );

    await connection.commit();
    res.status(201).json({ message: "Customer created", uuid: customerUuid });
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json({ message: "Failed to create customer", error: error.message });
  } finally {
    connection.release();
  }
};

const updateCustomer = async (req, res) => {
  const { business_id } = req.user;
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    address,
    delivery_instructions,
    preferred_language_code,
    lat,
    lng,
    password, // Optional: for creating or updating portal access
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get existing customer info
    const [existing] = await connection.query(
      "SELECT user_id, email FROM customers WHERE id = ? AND business_id = ?",
      [id, business_id],
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Customer not found" });
    }

    const currentUserId = existing[0].user_id;
    let userId = currentUserId;

    // 2. Handle User/Portal login logic
    if (password) {
      const { v4: uuidv4 } = await import("uuid");
      const hashedPassword = await hashPassword(password);

      if (userId) {
        // Update existing user password
        await connection.query(
          "UPDATE users SET password_hash = ?, email = COALESCE(?, email) WHERE id = ?",
          [hashedPassword, email, userId],
        );
      } else {
        // Create new user for this customer
        const userUuid = uuidv4();
        const [userResult] = await connection.query(
          `INSERT INTO users (uuid, business_id, email, phone, password_hash, first_name, last_name, user_type) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 'customer')`,
          [
            userUuid,
            business_id,
            email,
            phone || null,
            hashedPassword,
            name ? name.split(" ")[0] : "Customer",
            name ? name.split(" ").slice(1).join(" ") : "",
          ],
        );
        userId = userResult.insertId;
      }
    } else if (email && userId) {
      // Just update email on user if it changed
      await connection.query("UPDATE users SET email = ? WHERE id = ?", [
        email,
        userId,
      ]);
    }

    // 3. Update customer table
    const locationPart =
      lat !== undefined && lng !== undefined
        ? `location = ST_GeomFromText('POINT(${lat} ${lng})', 4326),`
        : "";

    const updateSql = `UPDATE customers SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        delivery_instructions = COALESCE(?, delivery_instructions),
        preferred_language_code = COALESCE(?, preferred_language_code),
        user_id = COALESCE(?, user_id),
        ${locationPart}
        updated_at = NOW()
      WHERE id = ? AND business_id = ?`;

    const updateParams = [
      name || null,
      email || null,
      phone || null,
      address || null,
      delivery_instructions || null,
      preferred_language_code || null,
      userId || null,
      id,
      business_id,
    ];

    console.log("Update Customer SQL:", updateSql.replace(/\s+/g, " "));
    console.log("Update Customer Params:", updateParams);

    await connection.query(updateSql, updateParams);

    await connection.commit();
    res.json({ message: "Customer updated successfully" });
  } catch (error) {
    console.error("Update Customer error:", error);
    if (connection) await connection.rollback();
    res
      .status(500)
      .json({ message: "Failed to update customer", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = { getCustomers, createCustomer, updateCustomer };

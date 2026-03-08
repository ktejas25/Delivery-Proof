const pool = require("./config/database");
const { hashPassword } = require("./utils/authUtils");

async function testUpdate() {
  console.log("Starting test update...");
  const id = 2; // From user request
  const business_id = 2; // Assuming business_id 2 from logs
  const body = {
    name: "Suraj",
    email: "suraj@gmail.com",
    phone: "+919172653374",
    address: "New Snehnagar Co-Op Housing Soc Sr No. 580",
    delivery_instructions: "",
    password: "Pass@1234",
  };

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get existing customer info
    const [existing] = await connection.query(
      "SELECT user_id, email FROM customers WHERE id = ? AND business_id = ?",
      [id, business_id],
    );

    console.log("Existing:", existing);

    if (existing.length === 0) {
      console.log("Customer not found");
      return;
    }

    const currentUserId = existing[0].user_id;
    let userId = currentUserId;

    // 2. Handle User/Portal login logic
    if (body.password) {
      const { v4: uuidv4 } = await import("uuid");
      const hashedPassword = await hashPassword(body.password);

      if (userId) {
        // Update existing user password
        await connection.query(
          "UPDATE users SET password_hash = ?, email = COALESCE(?, email) WHERE id = ?",
          [hashedPassword, body.email, userId],
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
            body.email,
            body.phone || null,
            hashedPassword,
            body.name ? body.name.split(" ")[0] : "Customer",
            body.name ? body.name.split(" ").slice(1).join(" ") : "",
          ],
        );
        userId = userResult.insertId;
      }
    }

    // 3. Update customer table
    await connection.query(
      `UPDATE customers SET 
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                address = COALESCE(?, address),
                delivery_instructions = COALESCE(?, delivery_instructions),
                user_id = COALESCE(?, user_id),
                updated_at = NOW()
            WHERE id = ? AND business_id = ?`,
      [
        body.name,
        body.email,
        body.phone,
        body.address,
        body.delivery_instructions,
        userId,
        id,
        business_id,
      ],
    );

    await connection.commit();
    console.log("Update successful");
  } catch (error) {
    console.error("Update failed:", error);
    await connection.rollback();
  } finally {
    connection.release();
    process.exit();
  }
}

testUpdate();

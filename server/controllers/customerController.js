const pool = require('../config/database');

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
            [business_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
    }
};

const createCustomer = async (req, res) => {
    const { business_id } = req.user;
    const { name, email, phone, address, delivery_instructions, preferred_language_code, lat, lng } = req.body;

    if (!name || !address) {
        return res.status(400).json({ message: 'Name and address are required' });
    }

    try {
        const { v4: uuidv4 } = await import('uuid');
        const uuid = uuidv4();

        if (lat && lng) {
            await pool.query(
                `INSERT INTO customers (uuid, business_id, name, email, phone, address, delivery_instructions, preferred_language_code, location)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?, 4326))`,
                [uuid, business_id, name, email || null, phone || null, address,
                 delivery_instructions || null, preferred_language_code || 'en',
                 `POINT(${lat} ${lng})`]
            );
        } else {
            await pool.query(
                `INSERT INTO customers (uuid, business_id, name, email, phone, address, delivery_instructions, preferred_language_code)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [uuid, business_id, name, email || null, phone || null, address,
                 delivery_instructions || null, preferred_language_code || 'en']
            );
        }

        res.status(201).json({ message: 'Customer created', uuid });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create customer', error: error.message });
    }
};

module.exports = { getCustomers, createCustomer };

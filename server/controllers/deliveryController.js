const pool = require('../config/database');

const getDeliveries = async (req, res) => {
    const { business_id } = req.user;
    try {
        const [rows] = await pool.query(
            `SELECT d.*, c.name as customer_name, c.address as customer_address, 
                    CONCAT_WS(' ', u.first_name, u.last_name) as driver_name
             FROM deliveries d 
             JOIN customers c ON d.customer_id = c.id 
             LEFT JOIN drivers dr ON d.driver_id = dr.id
             LEFT JOIN users u ON dr.user_id = u.id
             WHERE d.business_id = ? 
             ORDER BY d.created_at DESC`,
            [business_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch deliveries', error: error.message });
    }
};

const createDelivery = async (req, res) => {
    const { business_id } = req.user;
    // Support both driver_id (new) and driver_uuid (legacy fallback)
    const { customer_id, scheduled_time, priority_level, delivery_notes, driver_id, driver_uuid } = req.body;
    
    console.log('Creating Delivery with body:', req.body);

    try {
        const { v4: uuidv4 } = await import('uuid');
        const uuid = uuidv4();
        
        let final_driver_id = null;

        // 1. Try direct driver_id first
        if (driver_id && driver_id !== '') {
            final_driver_id = parseInt(driver_id);
        } 
        // 2. Fallback to driver_uuid if driver_id is missing
        else if (driver_uuid && driver_uuid !== '') {
            console.log(`Falling back to UUID lookup for: ${driver_uuid}`);
            const [driverRows] = await pool.query(
                'SELECT d.id FROM drivers d JOIN users u ON d.user_id = u.id WHERE u.uuid = ?',
                [driver_uuid]
            );
            if (driverRows.length > 0) {
                final_driver_id = driverRows[0].id;
            }
        }

        console.log(`Resolved driver_id: ${final_driver_id}`);

        // Insert without order_number first to get the auto-increment ID
        const [result] = await pool.query(
            `INSERT INTO deliveries (uuid, business_id, customer_id, driver_id, scheduled_time, priority_level, delivery_notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuid, business_id, parseInt(customer_id), final_driver_id, scheduled_time, priority_level || 'medium', delivery_notes]
        );
        
        const insertId = result.insertId;
        // Generate sequential order number starting from 1001 (e.g., ORD-1001 for ID 1)
        const order_number = `ORD-${1000 + insertId}`;
        
        // Update the record with the generated order number
        await pool.query(
            'UPDATE deliveries SET order_number = ? WHERE id = ?',
            [order_number, insertId]
        );

        res.status(201).json({ 
            message: 'Delivery created', 
            uuid, 
            order_number,
            assigned_driver_id: final_driver_id,
            debug_info: { received_driver_id: driver_id, received_driver_uuid: driver_uuid }
        });
    } catch (error) {
        console.error('Delivery creation error:', error);
        res.status(500).json({ message: 'Failed to create delivery', error: error.message });
    }
};

const updateDeliveryStatus = async (req, res) => {
    const { uuid } = req.params;
    const { status } = req.body;
    const { business_id } = req.user;

    try {
        const [result] = await pool.query(
            'UPDATE deliveries SET delivery_status = ? WHERE uuid = ? AND business_id = ?',
            [status, uuid, business_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

const getDeliveryByUuid = async (req, res) => {
    const { uuid } = req.params;
    const { business_id } = req.user;
    try {
        const [rows] = await pool.query(
            `SELECT d.*, c.name as customer_name, c.address as customer_address
             FROM deliveries d 
             JOIN customers c ON d.customer_id = c.id 
             WHERE d.uuid = ? AND d.business_id = ?`,
            [uuid, business_id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Delivery not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed', error: error.message });
    }
};

const updateDelivery = async (req, res) => {
    const { uuid } = req.params;
    const { business_id } = req.user;
    const { customer_id, scheduled_time, priority_level, delivery_notes, driver_id } = req.body;

    try {
        await pool.query(
            `UPDATE deliveries SET 
                customer_id = ?, 
                scheduled_time = ?, 
                priority_level = ?, 
                delivery_notes = ?, 
                driver_id = ? 
             WHERE uuid = ? AND business_id = ?`,
            [customer_id, scheduled_time, priority_level, delivery_notes, driver_id || null, uuid, business_id]
        );
        res.json({ message: 'Delivery updated' });
    } catch (error) {
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
};

const updateDeliveryDriver = async (req, res) => {
    const { uuid } = req.params;
    const { business_id } = req.user;
    const { driver_id } = req.body;

    try {
        await pool.query(
            'UPDATE deliveries SET driver_id = ? WHERE uuid = ? AND business_id = ?',
            [driver_id || null, uuid, business_id]
        );
        res.json({ message: 'Driver assigned' });
    } catch (error) {
        res.status(500).json({ message: 'Assignment failed', error: error.message });
    }
};

const getDriverDeliveries = async (req, res) => {
    const { id: driver_id } = req.user;
    
    try {
        const [rows] = await pool.query(
            `SELECT
                d.uuid,
                d.order_number,
                d.delivery_status,
                d.scheduled_time,
                d.priority_level,
                d.requires_signature,
                d.requires_photo,
                d.route_optimization_data,
                50 AS earnings,
                c.name AS customer_name,
                c.phone AS customer_phone,
                c.address,
                ST_X(c.location) AS address_lat,
                ST_Y(c.location) AS address_lng,
                c.delivery_instructions,
                c.preferred_language_code
            FROM deliveries d
            JOIN customers c ON d.customer_id = c.id
            JOIN drivers dr ON d.driver_id = dr.id
            WHERE dr.user_id = ?
            ORDER BY
                FIELD(d.delivery_status, 'scheduled', 'dispatched', 'en_route', 'arrived', 'delivered', 'disputed', 'failed'),
                d.scheduled_time ASC`,
            [driver_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch deliveries', error: error.message });
    }
};

module.exports = {
    getDeliveries,
    getDeliveryByUuid,
    getDriverDeliveries,
    createDelivery,
    updateDelivery,
    updateDeliveryDriver,
    updateDeliveryStatus
};

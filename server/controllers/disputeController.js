const pool = require('../config/database');

const createDispute = async (req, res) => {
    const { delivery_uuid, dispute_type, customer_claim } = req.body;
    
    try {
        const [delivery] = await pool.query('SELECT id FROM deliveries WHERE uuid = ?', [delivery_uuid]);
        if (delivery.length === 0) return res.status(404).json({ message: 'Delivery not found' });

        const { v4: uuidv4 } = await import('uuid');
        const uuid = uuidv4();
        const [result] = await pool.query(
            'INSERT INTO disputes (uuid, delivery_id, dispute_type, customer_claim) VALUES (?, ?, ?, ?)',
            [uuid, delivery[0].id, dispute_type, customer_claim]
        );

        res.status(201).json({ message: 'Dispute filed', uuid: uuid });
    } catch (error) {
        res.status(500).json({ message: 'Failed to file dispute', error: error.message });
    }
};

const getDisputes = async (req, res) => {
    const { business_id } = req.user;
    const { status, search, sort, page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    let query = `
        SELECT ds.*, d.order_number, c.name as customer_name
        FROM disputes ds 
        JOIN deliveries d ON ds.delivery_id = d.id 
        JOIN customers c ON d.customer_id = c.id
        WHERE d.business_id = ?
    `;
    const params = [business_id];

    if (status && status !== 'all') {
        query += ' AND ds.status = ?';
        params.push(status);
    }

    if (search) {
        query += ' AND (d.order_number LIKE ? OR c.name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'fraud_high') {
        query += ' ORDER BY ds.fraud_score DESC';
    } else if (sort === 'oldest') {
        query += ' ORDER BY ds.created_at ASC';
    } else {
        query += ' ORDER BY ds.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    try {
        const [rows] = await pool.query(query, params);
        const [totalRows] = await pool.query(
            'SELECT COUNT(*) as count FROM disputes ds JOIN deliveries d ON ds.delivery_id = d.id WHERE d.business_id = ?',
            [business_id]
        );

        res.json({
            data: rows,
            pagination: {
                total: totalRows[0].count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(totalRows[0].count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch disputes', error: error.message });
    }
};

const getDisputeDetails = async (req, res) => {
    const { uuid } = req.params;
    const { business_id } = req.user;

    try {
        const [disputeRows] = await pool.query(`
            SELECT ds.*, 
                   d.uuid as delivery_uuid, d.order_number, d.delivery_status, d.scheduled_time, d.actual_arrival,
                   d.photo_url as proof_photo_url, d.signature_url as proof_signature_url, 
                   d.gps_lat as proof_gps_lat, d.gps_lng as proof_gps_lng, d.proof_hash as delivery_proof_hash,
                   c.name as customer_name, c.address as customer_address,
                   u_driver.first_name as driver_first_name, u_driver.last_name as driver_last_name,
                   dp.blockchain_tx_hash, dp.blockchain_confirmed, dp.verification_score,
                   dp.id as proof_id
            FROM disputes ds
            JOIN deliveries d ON ds.delivery_id = d.id
            JOIN customers c ON d.customer_id = c.id
            LEFT JOIN drivers dr ON d.driver_id = dr.id
            LEFT JOIN users u_driver ON dr.user_id = u_driver.id
            LEFT JOIN delivery_proofs dp ON d.id = dp.delivery_id
            WHERE ds.uuid = ? AND d.business_id = ?
        `, [uuid, business_id]);

        if (disputeRows.length === 0) return res.status(404).json({ message: 'Dispute not found' });

        const dispute = disputeRows[0];
        
        // Fetch photos
        let photos = [];
        if (dispute.proof_id) {
            [photos] = await pool.query('SELECT * FROM delivery_photos WHERE proof_id = ?', [dispute.proof_id]);
        }

        // Fetch comments
        const [comments] = await pool.query(`
            SELECT dc.*, u.first_name, u.last_name, u.user_type
            FROM dispute_comments dc
            JOIN users u ON dc.user_id = u.id
            WHERE dc.dispute_id = ?
            ORDER BY dc.created_at ASC
        `, [dispute.id]);

        // Fetch audit timeline
        const [timeline] = await pool.query(`
            SELECT * FROM audit_logs 
            WHERE (entity_type = 'dispute' AND entity_id = ?) 
               OR (entity_type = 'delivery' AND entity_id = ?)
            ORDER BY created_at ASC
        `, [dispute.id, dispute.delivery_id]);

        res.json({
            ...dispute,
            photos,
            comments,
            timeline
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch dispute details', error: error.message });
    }
};

const updateDisputeStatus = async (req, res) => {
    const { uuid } = req.params;
    const { status, resolution, internal_notes } = req.body;
    const { id: user_id, business_id } = req.user;

    try {
        const [dispute] = await pool.query(`
            SELECT ds.id, ds.status as old_status, ds.delivery_id 
            FROM disputes ds 
            JOIN deliveries d ON ds.delivery_id = d.id 
            WHERE ds.uuid = ? AND d.business_id = ?
        `, [uuid, business_id]);

        if (dispute.length === 0) return res.status(404).json({ message: 'Dispute not found' });

        const dispute_id = dispute[0].id;
        const old_status = dispute[0].old_status;

        await pool.query(
            'UPDATE disputes SET status = ?, resolution = ?, internal_notes = ?, resolved_at = IF(? = "resolved" OR ? = "fraud", NOW(), resolved_at) WHERE id = ?',
            [status, resolution, internal_notes, status, status, dispute_id]
        );

        // Audit Log
        await pool.query(`
            INSERT INTO audit_logs (business_id, user_id, user_type, action, entity_type, entity_id, old_values, new_values)
            VALUES (?, ?, ?, 'DISPUTE_STATUS_CHANGE', 'dispute', ?, ?, ?)
        `, [
            business_id, user_id, req.user.user_type, dispute_id, 
            JSON.stringify({ status: old_status }), 
            JSON.stringify({ status, resolution, internal_notes })
        ]);

        res.json({ message: 'Dispute updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update dispute', error: error.message });
    }
};

const addDisputeComment = async (req, res) => {
    const { uuid } = req.params;
    const { comment } = req.body;
    const { id: user_id, business_id } = req.user;

    try {
        const [dispute] = await pool.query(`
            SELECT ds.id FROM disputes ds 
            JOIN deliveries d ON ds.delivery_id = d.id 
            WHERE ds.uuid = ? AND d.business_id = ?
        `, [uuid, business_id]);

        if (dispute.length === 0) return res.status(404).json({ message: 'Dispute not found' });

        const { v4: uuidv4 } = await import('uuid');
        const comment_uuid = uuidv4();
        await pool.query(
            'INSERT INTO dispute_comments (uuid, dispute_id, user_id, comment) VALUES (?, ?, ?, ?)',
            [comment_uuid, dispute[0].id, user_id, comment]
        );

        res.status(201).json({ message: 'Comment added', uuid: comment_uuid });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add comment', error: error.message });
    }
};

const getDisputeAnalytics = async (req, res) => {
    const { business_id } = req.user;
    try {
        const [counts] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status != 'resolved' AND status != 'fraud' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'fraud' OR fraud_score > 70 THEN 1 ELSE 0 END) as high_risk,
                SUM(CASE WHEN DATE(resolved_at) = CURDATE() THEN 1 ELSE 0 END) as resolved_today,
                AVG(fraud_score) as avg_score
            FROM disputes ds
            JOIN deliveries d ON ds.delivery_id = d.id
            WHERE d.business_id = ?
        `, [business_id]);

        res.json(counts[0]);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
    }
};

module.exports = {
    createDispute,
    getDisputes,
    getDisputeDetails,
    updateDisputeStatus,
    addDisputeComment,
    getDisputeAnalytics
};

const pool = require('../config/database');
const crypto = require('crypto');
const axios = require('axios');
const { submitToBlockchain } = require('../services/blockchainService');

const submitProof = async (req, res) => {
    const { uuid } = req.params;
    const { photo_url, signature_url, gps_lat, gps_lng, gps_accuracy, recorded_at } = req.body;
    const driver_id = req.user.id;

    if (!photo_url || !signature_url || !gps_lat || !gps_lng || !recorded_at) {
        return res.status(400).json({ message: 'Missing required proof data' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Check if delivery exists and belongs to the driver (if driver)
            // Note: deliveries.driver_id references drivers.id, while driver_id here is users.id
            const [deliveries] = await connection.query(
                `SELECT d.id, d.delivery_status 
                 FROM deliveries d 
                 LEFT JOIN drivers dr ON d.driver_id = dr.id
                 WHERE d.uuid = ? AND (dr.user_id = ? OR ? IN (SELECT id FROM users WHERE user_type IN ('manager', 'admin')))`,
                [uuid, driver_id, driver_id]
            );

            if (deliveries.length === 0) {
                return res.status(403).json({ message: 'Delivery not found or unauthorized' });
            }

            const delivery = deliveries[0];
            if (delivery.delivery_status === 'delivered') {
                return res.status(400).json({ message: 'Proof already submitted for this delivery' });
            }

            // A. Generate Cryptographic Proof Hash (Tamper-Resistant)
            const proofString = `${photo_url}${signature_url}${gps_lat}${gps_lng}${recorded_at}`;
            const proof_hash = crypto
                .createHash('sha256')
                .update(proofString)
                .digest('hex');

            // B. Immutable update to deliveries table
            const finalRecordedAt = recorded_at ? new Date(recorded_at) : new Date();
            
            await connection.query(
                `UPDATE deliveries 
                 SET photo_url = ?, 
                     signature_url = ?, 
                     gps_lat = ?, 
                     gps_lng = ?, 
                     gps_accuracy = ?, 
                     recorded_at = ?, 
                     proof_hash = ?, 
                     delivery_status = 'delivered',
                     updated_at = NOW()
                 WHERE id = ?`,
                [photo_url, signature_url, gps_lat, gps_lng, gps_accuracy || 0, finalRecordedAt, proof_hash, delivery.id]
            );

            // C. Legacy support: Optional storage in proof and photo tables
            const proof_data = JSON.stringify({
                photo_url,
                signature_url,
                gps_lat,
                gps_lng,
                gps_accuracy,
                recorded_at,
                proof_hash
            });

            // Call existing SP if available or manually insert
            const [spResult] = await connection.query(
                'INSERT INTO delivery_proofs (delivery_id, proof_type, proof_data, blockchain_tx_hash) VALUES (?, ?, ?, ?)',
                [delivery.id, 'comprehensive', proof_data, proof_hash]
            );
            const proof_id = spResult.insertId;

            await connection.query(
                'INSERT INTO delivery_photos (proof_id, s3_url, s3_key, gps_lat, gps_lng, image_hash) VALUES (?, ?, ?, ?, ?, ?)',
                [proof_id, photo_url, 'cloudinary_upload', gps_lat, gps_lng, proof_hash]
            );

            await connection.query(
                'INSERT INTO delivery_signatures (proof_id, s3_url, signer_type) VALUES (?, ?, ?)',
                [proof_id, signature_url, 'customer']
            );

            await connection.commit();

            // D. Proactively trigger AI Analysis for Fraud Detection
            try {
                axios.post(`${process.env.ML_SERVICE_URL}/analyze-proof`, {
                    delivery_uuid: uuid,
                    photo_url,
                    signature_url,
                    gps_lat,
                    gps_lng,
                    proof_hash,
                    recorded_at
                }).catch(e => console.error('ML Analysis Trigger failed', e.message));
            } catch (e) {}

            res.json({ 
                message: 'Proof submitted successfully', 
                status: 'delivered',
                proof_hash 
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ message: 'Proof submission failed', error: error.message });
    }
};

const getProofByDeliveryUuid = async (req, res) => {
    const { uuid } = req.params;
    const { business_id } = req.user;

    try {
        const [rows] = await pool.query(
            `SELECT photo_url as photoUrl, signature_url as signature, delivery_notes as notes, recorded_at as timestamp 
             FROM deliveries 
             WHERE uuid = ? AND business_id = ? AND delivery_status = 'delivered'`,
            [uuid, business_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Delivery record not found or not delivered' });
        }

        const proof = rows[0];

        // If proof data is missing but row exists, we return the null/empty values 
        // to avoid a noisy 404 in the console for 'delivered' status orders 
        // that were manually set by admins.
        
        // Convert timestamp to milliseconds if it's a Date object
        if (proof.timestamp instanceof Date) {
            proof.timestamp = proof.timestamp.getTime();
        }

        res.json(proof);
    } catch (error) {
        res.status(500).json({ message: 'Fetch proof failed', error: error.message });
    }
};

module.exports = {
    submitProof,
    getProofByDeliveryUuid
};

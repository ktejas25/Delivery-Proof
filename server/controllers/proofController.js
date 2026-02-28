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
            const [deliveries] = await connection.query(
                `SELECT d.id, d.delivery_status 
                 FROM deliveries d 
                 WHERE d.uuid = ? AND (d.driver_id = ? OR ? IN (SELECT user_id FROM users WHERE user_type IN ('manager', 'admin', 'analyst')))`,
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
                [photo_url, signature_url, gps_lat, gps_lng, gps_accuracy || 0, recorded_at, proof_hash, delivery.id]
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
                'INSERT INTO delivery_proofs (delivery_id, submitted_by_id, proof_type, proof_data, blockchain_tx_hash) VALUES (?, ?, ?, ?, ?)',
                [delivery.id, driver_id, 'comprehensive', proof_data, proof_hash]
            );
            const proof_id = spResult.insertId;

            await connection.query(
                'INSERT INTO delivery_photos (proof_id, s3_url, s3_key, gps_lat, gps_lng, image_hash) VALUES (?, ?, ?, ?, ?, ?)',
                [proof_id, photo_url, 'cloudinary_upload', gps_lat, gps_lng, proof_hash]
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

module.exports = {
    submitProof
};

const pool = require('../config/database');

const updateLocation = async (req, res) => {
    const { id: user_id } = req.user;
    const { lat, lng, accuracy, timestamp } = req.body;

    try {
        await pool.query(
            `UPDATE drivers 
             SET last_location_lat = ?, 
                 last_location_lng = ?, 
                 last_location_update = CURRENT_TIMESTAMP 
             WHERE user_id = ?`,
            [lat, lng, user_id]
        );
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Failed to update driver location:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { updateLocation };

const socketIo = require('socket.io');
const pool = require('./database');

const initSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_delivery', (deliveryUuid) => {
            socket.join(`delivery_${deliveryUuid}`);
            console.log(`Socket ${socket.id} joined delivery ${deliveryUuid}`);
        });

        socket.on('update_location', async (data) => {
            // data: { deliveryUuid, lat, lng, driverId }
            
            // 1. Broadcast to listeners
            io.to(`delivery_${data.deliveryUuid}`).emit('location_updated', {
                lat: data.lat,
                lng: data.lng,
                timestamp: new Date()
            });

            // 2. Persist to DB for initial loads/refreshes
            if (data.driverId && data.lat && data.lng) {
                try {
                    await pool.query(
                        `UPDATE drivers SET last_location_lat = ?, last_location_lng = ?, last_location_update = NOW() WHERE id = ?`,
                        [data.lat, data.lng, data.driverId]
                    );
                } catch (err) {
                    console.error('Socket location update persistence error:', err);
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

module.exports = initSocket;

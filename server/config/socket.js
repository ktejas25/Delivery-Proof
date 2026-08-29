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

        socket.on('join_dashboard', (businessId) => {
            if (businessId) {
                socket.join(`business_${businessId}`);
                console.log(`Socket ${socket.id} joined business dashboard ${businessId}`);
            }
        });

        socket.on('update_location', async (data) => {
            // data: { deliveryUuid, lat, lng, driverId, businessId }
            
            // 1. Broadcast to delivery listeners
            if (data.deliveryUuid) {
                io.to(`delivery_${data.deliveryUuid}`).emit('location_updated', {
                    lat: data.lat,
                    lng: data.lng,
                    timestamp: new Date()
                });
            }

            // 2. Broadcast to business dashboard
            if (data.businessId) {
                io.to(`business_${data.businessId}`).emit('driver_location_updated', {
                    driverId: data.driverId,
                    lat: data.lat,
                    lng: data.lng,
                    timestamp: new Date()
                });
            }

            // 3. Persist to DB for initial loads/refreshes
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

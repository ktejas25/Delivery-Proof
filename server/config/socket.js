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
            // data: { deliveryUuid, lat, lng, driverId, businessId, userId }
            if (!data) return;
            const parsedLat = parseFloat(data.lat);
            const parsedLng = parseFloat(data.lng);
            if (isNaN(parsedLat) || isNaN(parsedLng)) return;

            // 1. Broadcast to specific delivery room if specified
            if (data.deliveryUuid) {
                io.to(`delivery_${data.deliveryUuid}`).emit('location_updated', {
                    lat: parsedLat,
                    lng: parsedLng,
                    driverId: data.driverId,
                    timestamp: new Date()
                });
            }

            // 2. Broadcast to business dashboard
            if (data.businessId) {
                io.to(`business_${data.businessId}`).emit('driver_location_updated', {
                    driverId: data.driverId,
                    lat: parsedLat,
                    lng: parsedLng,
                    timestamp: new Date()
                });
            }

            // 3. Persist to DB for initial loads/refreshes
            try {
                if (data.driverId) {
                    await pool.query(
                        `UPDATE drivers SET last_location_lat = ?, last_location_lng = ?, last_location_update = NOW() WHERE id = ?`,
                        [parsedLat, parsedLng, data.driverId]
                    );

                    // If deliveryUuid wasn't explicitly passed, also broadcast to any active deliveries for this driver
                    if (!data.deliveryUuid) {
                        const [activeDels] = await pool.query(
                            `SELECT uuid FROM deliveries WHERE driver_id = ? AND delivery_status IN ('pending', 'scheduled', 'dispatched', 'en_route', 'arrived')`,
                            [data.driverId]
                        );
                        for (const del of activeDels) {
                            io.to(`delivery_${del.uuid}`).emit('location_updated', {
                                lat: parsedLat,
                                lng: parsedLng,
                                driverId: data.driverId,
                                timestamp: new Date()
                            });
                        }
                    }
                } else if (data.userId) {
                    await pool.query(
                        `UPDATE drivers SET last_location_lat = ?, last_location_lng = ?, last_location_update = NOW() WHERE user_id = ?`,
                        [parsedLat, parsedLng, data.userId]
                    );
                }
            } catch (err) {
                console.error('Socket location update persistence error:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

module.exports = initSocket;

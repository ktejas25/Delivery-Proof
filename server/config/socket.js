const socketIo = require('socket.io');

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

        socket.on('update_location', (data) => {
            // data: { deliveryUuid, lat, lng, driverId }
            io.to(`delivery_${data.deliveryUuid}`).emit('location_updated', {
                lat: data.lat,
                lng: data.lng,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

module.exports = initSocket;

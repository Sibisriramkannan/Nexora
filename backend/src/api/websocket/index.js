// ✅ FIX 16-18: Unified WebSocket implementation
const jwt = require('jsonwebtoken');

let io = null;
const clients = new Map();

const initWebSocket = (server) => {
    const { Server } = require('socket.io');
    
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        
        clients.set(socket.id, {
            userId: socket.userId,
            role: socket.userRole,
            socket: socket
        });

        // ✅ FIX 18: Unified room format
        socket.on('join', (data) => {
            const room = typeof data === 'string' ? data : data.room;
            if (room) {
                socket.join(room);
                console.log(`📡 ${socket.id} joined room: ${room}`);
            }
        });

        socket.on('leave', (data) => {
            const room = typeof data === 'string' ? data : data.room;
            if (room) {
                socket.leave(room);
                console.log(`📡 ${socket.id} left room: ${room}`);
            }
        });

        socket.on('subscribe_server', (data) => {
            const serverId = typeof data === 'string' ? data : data.serverId;
            if (serverId) {
                socket.join(`server:${serverId}`);
                console.log(`📡 ${socket.id} subscribed to server: ${serverId}`);
            }
        });

        socket.on('unsubscribe_server', (data) => {
            const serverId = typeof data === 'string' ? data : data.serverId;
            if (serverId) {
                socket.leave(`server:${serverId}`);
                console.log(`📡 ${socket.id} unsubscribed from server: ${serverId}`);
            }
        });

        socket.on('disconnect', () => {
            clients.delete(socket.id);
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

// Broadcast functions
const broadcastToRoom = (room, event, data) => {
    if (io) {
        io.to(room).emit(event, data);
    }
};

const broadcastToUser = (userId, event, data) => {
    if (io) {
        for (const [id, client] of clients) {
            if (client.userId === userId) {
                client.socket.emit(event, data);
            }
        }
    }
};

const broadcastToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

const getIO = () => io;
const getClients = () => clients;

module.exports = {
    initWebSocket,
    broadcastToRoom,
    broadcastToUser,
    broadcastToAll,
    getIO,
    getClients
};
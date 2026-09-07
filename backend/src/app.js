const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');  // ✅ FIX 2: Added jwt import

// Import agent manager
const agentManager = require('./agents/agentManager');  // ✅ FIX 3: Added agentManager import

dotenv.config();

const app = express();
const server = createServer(app);

// ==================== MIDDLEWARE ====================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
app.use('/api', limiter);

// ==================== WEBSOCKET ====================
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

const clients = new Map();

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    clients.set(socket.id, {
        userId: socket.userId,
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

    socket.on('disconnect', () => {
        clients.delete(socket.id);
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

const broadcastToRoom = (room, event, data) => {
    io.to(room).emit(event, data);
};

const broadcastToUser = (userId, event, data) => {
    for (const [id, client] of clients) {
        if (client.userId === userId) {
            client.socket.emit(event, data);
        }
    }
};

app.set('io', io);
app.set('broadcastToRoom', broadcastToRoom);
app.set('broadcastToUser', broadcastToUser);
global.__nexoraIo = io;

// ==================== ROUTES ====================
const authRoutes = require('./api/routes/auth');
const serverRoutes = require('./api/routes/servers');
const monitorRoutes = require('./api/routes/monitors');
const scannerRoutes = require('./api/routes/scanner');
const alertRoutes = require('./api/routes/alerts');
const integrationRoutes = require('./api/routes/integrations');
const configRoutes = require('./api/routes/config');
const reportRoutes = require('./api/routes/reports');
const dashboardRoutes = require('./api/routes/dashboard');  // ✅ FIX 4: Added dashboard routes
const agentRoutes = require('./agents');  // Agent routes
const cloudRoutes = require('./api/routes/cloud');
const scheduleRoutes = require('./api/routes/schedules');
const telemetryRoutes = require('./api/routes/telemetry');
const agentEnrollmentRoutes = require('./api/routes/agentEnrollment');

app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/config', configRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);  // ✅ FIX 4: Mount dashboard routes
app.use('/api/agents', agentRoutes);  // ✅ FIX 5: Agent routes with correct path
app.use('/api/cloud', cloudRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/agent-enrollment', agentEnrollmentRoutes);

// ==================== PUBLIC AGENT INSTALLERS ====================
const fs = require('fs');
const installerTemplateDir = path.join(__dirname, 'installers', 'templates');
const renderInstaller = (name, token, req) => fs.readFileSync(path.join(installerTemplateDir, name), 'utf8')
    .replaceAll('__NEXORA_URL__', `${req.protocol}://${req.get('host')}`)
    .replaceAll('__TOKEN__', token || '');
app.get('/agent', (req, res) => res.type('html').send('<!doctype html><html><head><title>Nexora Agent</title></head><body><h1>Nexora Agent Installer</h1><p>Use a one-time enrollment link generated from Nexora &rarr; Infrastructure &rarr; Add Server.</p><p>Linux: <code>/agent/linux/installer/&lt;token&gt;</code></p><p>Windows: <code>/agent/windows/installer/&lt;token&gt;</code></p></body></html>'));
app.get('/agent/linux/installer', (req, res) => { res.type('text/plain').send(renderInstaller('linux-installer.sh', req.query.token, req)); });
app.get('/agent/windows/installer', (req, res) => { res.type('text/plain').send(renderInstaller('windows-installer.ps1', req.query.token, req)); });
app.get('/agent/linux/installer/:token', (req, res) => { res.type('text/plain').set('Content-Disposition', 'attachment; filename=Nexora-Agent-Linux-Installer.sh').send(renderInstaller('linux-installer.sh', req.params.token, req)); });
app.get('/agent/windows/installer/:token', (req, res) => { res.type('text/plain').set('Content-Disposition', 'attachment; filename=Nexora-Agent-Windows-Installer.ps1').send(renderInstaller('windows-installer.ps1', req.params.token, req)); });

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

app.get('/api/agents/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        agents: {
            linux: true,
            windows: true,
            registered: agentManager.getAllAgents().length
        }
    });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ==================== DATABASE INITIALIZATION ====================
const { sequelize } = require('./config/database');
const dbManager = require('./utils/database');

// ==================== START SERVER ====================
const PORT = process.env.PORT || 8080;

const startServer = async () => {
    try {
        // Initialize database
        await dbManager.initialize();
        console.log('✅ Database initialized');

        // Start agent heartbeat checker
        agentManager.startHeartbeatChecker();

        // Start persistent security scan scheduler
        await require('./scheduler').start();
        require('./services/storageGuard').startStorageGuard();

        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 Nexora Backend running on port ${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 WebSocket server ready`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = { app, server, io };
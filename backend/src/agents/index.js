const express = require('express');
const router = express.Router();
const linuxAgentRoutes = require('./linux');
const windowsAgentRoutes = require('./windows');

// Mount Linux agent routes
router.use('/linux', linuxAgentRoutes);

// Mount Windows agent routes
router.use('/windows', windowsAgentRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            linux: true,
            windows: true
        }
    });
});

module.exports = router;
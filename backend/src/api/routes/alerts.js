const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/alerts - Get all alerts
router.get('/', alertController.getAllAlerts);

// GET /api/alerts/stats - Get alert statistics
router.get('/stats', alertController.getAlertStats);

// GET /api/alerts/:id - Get alert by ID
router.get('/:id', alertController.getAlertById);

// POST /api/alerts/:id/acknowledge - Acknowledge alert
router.post('/:id/acknowledge', alertController.acknowledgeAlert);

// POST /api/alerts/:id/resolve - Resolve alert
router.post('/:id/resolve', alertController.resolveAlert);

// POST /api/alerts/:id/mute - Mute alert
router.post('/:id/mute', alertController.muteAlert);

module.exports = router;
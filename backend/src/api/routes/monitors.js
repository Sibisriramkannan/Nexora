const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/monitors - Get all monitors
router.get('/', monitorController.getAllMonitors);

// GET /api/monitors/:id - Get monitor by ID
router.get('/:id', monitorController.getMonitorById);

// POST /api/monitors - Create monitor
router.post('/', monitorController.createMonitor);

// PUT /api/monitors/:id - Update monitor
router.put('/:id', monitorController.updateMonitor);

// DELETE /api/monitors/:id - Delete monitor
router.delete('/:id', monitorController.deleteMonitor);

// POST /api/monitors/:id/test - Test monitor
router.post('/:id/test', monitorController.testMonitor);

module.exports = router;
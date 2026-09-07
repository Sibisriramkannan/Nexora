const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/uptime - Get uptime data
router.get('/uptime', dashboardController.getUptimeData);

// GET /api/dashboard/trend - Get trend data
router.get('/trend', dashboardController.getTrendData);

module.exports = router;
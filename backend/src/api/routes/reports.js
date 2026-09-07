const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/reports - Get all reports
router.get('/', reportController.getAllReports);

// POST /api/reports/generate - Generate report
router.post('/generate', reportController.generateReport);

// GET /api/reports/:id - Get report by ID
router.get('/:id', reportController.getReportById);

// GET /api/reports/:id/download - Download report
router.get('/:id/download', reportController.downloadReport);

// DELETE /api/reports/:id - Delete report
router.delete('/:id', reportController.deleteReport);

// POST /api/reports/schedule - Schedule report
router.post('/schedule', reportController.scheduleReport);

module.exports = router;
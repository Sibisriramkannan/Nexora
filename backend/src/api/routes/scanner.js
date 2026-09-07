const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/scanner - Get all scans
router.get('/', scannerController.getAllScans);

// GET /api/scanner/:id - Get scan by ID
router.get('/:id', scannerController.getScanById);

// GET /api/scanner/:id/results - Get scan results
router.get('/:id/results', scannerController.getScanResults);

// POST /api/scanner - Create scan
router.post('/', scannerController.createScan);

// POST /api/scanner/:id/start - Start scan
router.post('/:id/start', scannerController.startScan);

// POST /api/scanner/:id/cancel - Cancel scan
router.post('/:id/cancel', scannerController.cancelScan);

// DELETE /api/scanner/:id - Delete scan
router.delete('/:id', scannerController.deleteScan);

module.exports = router;
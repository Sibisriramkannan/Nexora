const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/config - Get all config
router.get('/', configController.getAllConfig);

// GET /api/config/:category - Get config by category
router.get('/:category', configController.getConfigByCategory);

// GET /api/config/:category/:key - Get specific config
router.get('/:category/:key', configController.getConfig);

// PUT /api/config - Update config
router.put('/', configController.updateConfig);

// PUT /api/config/:category/:key - Update specific config
router.put('/:category/:key', configController.updateSpecificConfig);

// POST /api/config/import - Import config from file
router.post('/import', configController.importConfig);

// GET /api/config/export - Export config
router.get('/export', configController.exportConfig);

module.exports = router;
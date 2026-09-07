const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/integrations - Get all integrations
router.get('/', integrationController.getAllIntegrations);

// GET /api/integrations/:id - Get integration by ID
router.get('/:id', integrationController.getIntegrationById);

// POST /api/integrations - Create integration
router.post('/', integrationController.createIntegration);

// PUT /api/integrations/:id - Update integration
router.put('/:id', integrationController.updateIntegration);

// DELETE /api/integrations/:id - Delete integration
router.delete('/:id', integrationController.deleteIntegration);

// POST /api/integrations/:id/test - Test integration
router.post('/:id/test', integrationController.testIntegration);

module.exports = router;
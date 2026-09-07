const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const { auth, authorize } = require('../middleware/auth');
const { validateServer } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// GET /api/servers - Get all servers
router.get('/', serverController.getAllServers);

// GET /api/servers/:id - Get server by ID
router.get('/:id', serverController.getServerById);

// POST /api/servers - Create server
router.post('/', validateServer, serverController.createServer);

// POST /api/servers/bulk - Bulk import servers
router.post('/bulk', serverController.bulkImportServers);

// PUT /api/servers/:id - Update server
router.put('/:id', serverController.updateServer);

// DELETE /api/servers/:id - Delete server
router.delete('/:id', serverController.deleteServer);

module.exports = router;
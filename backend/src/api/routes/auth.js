const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateLogin, validateRegister } = require('../middleware/validation');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/mfa/enable', auth, authController.enableMFA);
router.post('/mfa/verify', authController.verifyMFA);
router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
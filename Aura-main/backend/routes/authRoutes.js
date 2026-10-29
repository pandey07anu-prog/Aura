const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.get('/status', authController.getStatus);
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected auth routes
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;

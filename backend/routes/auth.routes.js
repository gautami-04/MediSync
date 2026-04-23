const express = require('express');
const router = express.Router();
const {
	register,
	login,
	sendOtp,
	verifyOtp,
	requestPasswordReset,
	verifyResetOtp,
	resetPassword,
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
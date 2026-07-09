const express = require('express');
const { protect } = require('../middleware/auth');
const {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

module.exports = router;
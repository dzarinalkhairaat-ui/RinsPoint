const express = require('express');
const router = express.Router();
// Controller ada di folder sebelah, jadi cukup mundur 1 langkah (../)
const otpController = require('../controllers/otpController');

router.post('/send', otpController.sendOtp);
router.post('/verify', otpController.verifyOtp);

module.exports = router;
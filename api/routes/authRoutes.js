const express = require('express');
const router = express.Router();

// Import Controller (HANYA SATU KALI)
const { 
    loginUser, 
    verifyPin, 
    updateProfile 
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Route Login Admin
router.post('/login', loginUser);

// Route Verifikasi PIN Saldo (Admin Only)
router.post('/verify-pin', protect, verifyPin);

// Route Update Akun Admin (Email/Password)
router.put('/profile', protect, updateProfile);

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
    getSettings, 
    updateSettings, 
    updateDigiflazz, 
    updateBanners 
} = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Wajib ada untuk FormData

// Get Settings (Public)
router.get('/', getSettings);

// Update Settings Umum & PPOB (Admin)
// PENTING: upload.any() ditambahkan agar backend bisa membaca FormData (Gambar + Text)
router.put('/', protect, admin, upload.any(), updateSettings);

// Update Konfigurasi Digiflazz (Admin)
router.put('/digiflazz', protect, admin, updateDigiflazz);

// Upload Banners (Admin)
router.post('/banners', protect, admin, upload.any(), updateBanners);

module.exports = router;
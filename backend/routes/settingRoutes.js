const express = require('express');
const router = express.Router();
const { 
    getSettings, 
    updateSettings, 
    updateDigiflazz,
    updateBanners 
} = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import Upload Middleware

// Route GET Public (Ambil data setting untuk frontend)
router.get('/', getSettings);

// Route PUT Admin (Update Setting Umum & Kontak)
router.put('/', protect, updateSettings);

// Route PUT Admin (Update Konfigurasi Digiflazz)
router.put('/digiflazz', protect, updateDigiflazz);

// Route PUT Admin (Update Banner dengan Upload Gambar)
// Menggunakan upload.any() agar bisa menerima multiple files dari form
router.put('/banners', protect, upload.any(), updateBanners);

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
    getSettings, 
    updateSettings, 
    updateDigiflazz,
    getPPOBConfig,    // <-- Import fungsi baru
    updatePPOBConfig  // <-- Import fungsi baru
} = require('../controllers/settingController');

const { protect } = require('../middleware/authMiddleware'); // Pastikan ini ada agar aman

// --- RUTE PENGATURAN UMUM ---
router.get('/', getSettings);
router.put('/', protect, updateSettings); // Tambahkan protect jika ingin aman
router.put('/digiflazz', protect, updateDigiflazz);

// --- RUTE KHUSUS PPOB (BARU) ---
// Endpoint: /api/settings/ppob
router.get('/ppob', protect, getPPOBConfig);   // Mengambil data margin/status untuk halaman admin
router.post('/ppob', protect, updatePPOBConfig); // Menyimpan data dari halaman admin

module.exports = router;
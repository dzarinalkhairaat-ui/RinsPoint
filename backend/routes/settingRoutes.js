const express = require('express');
const router = express.Router();
const { 
    getSettings, 
    updateSettings, 
    updateDigiflazz 
} = require('../controllers/settingController');

// --- RUTE PENGATURAN BERSIH ---

// Ambil Data Setting
router.get('/', getSettings);

// Update Teks (Nama Toko, Kontak, dll)
router.put('/', updateSettings);

// Update Konfigurasi Digiflazz
router.put('/digiflazz', updateDigiflazz);

// FITUR UPLOAD BANNER SUDAH DIHAPUS TOTAL DARI SINI
// SEHINGGA TIDAK AKAN ADA ERROR "CALLBACK UNDEFINED" LAGI

module.exports = router;
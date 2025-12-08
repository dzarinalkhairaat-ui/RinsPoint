const express = require('express');
const router = express.Router();
const ppobController = require('../controllers/ppobController');
// const { protect } = require('../middleware/authMiddleware'); 
// (Optional: Jika ingin protect route tertentu, uncomment baris di atas)

// ==============================
//  ROUTE PUBLIC (Untuk Frontend)
// ==============================

// 1. Ambil Daftar Harga (Pricelist) dari PortalPulsa
// Method POST karena kita mungkin kirim filter kategori
router.post('/pricelist', ppobController.getPriceList);

// 2. Buat Transaksi Baru
router.post('/transaction', ppobController.createTransaction);

// 3. Cek Status Detail Transaksi (Dipakai di halaman Payment)
router.get('/transaction/:trxId', ppobController.getTransactionDetail);

// ==============================
//  ROUTE CALLBACK / WEBHOOK
// ==============================

// Ini URL yang wajib didaftarkan di Dashboard PortalPulsa
// DomainRender/api/ppob/callback
router.post('/callback', ppobController.handleWebhook); 

// ==============================
//  ROUTE ADMIN (Optional/Nanti)
// ==============================
// router.get('/balance', protect, ppobController.checkBalance);
// router.get('/history', protect, ppobController.getTransactions);

module.exports = router;
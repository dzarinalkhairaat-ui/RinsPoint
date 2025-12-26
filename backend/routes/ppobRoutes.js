const express = require('express');
const router = express.Router();
const ppobController = require('../controllers/ppobController');
// IMPORT MIDDLEWARE UPLOAD (PENTING)
const upload = require('../middleware/uploadMiddleware');

// ==============================
//  ROUTE PUBLIC (Untuk Frontend User)
// ==============================

// 1. Ambil Daftar Harga
router.post('/pricelist', ppobController.getPriceList);

// 2. Buat Transaksi Baru (DENGAN UPLOAD BUKTI BAYAR)
router.post('/transaction', upload.single('paymentProof'), ppobController.createTransaction);

// 3. Cek Status Detail Transaksi (Dipakai user untuk cek resi/status)
router.get('/transaction/:trxId', ppobController.getTransactionDetail);

// ==============================
//  ROUTE CALLBACK / WEBHOOK
// ==============================
router.post('/callback', ppobController.handleWebhook); 

// ==============================
//  ROUTE ADMIN (Fitur Baru)
// ==============================

// 1. Ambil SEMUA Data Order (Untuk Tabel Admin)
router.get('/all-transactions', ppobController.getAllTransactions);

// 2. Update Status Order (Saat Admin klik Sukses/Gagal)
// Menggunakan method PUT karena kita mengupdate data yang sudah ada
router.put('/transaction/:trxId', ppobController.updateTransactionStatus);

module.exports = router;
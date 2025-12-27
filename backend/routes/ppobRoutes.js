const express = require('express');
const router = express.Router();
const ppobController = require('../controllers/ppobController');
const upload = require('../middleware/uploadMiddleware');

// ==============================
//  ROUTE PUBLIC
// ==============================
router.post('/pricelist', ppobController.getPriceList);
router.post('/transaction', upload.single('paymentProof'), ppobController.createTransaction);
router.get('/transaction/:trxId', ppobController.getTransactionDetail);
router.post('/callback', ppobController.handleWebhook); 

// ==============================
//  ROUTE ADMIN
// ==============================
router.get('/all-transactions', ppobController.getAllTransactions);
router.put('/transaction/:trxId', ppobController.updateTransactionStatus);
router.delete('/transaction/:trxId', ppobController.deleteTransaction);

// --- FITUR BARU: MANAJEMEN TOKEN ---
router.post('/admin/save-token', ppobController.saveAdminToken);    // Simpan/Update
router.get('/admin/tokens', ppobController.getAdminTokens);         // Lihat Daftar
router.delete('/admin/token/:id', ppobController.deleteAdminToken); // Hapus Token

module.exports = router;
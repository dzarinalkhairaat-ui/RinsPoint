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

// --- FITUR BARU: DELETE TRANSAKSI ---
router.delete('/transaction/:trxId', ppobController.deleteTransaction);

module.exports = router;
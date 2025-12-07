const express = require('express');
const router = express.Router();
const { 
    getPriceList, 
    checkBalance, 
    createTransaction, 
    getTransactions, 
    updateTransactionStatus,
    getTransactionDetail,
    deleteTransaction,
    handleWebhook // <--- Import ini
} = require('../controllers/ppobController');
const { protect } = require('../middleware/authMiddleware');

// Route Public (Untuk Frontend)
router.post('/pricelist', getPriceList);
router.post('/transaction', createTransaction);
router.get('/transaction/:trxId', getTransactionDetail);

// ROUTE WEBHOOK (WAJIB PUBLIC & POST)
// Ini url yang nanti didaftarkan di Digiflazz: https://domain-anda.com/api/ppob/callback
router.post('/callback', handleWebhook); 

// Route Admin (Perlu Login)
router.get('/balance', protect, checkBalance);
router.get('/history', protect, getTransactions);
router.put('/transaction/:id', protect, updateTransactionStatus);
router.delete('/transaction/:id', protect, deleteTransaction);

module.exports = router;
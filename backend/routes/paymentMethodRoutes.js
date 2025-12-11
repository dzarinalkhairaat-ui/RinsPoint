const express = require('express');
const router = express.Router();
const { 
    getPaymentMethods, 
    addPaymentMethod, 
    deletePaymentMethod 
} = require('../controllers/paymentMethodController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Untuk upload logo bank

// Public Route (Ambil Data)
router.get('/', getPaymentMethods);

// Admin Routes (Tambah & Hapus)
router.post('/', protect, admin, upload.single('icon'), addPaymentMethod);
router.delete('/:id', protect, admin, deletePaymentMethod);

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    createProduct, 
    deleteProduct, 
    getProductBySlug,
    searchProducts,
    updateProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import Upload

// Route Public
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/item/:slug', getProductBySlug);

// Route Admin (Upload Gambar Aktif)
// upload.array('images', 5) artinya menerima maksimal 5 file dengan nama field 'images'
router.post('/', protect, upload.array('images', 5), createProduct);

router.delete('/:id', protect, deleteProduct);

router.put('/:id', protect, upload.array('images', 5), updateProduct);

module.exports = router;
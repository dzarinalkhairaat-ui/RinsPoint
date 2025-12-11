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
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 

// Route Public
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/item/:slug', getProductBySlug);

// Route Admin (Create)
// Support dual mode upload: 'image' (PPOB) atau 'images' (Affiliate)
router.post('/', protect, admin, upload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'images', maxCount: 5 }
]), createProduct);

// Route Admin (Delete)
router.delete('/:id', protect, admin, deleteProduct);

// Route Admin (Update)
router.put('/:id', protect, admin, upload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'images', maxCount: 5 }
]), updateProduct);

module.exports = router;
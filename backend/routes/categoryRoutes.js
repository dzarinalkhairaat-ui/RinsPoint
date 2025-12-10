const express = require('express');
const router = express.Router();
const { 
    getCategories, 
    createCategory, 
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Route Public
router.get('/', getCategories);

// Route Admin
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory); // Edit Kategori
router.delete('/:id', protect, deleteCategory); // Hapus Kategori

// Route Subkategori
router.post('/:id/sub', protect, addSubcategory); // Tambah Sub
router.delete('/:id/sub/:subId', protect, deleteSubcategory); // Hapus Sub

module.exports = router;
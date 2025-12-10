const Category = require('../../models/Category');

// @desc    Ambil semua kategori
// @route   GET /api/categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tambah Kategori Baru
// @route   POST /api/categories
const createCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;
        const category = await Category.create({ name, icon: icon || 'fa-box' });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Gagal membuat kategori' });
    }
};

// @desc    Edit Kategori Utama (Nama & Icon)
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;
        const category = await Category.findById(req.params.id);

        if (category) {
            category.name = name || category.name;
            category.icon = icon || category.icon;
            // Update slug jika nama berubah
            if(name) category.slug = name.toLowerCase().split(' ').join('-').replace(/[^\w-]+/g, '');
            
            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Kategori tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Gagal update kategori' });
    }
};

// @desc    Hapus Kategori Utama
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            await category.deleteOne();
            res.json({ message: 'Kategori dihapus' });
        } else {
            res.status(404).json({ message: 'Tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tambah Subkategori
// @route   POST /api/categories/:id/sub
const addSubcategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findById(req.params.id);

        if (category) {
            const slug = name.toLowerCase().split(' ').join('-').replace(/[^\w-]+/g, '');
            
            // Cek duplikat subkategori
            const exists = category.subcategories.find(s => s.name === name);
            if(exists) return res.status(400).json({message: 'Subkategori sudah ada'});

            category.subcategories.push({ name, slug });
            await category.save();
            res.json(category);
        } else {
            res.status(404).json({ message: 'Kategori induk tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Gagal tambah subkategori' });
    }
};

// @desc    Hapus Subkategori
// @route   DELETE /api/categories/:id/sub/:subId
const deleteSubcategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            // Filter array untuk membuang subkategori yang dipilih
            category.subcategories = category.subcategories.filter(
                sub => sub._id.toString() !== req.params.subId
            );
            await category.save();
            res.json(category);
        } else {
            res.status(404).json({ message: 'Kategori tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Gagal hapus subkategori' });
    }
};

module.exports = { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    addSubcategory,
    deleteSubcategory
};
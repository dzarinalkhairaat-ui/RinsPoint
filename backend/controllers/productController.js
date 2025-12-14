// PATH: Mundur 2 langkah ke root folder models (sesuai struktur folder bapak)
const Product = require('../../models/Product');
const mongoose = require('mongoose');

// --- HELPER: Buat Slug Bersih ---
const createSlug = (text) => {
    return text.toString().toLowerCase()
        .replace(/\(/g, '').replace(/\)/g, '')
        .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        .replace(/-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
};

// @desc    Ambil produk (Support Filter Kategori String untuk PPOB)
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        let query = {};
        
        // 1. FILTER PLATFORM
        // Jika param ?platform=PPOB ada, tampilkan PPOB. Jika tidak, tampilkan Affiliate.
        if (req.query.platform) {
            query.platform = req.query.platform;
        } else {
            query.platform = { $ne: 'PPOB' }; 
        }

        // 2. FILTER KATEGORI (Hybrid: ID atau String)
        if (req.query.category) {
            const cat = req.query.category;
            
            if (mongoose.Types.ObjectId.isValid(cat)) {
                // Jika inputnya ID (Untuk Affiliate/Toko)
                query.category = { $in: [cat, new mongoose.Types.ObjectId(cat)] };
            } else {
                // Jika inputnya String (Untuk PPOB: "Dana", "Pulsa", "MLBB")
                // Menggunakan Regex agar case-insensitive (dana == Dana)
                query.category = { $regex: new RegExp(`^${cat}$`, 'i') };
            }
        } 

        // 3. FILTER SUBKATEGORI
        if (req.query.subcategory) {
            query.subcategory = req.query.subcategory;
        }

        // 4. SEARCH KEYWORD
        if (req.query.keyword) {
            query.name = { $regex: req.query.keyword, $options: 'i' };
        }

        // Sorting
        let sortOption = { createdAt: -1 }; 
        if (req.query.sort === 'lowest') sortOption = { price: 1 };
        if (req.query.sort === 'highest') sortOption = { price: -1 };

        const products = await Product.find(query).sort(sortOption);
            
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tambah produk (Auto Platform PPOB)
const createProduct = async (req, res) => {
    try {
        const { name, description, price, originalPrice, category, subcategory, affiliateLink, platform } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({ message: 'Mohon lengkapi nama, kategori, dan harga.' });
        }

        // Handle Images
        let imageUrls = [];
        if (req.files) {
            if (req.files['image']) {
                imageUrls.push(req.files['image'][0].path);
            }
            if (req.files['images']) {
                const paths = req.files['images'].map(file => file.path);
                imageUrls = imageUrls.concat(paths);
            }
        } else if (req.body.images) {
             imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        // Logika Penentuan Platform
        let finalPlatform = platform || 'Affiliate';
        
        // Jika tidak ada link affiliate, otomatis jadi PPOB
        if (!affiliateLink || affiliateLink.trim() === "") {
            finalPlatform = 'PPOB';
        }

        // Validasi khusus Affiliate
        if (finalPlatform !== 'PPOB') {
            if (!affiliateLink) return res.status(400).json({ message: 'Link Affiliate wajib diisi.' });
        }

        const product = new Product({
            name,
            slug: createSlug(name) + '-' + Date.now().toString().slice(-4), 
            description: description || 'Deskripsi Produk',
            price,
            originalPrice: originalPrice || 0,
            category, 
            subcategory: subcategory || null,
            affiliateLink: affiliateLink || '', 
            images: imageUrls,
            platform: finalPlatform, 
            user: req.user._id
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);

    } catch (error) {
        console.error("Create Error:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Cari produk (Umum)
const searchProducts = async (req, res) => {
    const keyword = req.query.keyword;
    try {
        const products = await Product.find({
            name: { $regex: keyword, $options: 'i' }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Hapus produk
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Produk berhasil dihapus' });
        } else {
            res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Detail produk
const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (product) {
             res.json(product);
        } else {
            res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Produk
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, originalPrice, category, subcategory, affiliateLink, platform } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        if (req.files) {
            if (req.files['image']) {
                product.images = [req.files['image'][0].path];
            } else if (req.files['images']) {
                product.images = req.files['images'].map(file => file.path);
            }
        }

        product.name = name || product.name;
        if(name) product.slug = createSlug(name) + '-' + Date.now().toString().slice(-4);
        product.description = description || product.description;
        product.price = price || product.price;
        product.originalPrice = originalPrice || product.originalPrice;
        product.category = category || product.category;
        product.subcategory = subcategory || product.subcategory;
        product.affiliateLink = affiliateLink !== undefined ? affiliateLink : product.affiliateLink;
        product.platform = platform || product.platform;

        const updatedProduct = await product.save();
        res.json(updatedProduct);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getProducts, 
    createProduct, 
    deleteProduct, 
    getProductBySlug, 
    searchProducts, 
    updateProduct 
};
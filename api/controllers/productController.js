const Product = require('../../models/Product');

// @desc    Ambil semua produk (Filter: Category, Subcategory, Sort)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        let query = {};
        
        // Filter Kategori Utama
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter Subkategori
        if (req.query.subcategory) {
            query.subcategory = req.query.subcategory;
        }

        // Logic Sortir
        let sortOption = { createdAt: -1 }; 
        if (req.query.sort === 'lowest') sortOption = { price: 1 };
        if (req.query.sort === 'highest') sortOption = { price: -1 };

        const products = await Product.find(query)
            .populate('category', 'name') 
            .sort(sortOption);
            
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tambah produk baru (Support Upload Gambar)
// @route   POST /api/products
// @access  Private (Admin Only)
const createProduct = async (req, res) => {
    try {
        const { name, description, price, originalPrice, category, subcategory, affiliateLink, platform } = req.body;

        // 1. TANGKAP FILE GAMBAR (Dari Cloudinary Middleware)
        let imageUrls = [];

        // Cek apakah ada file yang diupload via Multer
        if (req.files && req.files.length > 0) {
            // Ambil URL secure dari Cloudinary
            imageUrls = req.files.map(file => file.path);
        } else {
            // Cek jika dikirim sebagai text URL (Fallback)
            if (req.body.images) {
                imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            }
        }

        // 2. VALIDASI JUMLAH GAMBAR (Min 2, Max 5)
        if (imageUrls.length < 2) {
            return res.status(400).json({ message: 'Gagal: Wajib upload minimal 2 gambar produk!' });
        }
        if (imageUrls.length > 5) {
            return res.status(400).json({ message: 'Gagal: Maksimal 5 gambar produk.' });
        }

        // 3. VALIDASI LINK AFFILIATE (Regex)
        const validPatterns = [
            /shopee\.co\.id/, /shope\.ee/, 
            /tokopedia\.com/, /tokopedia\.link/,
            /tiktok\.com/, /vt\.tiktok\.com/,
            /lazada\.co\.id/, /s\.lazada/
        ];

        const isValidLink = validPatterns.some(pattern => pattern.test(affiliateLink));

        if (!isValidLink) {
            return res.status(400).json({ 
                message: 'Link Affiliate tidak valid! Gunakan link Shopee, Tokopedia, TikTok, atau Lazada.' 
            });
        }

        // 4. SIMPAN PRODUK KE DATABASE
        const product = new Product({
            name,
            description,
            price,
            originalPrice,
            category,
            subcategory: subcategory || null,
            affiliateLink,
            images: imageUrls, // Simpan Array URL Gambar
            platform,
            user: req.user._id
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Hapus produk
// @route   DELETE /api/products/:id
// @access  Private (Admin Only)
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

// @desc    Ambil detail produk by slug
// @route   GET /api/products/item/:slug
const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
                                     .populate('category', 'name icon');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cari produk
// @route   GET /api/products/search?keyword=...
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

// @desc    Update Produk
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, originalPrice, category, subcategory, affiliateLink, platform } = req.body;
        
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        // 1. Cek Update Gambar
        let imageUrls = product.images; // Default pakai gambar lama

        if (req.files && req.files.length > 0) {
            // Jika ada upload baru, ganti semua gambar
            imageUrls = req.files.map(file => file.path);
        }

        // 2. Update Field
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.originalPrice = originalPrice || product.originalPrice;
        product.category = category || product.category;
        product.subcategory = subcategory || product.subcategory;
        product.affiliateLink = affiliateLink || product.affiliateLink;
        product.platform = platform || product.platform;
        product.images = imageUrls;

        const updatedProduct = await product.save();
        res.json(updatedProduct);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE EXPORTS
module.exports = { 
    getProducts, 
    createProduct, 
    deleteProduct, 
    getProductBySlug,
    searchProducts,
    updateProduct // <--- TAMBAH INI
};
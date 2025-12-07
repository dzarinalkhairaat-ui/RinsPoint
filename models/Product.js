const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nama produk wajib diisi'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Deskripsi wajib diisi']
    },
    price: {
        type: Number,
        required: [true, 'Harga wajib diisi']
    },
    originalPrice: {
        type: Number, // Untuk menampilkan harga coret (diskon)
    },
    images: [{
        type: String // Array URL gambar
    }],
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    // TAMBAHAN BARU:
    subcategory: {
        type: String, // Kita simpan ID atau Nama Subkategori di sini
        default: null
    },
    affiliateLink: {
        type: String,
        required: [true, 'Link affiliate wajib diisi'],
        // Validasi dasar link (akan diperkuat di controller)
        match: [/^(http|https):\/\//, 'Link harus dimulai dengan http atau https']
    },
    platform: {
        type: String,
        enum: ['shopee', 'tokopedia', 'tiktok', 'lazada', 'other'],
        default: 'other'
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    clicks: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Auto slug
productSchema.pre('save', function(next) {
    if(this.isModified('name')){
        this.slug = this.name.toLowerCase().split(' ').join('-') + '-' + Date.now();
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);
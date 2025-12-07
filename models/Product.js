const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    // --- TAMBAHKAN INI ---
    slug: {
        type: String,
        required: true,
        unique: true, // Pastikan tidak ada slug kembar
    },
    // ---------------------
    images: [String], // Array URL Gambar
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    originalPrice: {
        type: Number,
        default: 0,
    },
    affiliateLink: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
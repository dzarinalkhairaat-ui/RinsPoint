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
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    images: [String], 
    
    // Tipe Mixed agar bisa menerima ObjectId (Affiliate) ATAU String (PPOB)
    category: {
        type: mongoose.Schema.Types.Mixed, 
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
    
    // Tidak wajib, agar PPOB bisa masuk tanpa error link affiliate
    affiliateLink: {
        type: String,
        required: false 
    },
    
    // Penanda jenis produk: 'PPOB' atau 'Affiliate'
    platform: {
        type: String,
        required: false,
        default: 'Affiliate' 
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
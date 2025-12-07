const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nama kategori wajib diisi'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    icon: {
        type: String,
        default: 'fa-box'
    },
    // KOLOM BARU: Array untuk Subkategori
    subcategories: [{
        name: String,
        slug: String
    }]
}, { timestamps: true });

// Auto slug untuk Kategori Utama
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().split(' ').join('-').replace(/[^\w-]+/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
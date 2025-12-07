const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    siteName: { type: String, default: 'RinsPoint' },
    adminContacts: [{
        name: String,
        phone: String,
        isActive: { type: Boolean, default: true }
    }],
    ppobMargin: { type: Number, default: 500 },
    
    // Kredensial Digiflazz
    digiflazz: {
        username: { type: String, select: false },
        apiKey: { type: String, select: false },
        mode: { type: String, default: 'development' }
    },

    // UPDATE: Array Banners (Judul, Subjudul, Warna, Kode SVG)
    banners: [{
        title: String,      // Contoh: "Belanja Hemat"
        subtitle: String,   // Contoh: "Diskon hari ini"
        gradient: String,   // CSS Gradient
        svgIcon: String     // Kode <svg>...</svg>
    }]
});

module.exports = mongoose.model('Setting', settingSchema);
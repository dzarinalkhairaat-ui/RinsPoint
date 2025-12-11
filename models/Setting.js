const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    siteName: { type: String, default: 'RinsPoint' },
    
    // --- KONTAK ADMIN ---
    adminPhone: { type: String, default: '6281234567890' }, 
    adminContacts: [{
        name: String,
        phone: String,
        isActive: { type: Boolean, default: true }
    }],
    
    // --- PENGATURAN PPOB (MARGIN & JAM KERJA) ---
    ppobMargin: { type: Number, default: 500 },
    ppobStatus: { type: Boolean, default: true }, // Toko Buka (true) / Tutup (false)
    ppobOpenTime: { type: String, default: "06:00" }, 
    ppobCloseTime: { type: String, default: "23:30" },

    // --- LOGO PROVIDER CUSTOM ---
    providerLogos: {
        telkomsel: { type: String, default: '' },
        indosat: { type: String, default: '' },
        xl: { type: String, default: '' },
        axis: { type: String, default: '' },
        tri: { type: String, default: '' },
        smartfren: { type: String, default: '' },
        pln: { type: String, default: '' },
        dana: { type: String, default: '' },
        ovo: { type: String, default: '' },
        gopay: { type: String, default: '' },
        shopeepay: { type: String, default: '' }
    },
    
    // Kredensial Digiflazz
    digiflazz: {
        username: { type: String, select: false },
        apiKey: { type: String, select: false },
        mode: { type: String, default: 'development' }
    },

    // Array Banners
    banners: [{
        title: String,      
        subtitle: String,   
        gradient: String,   
        svgIcon: String,
        link: String,        
        background: String, 
        imageUrl: String    
    }]
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
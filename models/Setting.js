const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    siteName: { type: String, default: 'RinsPoint' },
    
    // --- UPDATE: NOMOR WA UTAMA (Untuk Floating & Notif) ---
    adminPhone: { type: String, default: '6281234567890' }, 

    // Kontak tambahan (Opsional, fitur lama Anda)
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
});

module.exports = mongoose.model('Setting', settingSchema);
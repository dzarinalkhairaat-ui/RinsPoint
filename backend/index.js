require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors({ origin: '*', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
// Limit diperbesar agar upload gambar produk fisik aman
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// --- 2. KONEKSI DATABASE (STANDAR & STABIL) ---
// Kita konek sekali di awal, dan biarkan nyala terus.
// Ini solusi paling anti-repot untuk Localhost.
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected (Siap Tempur!)');
    } catch (error) {
        console.error('❌ MongoDB Gagal Konek:', error);
        process.exit(1); // Matikan server jika DB error
    }
};

// Panggil fungsi koneksi
connectDB();

// --- 3. ROUTES (Jalur Data) ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // <--- INI UNTUK PRODUK FISIK
const categoryRoutes = require('./routes/categoryRoutes');
const settingRoutes = require('./routes/settingRoutes');
const ppobRoutes = require('./routes/ppobRoutes');

// Pasang Jalurnya
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Pastikan ini aktif
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/ppob', ppobRoutes);

// --- 4. STATIC FILES (Gambar/Frontend) ---
app.use(express.static(path.join(__dirname, '../public')));

// --- 5. RUTE FALLBACK (Tangkap Semua) ---
// Agar saat direfresh di halaman detail produk, tidak error 404
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- 6. JALANKAN SERVER ---
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di Port ${PORT}`);
    });
}

module.exports = app;
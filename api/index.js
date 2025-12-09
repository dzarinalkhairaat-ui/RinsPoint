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
app.use(helmet()); // Keamanan tambahan header HTTP
app.use(morgan('dev')); // Logging request untuk debug

// --- UPDATE: PERBESAR BATAS UPLOAD ---
// Limit 150mb agar bisa upload foto resolusi tinggi dari HP
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// --- 2. KONEKSI DATABASE (VERCEL OPTIMIZED) ---
// Kita gunakan teknik caching koneksi agar Vercel tidak membuat koneksi baru terus-menerus
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('=> Menggunakan koneksi database yang sudah ada');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI);
        isConnected = db.connections[0].readyState;
        console.log('✅ MongoDB Connected (Vercel Mode)');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
    }
};

// Panggil koneksi saat inisialisasi
connectDB();

// --- 3. ROUTES ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const settingRoutes = require('./routes/settingRoutes');
const ppobRoutes = require('./routes/ppobRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/ppob', ppobRoutes);

// --- 4. STATIC FILES & ROOT ---
// Menyajikan file statis (Frontend) jika dijalankan lokal
app.use(express.static(path.join(__dirname, '../public')));

// Route Default / Cek Status
app.get('/', (req, res) => {
    res.send('🚀 RinsPoint Backend (Vercel + Proxy Mode) is Ready!');
});

// --- 5. JALANKAN SERVER (LOCAL) ---
// Bagian ini hanya berjalan saat 'npm run dev', di Vercel ini diabaikan
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on port ${PORT}`);
    });
}

// Export app untuk Vercel Serverless
module.exports = app;
// Memuat variabel dari file .env (Wajib paling atas)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // Wajib untuk Vercel
const connectDB = require('../config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const settingRoutes = require('./routes/settingRoutes');
const ppobRoutes = require('./routes/ppobRoutes');

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- UPDATE PENTING UNTUK DEPLOY VERCEL ---
// Menyajikan file statis (Frontend) menggunakan path absolut
// Ini memastikan Vercel bisa menemukan folder 'public' Anda
app.use(express.static(path.join(__dirname, '../public')));

// Hubungkan ke Database
connectDB();

// Gunakan Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/ppob', ppobRoutes);

// Route Fallback (Opsional: Memastikan index.html terpanggil jika route root diakses)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
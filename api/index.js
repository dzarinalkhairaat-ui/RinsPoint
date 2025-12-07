// Memuat variabel dari file .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const settingRoutes = require('./routes/settingRoutes');
const ppobRoutes = require('./routes/ppobRoutes');

// Inisialisasi aplikasi Express
const app = express();

// Middleware (Agar server bisa membaca JSON)
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Hubungkan ke Database
connectDB();
// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/ppob', ppobRoutes);

// Gunakan Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);

// Route Percobaan (Test Route)
app.get('/', (req, res) => {
    res.send('API RinsPoint is running and connected!');
});

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app; // Diperlukan untuk Vercel nanti
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
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// --- 2. KONEKSI DATABASE (HYBRID STABIL) ---
// Kita pakai sistem Caching, tapi settingannya kita buat standar (Default)
// agar aman untuk Localhost maupun Vercel.

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // 1. Cek apakah sudah ada koneksi?
    if (cached.conn) {
        return cached.conn;
    }

    // 2. Jika belum, buat koneksi baru
    if (!cached.promise) {
        const opts = {
            // HAPUS settingan timeout yang agresif
            // Biarkan default supaya Localhost tidak "kaget"
        };

        console.log("🔄 Mencoba koneksi Database...");
        
        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB Connected (Siap!)');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB Gagal Konek:', e);
        throw e;
    }

    return cached.conn;
};

// Middleware: Pastikan DB Konek sebelum masuk Route
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) {
        try {
            await connectDB();
        } catch (error) {
            console.error("Database Error di Middleware:", error);
            return res.status(500).json({ message: 'Database Connection Failed' });
        }
    }
    next();
});

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
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- 5. JALANKAN SERVER (LOCAL) ---
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on port ${PORT}`);
    });
}

module.exports = app;
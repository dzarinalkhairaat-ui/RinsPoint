require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- 1. INISIALISASI SERVER ---
const app = express();

// Konfigurasi CORS (Agar bisa diakses dari mana saja)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. SERVE STATIC FILES (FRONTEND) ---
// Ini perintah agar file HTML di folder 'public' bisa dibuka di browser
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. KONEKSI DATABASE ---
mongoose.connect(process.env.MONGODB_URI) // Opsi lama dihapus biar ga warning kuning
.then(() => console.log('✅  Database Connected (MongoDB Atlas)'))
.catch(err => console.error('❌  MongoDB Connection Error:', err));

// --- 4. ROUTING (API) ---
const authRoutes = require('./api/routes/authRoutes');
const settingRoutes = require('./api/routes/settingRoutes');
const ppobRoutes = require('./api/routes/ppobRoutes'); 

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/ppob', ppobRoutes);

// Route Fallback: Jika buka halaman yang ga ada, arahkan ke index.html atau 404
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- 5. JALANKAN LISTENER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀  Server RinsPoint Berjalan!`);
    console.log(`📡  Buka di Browser: http://localhost:${PORT}`);
});
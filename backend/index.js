require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// --- IMPORT UTILS NOTIFIKASI (BARU) ---
const { sendToDevice } = require('./utils/onesignal');

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors({ origin: '*', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
// Limit diperbesar agar upload gambar produk fisik aman
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// --- 2. KONEKSI DATABASE (STANDAR & STABIL) ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected (Siap Tempur!)');
    } catch (error) {
        console.error('❌ MongoDB Gagal Konek:', error);
        process.exit(1); 
    }
};

connectDB();

// --- 3. ROUTES (Jalur Data) ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');
const settingRoutes = require('./routes/settingRoutes');
const ppobRoutes = require('./routes/ppobRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes'); 

// Pasang Jalurnya
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/ppob', ppobRoutes);
app.use('/api/payments', paymentMethodRoutes);

// --- 4. RUTE TES NOTIFIKASI (BARU & PENTING!) ---
// Buka link ini di browser nanti: https://rinspoint.vercel.app/api/test-notif
app.get('/api/test-notif', async (req, res) => {
    try {
        const adminId = process.env.ONESIGNAL_ADMIN_ID;
        
        // Cek apakah ID Admin ada di .env
        if (!adminId) {
            return res.status(500).json({ 
                status: 'error', 
                message: "❌ Gawat! ONESIGNAL_ADMIN_ID belum diisi di .env Vercel." 
            });
        }

        console.log("🚀 Mencoba mengirim notifikasi tes ke ID:", adminId);
        
        // Coba kirim pesan tes
        const response = await sendToDevice(
            adminId, 
            "Jika pesan ini masuk, berarti server 100% lancar!", 
            "🔔 Tes Notifikasi Sukses"
        );
        
        res.json({
            status: 'success',
            message: "✅ Perintah kirim sudah dijalankan ke OneSignal.",
            debug_info: {
                target_id: adminId,
                onesignal_response: response
            }
        });

    } catch (error) {
        console.error("❌ Error Tes Notif:", error);
        res.status(500).json({ 
            status: 'failed', 
            message: error.message,
            hint: "Cek Log Vercel untuk detail error (Biasanya API Key salah)"
        });
    }
});

// --- 5. STATIC FILES (Gambar/Frontend) ---
app.use(express.static(path.join(__dirname, '../public')));

// --- 6. RUTE FALLBACK (Tangkap Semua) ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// --- 7. JALANKAN SERVER ---
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server berjalan di Port ${PORT}`);
    });
}

module.exports = app;
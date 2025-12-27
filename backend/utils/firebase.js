const admin = require('firebase-admin');
const path = require('path'); 

let serviceAccount;

try {
    // 1. Cek Apakah ada di Vercel/Environment Variable? (Prioritas Utama)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log("🔥 Menggunakan Config dari Environment Variable (Mode Server)");
    } 
    // 2. Jika tidak, Cek File Lokal (Mode Laptop/Localhost)
    else {
        try {
            // Kita coba cari file fisik yang ada di laptopmu
            serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
            console.log("💻 Menggunakan Config dari File Lokal (Mode Dev)");
        } catch (e) {
            console.log("⚠️ Config Firebase tidak ditemukan di Env maupun File Lokal.");
        }
    }

    // 3. Inisialisasi Firebase
    if (serviceAccount && !admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase Admin Terhubung!");
    }

} catch (error) {
    console.error("❌ Gagal Inisialisasi Firebase:", error.message);
}

// Fungsi Kirim Notifikasi
const sendFCM = async (token, title, body) => {
    if (!token) return;

    try {
        const message = {
            token: token,
            notification: { title, body },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'rins_order_channel',
                    priority: 'high',
                    defaultSound: true,
                    visibility: 'public',
                    icon: 'stock_ticker_update'
                }
            }
        };
        await admin.messaging().send(message);
        console.log(`✅ Notif Terkirim ke ${token.substr(0, 10)}...`);
    } catch (error) {
        console.error('❌ Gagal Kirim Notif:', error.message);
    }
};

module.exports = { sendFCM };
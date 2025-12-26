const admin = require('firebase-admin');

// --- CARA BARU: BACA DARI ENVIRONMENT VARIABLE (AMAN) ---
let serviceAccount;
try {
    // Kita cek apakah ada variabel 'FIREBASE_SERVICE_ACCOUNT' di Vercel?
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        throw new Error("Variabel FIREBASE_SERVICE_ACCOUNT tidak ditemukan di .env");
    }
    
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("🔥 Firebase Admin Berhasil Terhubung!");
    }
} catch (error) {
    console.error("❌ Gagal Konek Firebase:", error.message);
}
// -------------------------------------------------------

const sendFCM = async (token, title, body) => {
    if (!token) return;

    try {
        const message = {
            token: token,
            notification: {
                title: title,
                body: body
            },
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

        const response = await admin.messaging().send(message);
        console.log(`✅ Notif Terkirim ke ${token.substr(0, 10)}...`);
        return response;

    } catch (error) {
        console.error('❌ Gagal Kirim Notif:', error.message);
    }
};

module.exports = { sendFCM };
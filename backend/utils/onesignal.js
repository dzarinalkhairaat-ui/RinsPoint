// backend/utils/onesignal.js

const OneSignal = require('onesignal-node');

// Mengambil kunci dari .env
const client = new OneSignal.Client(
    process.env.ONESIGNAL_APP_ID,
    process.env.ONESIGNAL_API_KEY
);

/**
 * Fungsi untuk mengirim notifikasi ke SEMUA Admin/User (Broadcast)
 * Cocok untuk memberi tahu Admin kalau ada orderan baru.
 */
const sendToAll = async (message, heading = "RinsPoint Info") => {
    try {
        const notification = {
            contents: {
                'en': message,
                'id': message
            },
            headings: {
                'en': heading,
                'id': heading
            },
            included_segments: ['Total Subscriptions'], // Kirim ke semua yang subscribe
            // small_icon: "ic_stat_onesignal_default" // Opsional jika punya icon khusus
        };

        const response = await client.createNotification(notification);
        console.log("✅ Notifikasi Terkirim (Broadcast):", response.body.id);
        return response;
    } catch (error) {
        console.error("❌ Gagal kirim notifikasi:", error);
        // Kita tidak throw error agar transaksi tetap jalan meski notif gagal
    }
};

/**
 * Fungsi untuk mengirim notifikasi ke USER TERTENTU (Based on Player ID)
 * Nanti dipakai saat update status transaksi.
 * * Note: Untuk tahap awal, kita pakai Broadcast dulu atau simpan PlayerID user.
 */
const sendToDevice = async (playerId, message, heading = "Status Pesanan") => {
    try {
        const notification = {
            contents: { 'en': message },
            headings: { 'en': heading },
            include_player_ids: [playerId] // Target khusus ke HP user tertentu
        };

        const response = await client.createNotification(notification);
        console.log("✅ Notifikasi Personal Terkirim:", response.body.id);
        return response;
    } catch (error) {
        console.error("❌ Gagal kirim notifikasi personal:", error);
    }
};

module.exports = { sendToAll, sendToDevice };
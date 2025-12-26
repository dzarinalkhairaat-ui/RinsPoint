const axios = require('axios');

// Fungsi Helper untuk Request ke OneSignal API
const sendNotification = async (data) => {
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
    };

    try {
        const response = await axios.post('https://onesignal.com/api/v1/notifications', data, { headers });
        console.log("✅ Notifikasi Sukses:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Gagal Kirim Notif:", error.response ? error.response.data : error.message);
        return null;
    }
};

/**
 * Kirim ke Admin (User Tertentu yang diset sebagai Admin di .env)
 */
const sendToDevice = async (playerId, message, heading = "Info RinsPoint") => {
    // Cek dulu apakah playerId ada isinya
    if (!playerId) {
        console.log("⚠️ Player ID kosong, skip notifikasi.");
        return;
    }

    const data = {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: [playerId], // Target ID User/Admin
        headings: { en: heading },
        contents: { en: message },
        
        // SETTING AGAR MUNCUL SAAT BACKGROUND / LAYAR MATI
        priority: 10, 
        
        // Icon (Gunakan icon dari Vercel kamu)
        // Ganti URL ini dengan domain vercel-mu yang asli
        chrome_web_icon: "https://rinspoint.vercel.app/assets/images/icon-192.png",
        
        // Agar saat diklik langsung buka aplikasi
        url: "https://rinspoint.vercel.app/admin/orders.html" 
    };

    return await sendNotification(data);
};

// (Opsional) Jika butuh broadcast ke semua orang
const sendToAll = async (message, heading = "Info") => {
    const data = {
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ["Total Subscriptions"],
        headings: { en: heading },
        contents: { en: message },
        priority: 10
    };
    return await sendNotification(data);
};

module.exports = { sendToDevice, sendToAll };
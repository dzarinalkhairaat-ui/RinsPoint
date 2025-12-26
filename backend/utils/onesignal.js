const axios = require('axios');

const sendToDevice = async (playerId, message, heading = "Info Pesanan") => {
    try {
        const ONESIGNAL_APP_ID = "73e7eecf-51fd-41c7-9ef9-a802edad4575"; // ID App Kamu
        const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY; 

        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `Basic ${ONESIGNAL_API_KEY}`
        };

        const data = {
            app_id: ONESIGNAL_APP_ID,
            include_player_ids: [playerId],
            headings: { "en": heading },
            contents: { "en": message },
            
            // --- SETTING BACKGROUND (VERSI AMAN) ---
            priority: 10,             // Tetap High Priority (Wajib)
            android_visibility: 1,    // Muncul di Lock Screen
            // Hapus setting channel/sound/color yang bikin error kemarin
        };

        const response = await axios.post("https://onesignal.com/api/v1/notifications", data, { headers });
        console.log("✅ OneSignal Sent:", response.data);
        return response.data;

    } catch (error) {
        // Debugging lebih detail
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("❌ OneSignal Error:", errorMsg);
        throw new Error(`Gagal kirim: ${errorMsg}`);
    }
};

module.exports = { sendToDevice };
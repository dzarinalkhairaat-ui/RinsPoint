const axios = require('axios');

const sendToDevice = async (playerId, message, heading = "Info Pesanan") => {
    try {
        const ONESIGNAL_APP_ID = "73e7eecf-51fd-41c7-9ef9-a802edad4575"; // ID App Kamu
        const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY; // Pastikan ada di .env

        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": `Basic ${ONESIGNAL_API_KEY}`
        };

        const data = {
            app_id: ONESIGNAL_APP_ID,
            include_player_ids: [playerId],
            headings: { "en": heading },
            contents: { "en": message },
            
            // --- SETTING AGAR HP BANGUN (BACKGROUND) ---
            priority: 10,                 // Paksa High Priority (Network)
            android_channel_id: "",       // Biarkan default dulu
            android_group: "rinspoint_order", 
            android_visibility: 1,        // 1 = Public (Muncul di Lock Screen)
            android_background_layout: {
                "headings_color": "000000",
                "contents_color": "000000"
            },
            // Paksa suara & getar
            android_sound: "nil", 
            android_led_color: "FF0000FF",
            android_accent_color: "FF0000FF",
            // ------------------------------------------
        };

        const response = await axios.post("https://onesignal.com/api/v1/notifications", data, { headers });
        console.log("✅ OneSignal Sent:", response.data);
        return response.data;

    } catch (error) {
        console.error("❌ OneSignal Error:", error.response ? error.response.data : error.message);
        throw new Error("Gagal kirim notifikasi");
    }
};

module.exports = { sendToDevice };
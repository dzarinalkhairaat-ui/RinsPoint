const axios = require('axios');
const crypto = require('crypto');
const Transaction = require('../../models/Transaction');
const Setting = require('../../models/Setting');

// --- KONFIGURASI PORTALPULSA ---
const PORTAL_USERID = process.env.PORTAL_USERID;
const PORTAL_KEY = process.env.PORTAL_KEY;
const PORTAL_SECRET = process.env.PORTAL_SECRET;
const BASE_URL = 'https://portalpulsa.com/api/connect/';

// Helper: Header Auth
const getHeaders = () => ({
    'portal-userid': PORTAL_USERID,
    'portal-key': PORTAL_KEY,
    'portal-secret': PORTAL_SECRET,
    'Content-Type': 'application/x-www-form-urlencoded'
});

// @desc    Ambil Daftar Harga (Pricelist)
const getPriceList = async (req, res) => {
    try {
        console.log("🚀 Mengirim Request ke PortalPulsa...");
        console.log("🔑 Kredensial:", {
            uid: PORTAL_USERID ? "ADA" : "KOSONG",
            key: PORTAL_KEY ? "ADA" : "KOSONG",
            secret: PORTAL_SECRET ? "ADA" : "KOSONG"
        });

        const response = await axios.post(BASE_URL, new URLSearchParams({
            inquiry: 'I', 
            code: ''      
        }), { headers: getHeaders() });

        const data = response.data;
        
        // --- LOG HASIL DARI PORTALPULSA ---
        console.log("📦 Respon PortalPulsa:", JSON.stringify(data).substring(0, 200) + "..."); 

        if (data.result === 'failed') {
            console.error("❌ Gagal dari PortalPulsa:", data.message);
            return res.status(500).json({ message: "PortalPulsa Error: " + data.message });
        }

        if (!data.message || !Array.isArray(data.message)) {
            console.error("❌ Format Data Aneh:", data);
            return res.status(500).json({ message: "Format data dari pusat tidak sesuai." });
        }

        // Format ulang data
        const formattedData = data.message.map(item => ({
            buyer_sku_code: item.code,
            product_name: item.description,
            category: item.operator, // Pastikan ini sesuai
            brand: item.operator,
            type: item.type,
            price: item.price + 500, // Margin sementara 500 perak
            buyer_product_status: item.status === 'normal',
            seller_product_status: item.status === 'normal',
            desc: item.description
        }));

        console.log(`✅ Berhasil load ${formattedData.length} produk.`);
        res.json({ data: formattedData });

    } catch (error) {
        // Cek Error Jaringan
        if (error.response) {
            console.error("❌ Axios Error:", error.response.status, error.response.data);
            res.status(500).json({ message: `Server Error: ${error.response.status}` });
        } else {
            console.error("❌ Network Error:", error.message);
            res.status(500).json({ message: error.message });
        }
    }
};

// ... (Sisanya createTransaction, dll biarkan dulu, kita fokus Pricelist) ...
const createTransaction = async (req, res) => { /* Code Lama */ };
const getTransactionDetail = async (req, res) => { /* Code Lama */ };
const handleWebhook = async (req, res) => { /* Code Lama */ };

module.exports = { getPriceList, createTransaction, getTransactionDetail, handleWebhook };
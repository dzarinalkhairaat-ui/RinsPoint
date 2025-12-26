const Product = require('../../models/Product'); 
const Transaction = require('../../models/Transaction'); 
const cloudinary = require('cloudinary').v2;

// --- 1. IMPORT FIREBASE (BARU) ---
const { sendFCM } = require('../utils/firebase'); 
// ---------------------------------

// Konfigurasi Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. GET PRICELIST ---
const getPriceList = async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        const formattedData = products.map(item => ({
            buyer_sku_code: item._id,      
            product_name: item.name,      
            category: item.category ? item.category.name : 'Umum',        
            brand: 'Manual', type: 'Manual', price: item.price,            
            buyer_product_status: true, seller_product_status: true, desc: item.description
        }));
        res.json({ data: formattedData });
    } catch (error) { res.status(500).json({ message: "Gagal mengambil data" }); }
};

// --- 2. BUAT TRANSAKSI (CREATE) ---
const createTransaction = async (req, res) => {
    // Kita ambil userPlayerId (Token Firebase) dari Frontend
    const { productCode, productName, customerPhone, price, userPlayerId } = req.body;
    const proofImage = req.file ? req.file.path : null; 

    try {
        const trxId = 'TRX-' + Date.now();
        
        const transaction = await Transaction.create({
            trxId: trxId,
            customerPhone: customerPhone,
            productCode: productCode,
            amount: price,
            status: 'pending',
            note: 'Menunggu Verifikasi Bukti Pembayaran',
            paymentProof: proofImage, 
            userPlayerId: userPlayerId || null, // SIMPAN TOKEN FIREBASE USER DI SINI
            providerResponse: { productName }
        });

        // --- 2. NOTIFIKASI KE ADMIN (VIA FIREBASE) ---
        // Nanti kita simpan Token HP Admin di .env dengan nama FIREBASE_ADMIN_TOKEN
        const adminToken = process.env.FIREBASE_ADMIN_TOKEN;
        
        if (adminToken) {
            const priceFmt = parseInt(price).toLocaleString('id-ID');
            const statusBukti = proofImage ? "📸 Ada Bukti" : "⏳ Tanpa Bukti";
            const msgBody = `${productName}\nNo: ${customerPhone}\nRp ${priceFmt}\n${statusBukti}`;
            
            // Kirim notifikasi "Fire & Forget" (gak perlu await biar order cepat)
            sendFCM(adminToken, "💰 Order Baru Masuk!", msgBody);
        }
        // ---------------------------------------------

        res.status(201).json(transaction);
    } catch (error) {
        console.error("Trx Error:", error);
        res.status(500).json({ message: 'Gagal membuat pesanan' });
    }
};

// --- 3. DETAIL TRANSAKSI ---
const getTransactionDetail = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ trxId: req.params.trxId });
        if (transaction) res.json(transaction);
        else res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- 4. ADMIN: GET ALL ---
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) { res.status(500).json({ message: 'Gagal ambil data' }); }
};

// --- 5. ADMIN: UPDATE STATUS ---
const updateTransactionStatus = async (req, res) => {
    const { status, note } = req.body; 
    const { trxId } = req.params;

    try {
        const transaction = await Transaction.findOne({ trxId });
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });

        transaction.status = status;
        if(note) transaction.note = note;
        await transaction.save();

        // --- 3. NOTIFIKASI BALASAN KE USER (VIA FIREBASE) ---
        // Cek apakah transaksi ini punya Token User?
        if (transaction.userPlayerId) { 
            let title = "";
            let body = "";

            if (status === 'success') {
                title = "✅ Pesanan Sukses!";
                body = `Hore! ${transaction.providerResponse?.productName || 'Pesananmu'} berhasil diproses.`;
            } else if (status === 'failed') {
                title = "❌ Pesanan Dibatalkan";
                body = `Maaf, pesanan gagal. Alasan: ${note || 'Hubungi Admin'}`;
            }

            // Kirim jika statusnya success/failed
            if (title) {
                sendFCM(transaction.userPlayerId, title, body);
            }
        }
        // ----------------------------------------------------

        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal update status" });
    }
};

// --- 6. ADMIN: HAPUS TRANSAKSI ---
const deleteTransaction = async (req, res) => {
    const { trxId } = req.params;
    try {
        const transaction = await Transaction.findOne({ trxId });
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });

        // Hapus Gambar Cloudinary
        if (transaction.paymentProof) {
            try {
                const urlParts = transaction.paymentProof.split('/');
                const fileName = urlParts.pop().split('.')[0]; 
                const folderName = urlParts.pop(); 
                const publicId = `${folderName}/${fileName}`;
                await cloudinary.uploader.destroy(publicId);
            } catch (err) { console.error("Gagal hapus gambar Cloudinary:", err.message); }
        }

        // Hapus Data MongoDB
        await Transaction.deleteOne({ trxId });
        res.json({ message: "Transaksi berhasil dihapus permanen" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal menghapus transaksi" });
    }
};

const handleWebhook = async (req, res) => { res.status(200).json({ message: "Ignored" }); };

module.exports = { 
    getPriceList, createTransaction, getTransactionDetail, handleWebhook, 
    getAllTransactions, updateTransactionStatus, deleteTransaction 
};
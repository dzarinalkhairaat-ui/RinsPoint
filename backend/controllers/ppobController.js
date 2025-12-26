const Product = require('../../models/Product');
const Transaction = require('../../models/Transaction');
const { sendToDevice } = require('../utils/onesignal');
// 1. IMPORT CLOUDINARY (BARU)
const cloudinary = require('cloudinary').v2;

// 2. KONFIGURASI CLOUDINARY (Agar bisa akses fungsi delete)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. GET PRICELIST ---
const getPriceList = async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        const formattedData = products.map(item => {
            return {
                buyer_sku_code: item._id,     
                product_name: item.name,      
                category: item.category ? item.category.name : 'Umum',       
                brand: 'Manual', type: 'Manual', price: item.price,            
                buyer_product_status: true, seller_product_status: true, desc: item.description
            };
        });
        res.json({ data: formattedData });
    } catch (error) { res.status(500).json({ message: "Gagal mengambil data" }); }
};

// --- 2. BUAT TRANSAKSI ---
const createTransaction = async (req, res) => {
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
            userPlayerId: userPlayerId, 
            providerResponse: { productName }
        });

        // Notif Admin
        const adminId = process.env.ONESIGNAL_ADMIN_ID;
        if (adminId) {
            const notifTitle = "💰 Order Baru Masuk Bos!";
            const priceFormatted = parseInt(price).toLocaleString('id-ID');
            const proofStatus = proofImage ? "📸 Bukti Terlampir" : "❌ Tanpa Bukti";
            const notifMsg = `${productName || 'Produk'}\nNo: ${customerPhone}\nRp ${priceFormatted}\n${proofStatus}`;
            try { await sendToDevice(adminId, notifMsg, notifTitle); } catch(e){}
        }

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

        // Notif User
        if (transaction.userPlayerId) {
            let userMsg = "", userHeading = "";
            if (status === 'success') {
                userHeading = "✅ Pesanan Sukses!";
                userMsg = `Hore! Pesanan ${transaction.providerResponse?.productName} BERHASIL diproses.`;
                if(note) userMsg += `\nInfo: ${note}`;
            } else if (status === 'failed') {
                userHeading = "❌ Pesanan Gagal";
                userMsg = `Maaf, pesananmu dibatalkan. Alasan: ${note || 'Hubungi Admin'}`;
            }
            if (userHeading) try { await sendToDevice(transaction.userPlayerId, userMsg, userHeading); } catch(e){}
        }
        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal update status" });
    }
};

// --- 6. ADMIN: HAPUS TRANSAKSI (FITUR BARU) ---
const deleteTransaction = async (req, res) => {
    const { trxId } = req.params;
    try {
        const transaction = await Transaction.findOne({ trxId });
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });

        // A. Hapus Gambar di Cloudinary jika ada
        if (transaction.paymentProof) {
            try {
                // Logic: Ambil Public ID dari URL
                const parts = transaction.paymentProof.split('/');
                const fileName = parts.pop().split('.')[0]; 
                const folder = parts.pop(); 
                const publicId = `${folder}/${fileName}`;

                await cloudinary.uploader.destroy(publicId);
                console.log("Gambar Cloudinary dihapus:", publicId);
            } catch (err) {
                console.error("Gagal hapus gambar Cloudinary:", err);
            }
        }

        // B. Hapus Data di MongoDB
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
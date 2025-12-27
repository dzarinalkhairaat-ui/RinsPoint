const Product = require('../../models/Product'); 
const Transaction = require('../../models/Transaction'); 
const AdminToken = require('../../models/AdminToken'); 
const cloudinary = require('cloudinary').v2;
const { sendFCM } = require('../utils/firebase'); 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. SIMPAN TOKEN (UPSERT) ---
const saveAdminToken = async (req, res) => {
    const { token, deviceName } = req.body;
    try {
        await AdminToken.findOneAndUpdate(
            { token: token },
            { token: token, deviceName: deviceName || 'Unknown Device', createdAt: new Date() },
            { upsert: true, new: true }
        );
        res.json({ success: true, message: "Token berhasil disimpan/diupdate!" });
    } catch (error) {
        console.error("Gagal simpan token:", error);
        res.status(500).json({ success: false, message: "Gagal menyimpan token" });
    }
};

// --- 2. LIHAT DAFTAR TOKEN (BARU) ---
const getAdminTokens = async (req, res) => {
    try {
        // Urutkan dari yang paling baru diupdate
        const tokens = await AdminToken.find().sort({ createdAt: -1 });
        res.json({ success: true, data: tokens });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil data token" });
    }
};

// --- 3. HAPUS TOKEN (BARU) ---
const deleteAdminToken = async (req, res) => {
    try {
        await AdminToken.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Token berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal menghapus token" });
    }
};

// --- GET PRICELIST ---
const getPriceList = async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        const formattedData = products.map(item => ({
            buyer_sku_code: item._id, product_name: item.name,      
            category: item.category ? item.category.name : 'Umum',        
            brand: 'Manual', type: 'Manual', price: item.price,            
            buyer_product_status: true, seller_product_status: true, desc: item.description
        }));
        res.json({ data: formattedData });
    } catch (error) { res.status(500).json({ message: "Gagal mengambil data" }); }
};

// --- BUAT TRANSAKSI (CREATE) ---
const createTransaction = async (req, res) => {
    const { productCode, productName, customerPhone, price, userPlayerId } = req.body;
    const proofImage = req.file ? req.file.path : null; 

    try {
        const trxId = 'TRX-' + Date.now();
        const transaction = await Transaction.create({
            trxId: trxId, customerPhone: customerPhone, productCode: productCode,
            amount: price, status: 'pending', note: 'Menunggu Verifikasi Bukti Pembayaran',
            paymentProof: proofImage, userPlayerId: userPlayerId || null, 
            providerResponse: { productName }
        });

        // --- NOTIFIKASI ADMIN (HYBRID: DB + ENV) ---
        try {
            const rawEnvTokens = process.env.FIREBASE_ADMIN_TOKEN || "";
            const envTokens = rawEnvTokens.split(',').map(t => t.trim()).filter(t => t);
            const dbTokensDocs = await AdminToken.find().select('token');
            const dbTokens = dbTokensDocs.map(doc => doc.token);
            const allAdminTokens = [...new Set([...envTokens, ...dbTokens])];

            if (allAdminTokens.length > 0) {
                const priceFmt = parseInt(price).toLocaleString('id-ID');
                const statusBukti = proofImage ? "📸 Ada Bukti" : "⏳ Tanpa Bukti";
                const msgBody = `${productName}\nNo: ${customerPhone}\nRp ${priceFmt}\n${statusBukti}`;
                
                allAdminTokens.forEach(token => {
                    sendFCM(token, "💰 Order Baru Masuk!", msgBody);
                });
            }
        } catch (notifError) { console.error("Gagal notif admin:", notifError); }

        res.status(201).json(transaction);
    } catch (error) {
        console.error("Trx Error:", error);
        res.status(500).json({ message: 'Gagal membuat pesanan' });
    }
};

// --- DETAIL TRANSAKSI ---
const getTransactionDetail = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ trxId: req.params.trxId });
        if (transaction) res.json(transaction);
        else res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

// --- ADMIN: GET ALL ---
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) { res.status(500).json({ message: 'Gagal ambil data' }); }
};

// --- ADMIN: UPDATE STATUS ---
const updateTransactionStatus = async (req, res) => {
    const { status, note } = req.body; 
    const { trxId } = req.params;
    try {
        const transaction = await Transaction.findOne({ trxId });
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });

        transaction.status = status;
        if(note) transaction.note = note;
        await transaction.save();

        if (transaction.userPlayerId) { 
            let title = "", body = "";
            if (status === 'success') { title = "✅ Pesanan Sukses!"; body = `Hore! ${transaction.providerResponse?.productName} berhasil.`; }
            else if (status === 'failed') { title = "❌ Pesanan Dibatalkan"; body = `Maaf, pesanan gagal. Alasan: ${note}`; }
            if (title) sendFCM(transaction.userPlayerId, title, body);
        }
        res.json(transaction);
    } catch (error) { res.status(500).json({ message: "Gagal update status" }); }
};

// --- ADMIN: HAPUS TRANSAKSI ---
const deleteTransaction = async (req, res) => {
    const { trxId } = req.params;
    try {
        const transaction = await Transaction.findOne({ trxId });
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
        if (transaction.paymentProof) {
            try {
                const urlParts = transaction.paymentProof.split('/');
                const fileName = urlParts.pop().split('.')[0]; 
                const folderName = urlParts.pop(); 
                await cloudinary.uploader.destroy(`${folderName}/${fileName}`);
            } catch (err) { console.error("Cloudinary err:", err.message); }
        }
        await Transaction.deleteOne({ trxId });
        res.json({ message: "Transaksi berhasil dihapus" });
    } catch (error) { res.status(500).json({ message: "Gagal hapus" }); }
};

const handleWebhook = async (req, res) => { res.status(200).json({ message: "Ignored" }); };

module.exports = { 
    getPriceList, createTransaction, getTransactionDetail, handleWebhook, 
    getAllTransactions, updateTransactionStatus, deleteTransaction, 
    saveAdminToken, getAdminTokens, deleteAdminToken // <-- EXPORT LENGKAP
};
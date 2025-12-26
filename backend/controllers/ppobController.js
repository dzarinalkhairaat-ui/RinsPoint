const Product = require('../../models/Product');
const Transaction = require('../../models/Transaction');
const { sendToDevice } = require('../utils/onesignal');

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

// --- 2. BUAT TRANSAKSI (UPDATE: SIMPAN PLAYER ID) ---
const createTransaction = async (req, res) => {
    // Tangkap userPlayerId dari body (dikirim frontend nanti)
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
            userPlayerId: userPlayerId, // <--- DISIMPAN DISINI
            providerResponse: { productName }
        });

        // NOTIFIKASI KE ADMIN (TETAP JALAN)
        const adminId = process.env.ONESIGNAL_ADMIN_ID;
        if (adminId) {
            const notifTitle = "💰 Order Baru Masuk Bos!";
            const priceFormatted = parseInt(price).toLocaleString('id-ID');
            const proofStatus = proofImage ? "📸 Bukti Terlampir" : "❌ Tanpa Bukti";
            const notifMsg = `${productName || 'Produk'}\nNo: ${customerPhone}\nRp ${priceFormatted}\n${proofStatus}`;
            
            // Kita bungkus try-catch agar kalau notif admin gagal, transaksi tetap sukses
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

// --- 4. ADMIN: GET ALL TRANSACTIONS ---
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) { res.status(500).json({ message: 'Gagal ambil data' }); }
};

// --- 5. ADMIN: UPDATE STATUS (UPDATE: KIRIM NOTIF KE PEMBELI) ---
const updateTransactionStatus = async (req, res) => {
    const { status, note } = req.body; 
    const { trxId } = req.params;

    try {
        const transaction = await Transaction.findOne({ trxId });
        if (!transaction) return res.status(404).json({ message: "Transaksi tidak ditemukan" });

        // Update Data
        transaction.status = status;
        if(note) transaction.note = note;
        await transaction.save();

        // --- LOGIKA NOTIFIKASI KE PEMBELI ---
        if (transaction.userPlayerId) {
            let userMsg = "";
            let userHeading = "";

            if (status === 'success') {
                userHeading = "✅ Pesanan Sukses!";
                userMsg = `Hore! Pesanan ${transaction.providerResponse?.productName} ke ${transaction.customerPhone} BERHASIL diproses.`;
                if(note) userMsg += `\nInfo: ${note}`;
            } else if (status === 'failed') {
                userHeading = "❌ Pesanan Gagal";
                userMsg = `Maaf, pesananmu dibatalkan. Alasan: ${note || 'Hubungi Admin'}`;
            }

            // Kirim Notif jika statusnya success/failed
            if (userHeading) {
                try {
                    await sendToDevice(transaction.userPlayerId, userMsg, userHeading);
                    console.log(`Notif sent to user: ${transaction.userPlayerId}`);
                } catch (err) {
                    console.error("Gagal kirim notif user:", err.message);
                }
            }
        }

        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal update status" });
    }
};

const handleWebhook = async (req, res) => { res.status(200).json({ message: "Ignored" }); };

module.exports = { 
    getPriceList, 
    createTransaction, 
    getTransactionDetail, 
    handleWebhook, 
    getAllTransactions, 
    updateTransactionStatus 
};
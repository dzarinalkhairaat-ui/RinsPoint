const Product = require('../../models/Product');
const Transaction = require('../../models/Transaction');
// IMPORT FITUR NOTIFIKASI (Gunakan sendToDevice untuk kirim personal)
const { sendToDevice } = require('../utils/onesignal');

// @desc    Ambil Daftar Harga (MODE MANUAL - DARI DATABASE SENDIRI)
const getPriceList = async (req, res) => {
    try {
        const products = await Product.find().populate('category');

        const formattedData = products.map(item => {
            const categoryName = item.category ? item.category.name : 'Umum';
            
            return {
                buyer_sku_code: item._id,     
                product_name: item.name,      
                category: categoryName,       
                brand: 'Manual',              
                type: 'Manual',
                price: item.price,            
                buyer_product_status: true,   
                seller_product_status: true,
                desc: item.description
            };
        });

        res.json({ data: formattedData });

    } catch (error) {
        console.error("Manual PPOB Error:", error.message);
        res.status(500).json({ message: "Gagal mengambil data produk lokal" });
    }
};

// @desc    Buat Transaksi (MODE MANUAL + NOTIFIKASI KHUSUS ADMIN)
const createTransaction = async (req, res) => {
    const { productCode, productName, customerPhone, price } = req.body;

    try {
        const trxId = 'TRX-' + Date.now();

        // 1. Simpan ke Database
        const transaction = await Transaction.create({
            trxId: trxId,
            customerPhone: customerPhone,
            productCode: productCode,
            amount: price,
            status: 'pending',
            note: 'Pesanan Manual - Menunggu Konfirmasi Admin',
            providerResponse: { productName }
        });

        // 2. KIRIM NOTIFIKASI HANYA KE ADMIN (PRIVATE)
        const adminId = process.env.ONESIGNAL_ADMIN_ID; // Ambil ID dari .env

        if (adminId) {
            const notifTitle = "💰 Order Baru Masuk Bos!";
            // Format harga ke Rupiah biar rapi
            const priceFormatted = parseInt(price).toLocaleString('id-ID');
            const notifMsg = `${productName || 'Produk'}\nNo: ${customerPhone}\nRp ${priceFormatted}`;
            
            // Kirim KHUSUS ke perangkat Admin saja
            sendToDevice(adminId, notifMsg, notifTitle);
        } else {
            console.log("⚠️ Admin ID belum disetting di .env, notifikasi skip.");
        }

        // 3. Kirim Respon ke User
        res.status(201).json(transaction);

    } catch (error) {
        console.error("Trx Error:", error);
        res.status(500).json({ message: 'Gagal membuat pesanan' });
    }
};

const getTransactionDetail = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ trxId: req.params.trxId });
        if (transaction) {
            res.json({
                trxId: transaction.trxId,
                status: transaction.status,
                amount: transaction.amount,
                sn: transaction.sn || '-',
                customerPhone: transaction.customerPhone,
                digiflazzResponse: { 
                    productName: transaction.providerResponse?.productName 
                }
            });
        } else {
            res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const handleWebhook = async (req, res) => {
    res.status(200).json({ message: "Manual mode, webhook ignored" });
};

module.exports = { getPriceList, createTransaction, getTransactionDetail, handleWebhook };
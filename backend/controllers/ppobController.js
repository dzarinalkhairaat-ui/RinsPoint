const Product = require('../../models/Product');
const Transaction = require('../../models/Transaction');

// @desc    Ambil Daftar Harga (MODE MANUAL - DARI DATABASE SENDIRI)
const getPriceList = async (req, res) => {
    try {
        // 1. Ambil semua produk dari database lokal
        // Kita populate kategori agar bisa mendapatkan namanya (misal: "Pulsa", "Data")
        const products = await Product.find().populate('category');

        // 2. Format datanya agar mirip dengan format yang diharapkan Frontend
        const formattedData = products.map(item => {
            // Cek apakah produk ini punya kategori, kalau tidak kasih label 'Umum'
            const categoryName = item.category ? item.category.name : 'Umum';
            
            return {
                buyer_sku_code: item._id,     // ID Produk sebagai Kode
                product_name: item.name,      // Nama Produk
                category: categoryName,       // Kategori (Penting untuk filter Frontend)
                brand: 'Manual',              // Brand kita set 'Manual' atau bisa ambil dari deskripsi
                type: 'Manual',
                price: item.price,            // Harga jual langsung
                buyer_product_status: true,   // Anggap selalu stok ada
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

// @desc    Buat Transaksi (MODE MANUAL)
const createTransaction = async (req, res) => {
    const { productCode, productName, customerPhone, price } = req.body;

    try {
        const trxId = 'TRX-' + Date.now();

        // Simpan transaksi langsung sebagai PENDING
        // Nanti Anda proses manual di dashboard Admin
        const transaction = await Transaction.create({
            trxId: trxId,
            customerPhone: customerPhone,
            productCode: productCode,
            amount: price,
            status: 'pending',
            note: 'Pesanan Manual - Menunggu Konfirmasi Admin',
            providerResponse: { productName }
        });

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
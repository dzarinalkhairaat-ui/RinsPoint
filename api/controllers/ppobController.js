const crypto = require('crypto'); // Wajib ada untuk MD5 Signature
const { getSignature, digiflazzRequest } = require('../utils/digiflazz');
const Transaction = require('../../models/Transaction');

// @desc    Ambil Daftar Harga (Pricelist)
// @route   POST /api/ppob/pricelist
// @access  Public
const getPriceList = async (req, res) => {
    try {
        const cmd = 'prepaid'; 
        const sign = getSignature(cmd);

        const response = await digiflazzRequest('price-list', {
            cmd: cmd,
            sign: sign
        });

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cek Saldo (Admin Only) - VERSI FIX SIGNATURE & ERROR HANDLING
// @route   GET /api/ppob/balance
// ... (bagian import di atas tetap sama)

// @desc    Cek Saldo (Admin Only) - VERSI AMAN (.ENV)
// @route   GET /api/ppob/balance
const checkBalance = async (req, res) => {
    try {
        // KEMBALIKAN KE PROCESS.ENV (JANGAN HARDCODE LAGI)
        const username = process.env.DIGIFLAZZ_USERNAME;
        const key = process.env.DIGIFLAZZ_KEY; 

        if (!username || !key) {
            console.error("❌ Gagal baca .env: Username/Key kosong");
            return res.json({ balance: 0, error: true, message: 'Kredensial Server Kosong' });
        }

        // Signature Wajib
        const sign = crypto.createHash('md5')
            .update(username + key + "depo")
            .digest('hex');

        const response = await fetch('https://api.digiflazz.com/v1/cek-saldo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cmd: "deposit",
                username: username,
                sign: sign
            })
        });

        const result = await response.json();

        // Cek Hasil
        if (result.data) {
            // Sukses (Walaupun deposit 0, itu data valid)
            res.json({ 
                balance: result.data.deposit,
                message: 'Sukses' 
            });
        } else {
            // Error dari Digiflazz (Misal IP berubah lagi)
            res.json({ 
                balance: 0, 
                error: true, 
                message: result.data ? result.data.message : 'Gagal Koneksi' 
            });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ balance: 0, message: 'Server Error' });
    }
};

// ... (sisanya tetap sama)

// @desc    Buat Transaksi Baru
// @route   POST /api/ppob/transaction
// @access  Public
const createTransaction = async (req, res) => {
    const { productCode, productName, customerPhone, price } = req.body;

    try {
        const trxId = 'TRX-' + Date.now();

        const transaction = await Transaction.create({
            type: 'ppob',
            trxId: trxId,
            customerPhone: customerPhone,
            productCode: productCode,
            amount: price,
            status: 'pending',
            digiflazzResponse: { productName }
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal membuat transaksi di database' });
    }
};

// @desc    Ambil Semua Riwayat (Admin)
// @route   GET /api/ppob/history
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }); 
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data transaksi' });
    }
};

// @desc    Update Status Manual (Admin)
// @route   PUT /api/ppob/transaction/:id
const updateTransactionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findById(req.params.id);

        if (transaction) {
            transaction.status = status;
            const updatedTransaction = await transaction.save();
            res.json(updatedTransaction);
        } else {
            res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Gagal update status' });
    }
};

// @desc    Detail Transaksi (Public - Untuk Halaman Payment)
// @route   GET /api/ppob/transaction/:trxId
const getTransactionDetail = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ trxId: req.params.trxId });
        
        if (transaction) {
            res.json(transaction);
        } else {
            res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Hapus Transaksi (Admin)
// @route   DELETE /api/ppob/transaction/:id
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (transaction) {
            await transaction.deleteOne();
            res.json({ message: 'Transaksi berhasil dihapus' });
        } else {
            res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus transaksi' });
    }
};

// @desc    Webhook / Callback dari Digiflazz
// @route   POST /api/ppob/callback
const handleWebhook = async (req, res) => {
    try {
        const event = req.body.data;

        if (!event || !event.ref_id) {
            return res.status(400).json({ message: 'Invalid Data' });
        }

        console.log(`Webhook diterima: ${event.ref_id}, Status: ${event.status}`);

        const transaction = await Transaction.findOne({ trxId: event.ref_id });

        if (transaction) {
            let newStatus = transaction.status;
            
            if (event.status === 'Sukses') newStatus = 'success';
            else if (event.status === 'Gagal') newStatus = 'failed';

            transaction.status = newStatus;
            
            if (event.sn) transaction.sn = event.sn;
            if (event.message) transaction.note = event.message;

            await transaction.save();
            console.log(`Database updated: ${newStatus}`);
        }

        res.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(200).json({ status: 'error' }); // Tetap 200 biar ga spam
    }
};

module.exports = { 
    getPriceList, 
    checkBalance, 
    createTransaction, 
    getTransactions, 
    updateTransactionStatus, 
    getTransactionDetail,
    deleteTransaction,
    handleWebhook
};
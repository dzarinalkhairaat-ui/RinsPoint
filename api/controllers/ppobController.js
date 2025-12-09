const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const Transaction = require('../../models/Transaction');

// --- KONFIGURASI ---
const PORTAL_USERID = process.env.PORTAL_USERID;
const PORTAL_KEY = process.env.PORTAL_KEY;
const PORTAL_SECRET = process.env.PORTAL_SECRET;
const PROXY_URL = process.env.FIXIE_URL; 
const BASE_URL = 'https://portalpulsa.com/api/connect/';

// Setup Agent Proxy
const proxyAgent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : null;

// Helper: Config Axios (Timeout 60 Detik)
const getAxiosConfig = () => {
    const config = { 
        headers: {
            'portal-userid': PORTAL_USERID,
            'portal-key': PORTAL_KEY,
            'portal-secret': PORTAL_SECRET,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 60000 
    };
    
    if (proxyAgent) {
        config.httpsAgent = proxyAgent;
        config.proxy = false; 
    }
    return config;
};

// @desc    Ambil Daftar Harga (Pricelist)
const getPriceList = async (req, res) => {
    try {
        const params = new URLSearchParams();
        params.append('inquiry', 'HARGA'); 
        params.append('code', '');     

        const response = await axios.post(BASE_URL, params, getAxiosConfig());
        const data = response.data;

        if (data.result === 'failed') {
            return res.status(500).json({ message: "PortalPulsa: " + data.message });
        }

        // Format data
        const formattedData = data.message.map(item => ({
            buyer_sku_code: item.code,
            product_name: item.description,
            
            // --- KOREKSI PENTING DI SINI ---
            // PortalPulsa menyimpan kategori di field 'operator'
            category: item.operator, 
            brand: item.operator,
            type: item.type,
            
            // Fix Harga (Pastikan jadi Number)
            price: Number(item.price) + 500, 
            
            buyer_product_status: item.status === 'normal',
            seller_product_status: item.status === 'normal',
            desc: item.description
        }));

        res.json({ data: formattedData });

    } catch (error) {
        console.error("Error PPOB:", error.message);
        if (error.code === 'ECONNABORTED') {
            res.status(500).json({ message: "Koneksi Timeout (Coba lagi nanti)" });
        } else if (error.response) {
            res.status(500).json({ message: `Server Error: ${error.response.status}` });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Buat Transaksi Baru
const createTransaction = async (req, res) => {
    const { productCode, productName, customerPhone, price } = req.body;

    try {
        const trxId = 'TRX-' + Date.now();

        const transaction = await Transaction.create({
            trxId: trxId,
            customerPhone: customerPhone,
            productCode: productCode,
            amount: price,
            status: 'pending',
            providerResponse: { productName }
        });

        // Request Transaksi
        const params = new URLSearchParams();
        params.append('inquiry', 'I'); 
        params.append('code', productCode);
        params.append('phone', customerPhone);
        params.append('trxid_api', trxId);
        params.append('no', 1);

        const response = await axios.post(BASE_URL, params, getAxiosConfig());
        const result = response.data;

        if (result.result === 'success') {
            transaction.providerResponse = result;
            transaction.note = result.message;
            if (result.sn && result.sn !== '') {
                transaction.status = 'success';
                transaction.sn = result.sn;
            }
            await transaction.save();
        } else {
            transaction.status = 'failed';
            transaction.note = result.message;
            await transaction.save();
        }

        res.status(201).json(transaction);

    } catch (error) {
        console.error("Trx Error:", error.message);
        res.status(500).json({ message: 'Transaksi Gagal' });
    }
};

// @desc    Detail Transaksi
const getTransactionDetail = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ trxId: req.params.trxId });
        if (transaction) {
            res.json({
                trxId: transaction.trxId,
                status: transaction.status,
                amount: transaction.amount,
                sn: transaction.sn,
                customerPhone: transaction.customerPhone,
                digiflazzResponse: { 
                    productName: transaction.providerResponse?.productName || transaction.productCode 
                }
            });
        } else {
            res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Webhook Handler
const handleWebhook = async (req, res) => {
    try {
        const { trxid_api, status, sn, note } = req.body;
        console.log(`Webhook: ${trxid_api} | Status: ${status}`);

        const transaction = await Transaction.findOne({ trxId: trxid_api });

        if (transaction) {
            if (status == 1) transaction.status = 'success';
            else if (status == 2 || status == 3) transaction.status = 'failed';
            
            if (sn) transaction.sn = sn;
            if (note) transaction.note = note;

            await transaction.save();
        }
        res.status(200).json({ result: 'success' });
    } catch (error) {
        res.status(500).json({ result: 'failed' });
    }
};

module.exports = { getPriceList, createTransaction, getTransactionDetail, handleWebhook };
const PaymentMethod = require('../../models/PaymentMethod');

// @desc    Ambil semua metode pembayaran (Public)
// @route   GET /api/payments
const getPaymentMethods = async (req, res) => {
    try {
        const methods = await PaymentMethod.find();
        res.json(methods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tambah Metode Pembayaran Baru (Admin)
// @route   POST /api/payments
const addPaymentMethod = async (req, res) => {
    try {
        const { name, number, holder, type } = req.body;

        // VALIDASI DINAMIS
        if (!type || !name) {
            return res.status(400).json({ message: 'Tipe dan Nama wajib diisi.' });
        }

        // Jika Bank/E-Wallet, wajib ada nomor dan atas nama
        if (type !== 'qris') {
            if (!number || !holder) {
                return res.status(400).json({ message: 'Nomor dan Atas Nama wajib diisi untuk Bank/E-Wallet.' });
            }
        }

        // Jika QRIS, wajib ada gambar
        if (type === 'qris' && !req.file) {
            return res.status(400).json({ message: 'Wajib upload gambar QRIS.' });
        }

        let iconUrl = '';
        if (req.file) {
            iconUrl = req.file.path;
        }

        const newMethod = new PaymentMethod({
            name,
            number: number || '-', // Isi dash jika QRIS
            holder: holder || '-', // Isi dash jika QRIS
            type, 
            icon: iconUrl,
            isActive: true
        });

        const savedMethod = await newMethod.save();
        res.status(201).json(savedMethod);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menambah metode pembayaran.' });
    }
};

// @desc    Hapus Metode Pembayaran (Admin)
// @route   DELETE /api/payments/:id
const deletePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findById(req.params.id);

        if (method) {
            await method.deleteOne();
            res.json({ message: 'Metode pembayaran dihapus' });
        } else {
            res.status(404).json({ message: 'Data tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod
};
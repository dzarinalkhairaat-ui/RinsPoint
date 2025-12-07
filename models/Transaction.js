const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opsional (jika ada user login)
    trxId: { type: String, required: true, unique: true }, // ID Referensi Kita
    productCode: { type: String, required: true },
    customerPhone: { type: String, required: true },
    amount: { type: Number, required: true }, // Harga Jual
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    },
    sn: { type: String }, // <--- UNTUK MENYIMPAN SN / TOKEN PLN
    note: { type: String }, // Pesan error/info dari provider
    digiflazzResponse: { type: Object } // Simpan respon mentah untuk debug
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trxId: { type: String, required: true, unique: true }, // ID Ref Kita
    productCode: { type: String, required: true },
    customerPhone: { type: String, required: true },
    amount: { type: Number, required: true }, // Harga Jual ke User
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    },
    sn: { type: String }, // SN / Token PLN / Kode Voucher
    note: { type: String }, // Pesan dari Provider
    
    // Field baru untuk menyimpan respon mentah dari PortalPulsa
    providerResponse: { type: Object } 
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
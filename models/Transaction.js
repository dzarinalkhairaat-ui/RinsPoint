const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trxId: { type: String, required: true, unique: true }, 
    productCode: { type: String, required: true },
    customerPhone: { type: String, required: true },
    amount: { type: Number, required: true }, 
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    },
    sn: { type: String }, 
    note: { type: String }, 
    
    // --- FITUR BUKTI BAYAR ---
    paymentProof: { type: String }, 
    
    // --- FITUR NOTIFIKASI BALIK (BARU) ---
    userPlayerId: { type: String }, // Menyimpan ID OneSignal Pembeli
    
    providerResponse: { type: Object } 
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
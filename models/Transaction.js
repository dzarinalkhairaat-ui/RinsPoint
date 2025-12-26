const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opsional kalau ada login
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
    
    // BUKTI BAYAR
    paymentProof: { type: String }, 
    
    // PENTING: ID ONESIGNAL USER (Agar bisa dibalas)
    userPlayerId: { type: String, default: null }, 
    
    providerResponse: { type: Object } 
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
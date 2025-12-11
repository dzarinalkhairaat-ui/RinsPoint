const mongoose = require('mongoose');

const paymentMethodSchema = mongoose.Schema({
    name: { type: String, required: true }, // Contoh: BSI, DANA
    number: { type: String, required: true }, // Contoh: 7319705168
    holder: { type: String, required: true }, // Contoh: MOH ABIDARIN
    type: { type: String, enum: ['bank', 'ewallet', 'qris'], required: true },
    icon: { type: String }, // URL Icon/Logo
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
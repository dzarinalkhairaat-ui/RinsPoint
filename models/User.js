const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Isi email yang valid']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false // Password tidak akan muncul saat kita mengambil data user (keamanan)
    },
    // KOLOM PENTING UNTUK MIDDLEWARE BARU
    isAdmin: {
        type: Boolean,
        required: true,
        default: true // Default true karena ini tabel khusus Admin
    },
    role: {
        type: String,
        enum: ['admin', 'superadmin'],
        default: 'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Enkripsi password sebelum disimpan (Hashing)
// INI ADALAH JANTUNG KEAMANAN PASSWORD ANDA
userSchema.pre('save', async function(next) {
    // Cek apakah password diubah? Jika tidak (cuma update email/profil), skip hashing
    if (!this.isModified('password')) {
        next();
    }
    // Buat "bumbu" (salt) acak 10 putaran
    const salt = await bcrypt.genSalt(10);
    // Acak password dengan bumbu tersebut
    this.password = await bcrypt.hash(this.password, salt);
});

// Method untuk mencocokkan password saat login
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
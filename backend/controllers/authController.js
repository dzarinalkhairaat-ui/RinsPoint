const User = require('../../models/User');
const generateToken = require('../utils/generateToken');
// bcrypt diperlukan di sini hanya jika kita melakukan operasi manual, 
// tapi di fungsi updateProfile, hashing ditangani oleh Model (User.js).
const bcrypt = require('bcryptjs'); 

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cari user berdasarkan email
        // Kita perlu memanggil password karena di model User.js kita set select: false
        const user = await User.findOne({ email }).select('+password');

        // 2. Cek apakah user ada DAN password cocok
        // matchPassword adalah fungsi custom di model User.js
        if (user && (await user.matchPassword(password))) {
            
            // SECURITY CHECK: Pastikan user ini Admin jika login di dashboard admin
            // (Opsional, tapi lapisan keamanan tambahan yang bagus)
            if (user.role !== 'admin' && !user.isAdmin) {
                 // return res.status(403).json({ message: 'Bukan akun Admin' });
                 // *Catatan: Aktifkan baris di atas jika ingin memblokir user biasa login via API ini*
            }

            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin, // Kirim status admin
                token: generateToken(user._id), // Berikan token kunci
            });
        } else {
            // Pesan error generik agar hacker tidak tahu mana yang salah (Emailnya atau Passwordnya)
            res.status(401).json({ message: 'Email atau Password salah' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyPin = async (req, res) => {
    const { pin } = req.body;
    
    // SECURITY FIX: Hapus fallback '123456'. 
    // Wajib ambil dari .env demi keamanan 1000%.
    const correctPin = process.env.ADMIN_PIN; 

    if (!correctPin) {
        console.error("BAHAYA: ADMIN_PIN belum disetting di file .env!");
        return res.status(500).json({ success: false, message: 'Server Error: Konfigurasi Keamanan Belum Siap.' });
    }

    if (pin === correctPin) {
        res.json({ success: true, message: 'PIN Benar' });
    } else {
        // Beri delay sedikit untuk mencegah Brute Force (serangan tebak cepat)
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        res.status(401).json({ success: false, message: 'PIN Salah' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Update Email jika ada input baru
            if (req.body.email) {
                user.email = req.body.email;
            }

            // Update Password jika ada input baru 
            // PENTING: Model User.js harus punya 'pre-save hook' untuk hash password ini
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                email: updatedUser.email,
                role: updatedUser.role,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id), // Generate token baru
            });
        } else {
            res.status(404).json({ message: 'User tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Gagal update profil: ' + error.message });
    }
};

module.exports = { loginUser, verifyPin, updateProfile };
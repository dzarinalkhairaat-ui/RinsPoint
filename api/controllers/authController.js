const User = require('../../models/User');
const generateToken = require('../utils/generateToken');
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
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user._id), // Berikan token kunci
            });
        } else {
            res.status(401).json({ message: 'Email atau Password salah' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyPin = async (req, res) => {
    const { pin } = req.body;
    
    // Ambil PIN dari .env
    const correctPin = process.env.ADMIN_PIN || '123456';

    if (pin === correctPin) {
        res.json({ success: true, message: 'PIN Benar' });
    } else {
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

            // Update Password jika ada input baru (otomatis di-hash oleh model)
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                email: updatedUser.email,
                role: updatedUser.role,
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
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const protect = async (req, res, next) => {
    let token;

    // Cek apakah ada token di header (Bearer Token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Ambil tokennya saja (buang kata 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // Terjemahkan token menjadi ID user
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Cari user di database dan simpan di 'req.user' agar bisa dipakai controller lain
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Lanjut ke proses berikutnya
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Tidak ada izin, token gagal' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Tidak ada izin, token tidak ditemukan' });
    }
};

module.exports = { protect };
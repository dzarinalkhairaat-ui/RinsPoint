const jwt = require('jsonwebtoken');
// Pastikan path ini sesuai (Mundur 2 folder ke root -> models)
const User = require('../../models/User'); 

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // 1. Decode Token menggunakan Kunci Rahasia Server
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 2. Cari User di Database
            // Kita select '-password' agar data password tidak ikut terbawa (security)
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                // Jika user tidak ditemukan di DB (mungkin terhapus saat sesi aktif)
                return res.status(401).json({ message: 'User tidak valid/ditemukan.' });
            }

            next(); // Lanjut ke proses berikutnya
        } catch (error) {
            console.error("Token Error:", error);
            // Mencegah error "Headers already sent"
            if (!res.headersSent) {
                res.status(401).json({ message: 'Token tidak valid / Kadaluarsa' });
            }
        }
    } else {
        if (!res.headersSent) {
            res.status(401).json({ message: 'Tidak ada token otentikasi' });
        }
    }
};

const admin = (req, res, next) => {
    // --- KEAMANAN KETAT (STRICT MODE) ---
    // Cek apakah user ada DAN apakah status isAdmin = true
    if (req.user && req.user.isAdmin) {
        next(); // Lolos, silakan masuk Yang Mulia Admin
    } else {
        // Jika user biasa mencoba masuk, tolak mentah-mentah
        console.warn(`[SECURITY ALERT] User ${req.user.name} mencoba akses Admin tanpa izin!`);
        res.status(403).json({ message: 'Akses Ditolak: Anda bukan Admin!' }); 
    }
};

module.exports = { protect, admin };
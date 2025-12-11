const jwt = require('jsonwebtoken');
// Pastikan path ini sesuai (Mundur 2 folder ke root -> models)
const User = require('../../models/User'); 

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Decode Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Cari User di Database
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                // Jika user tidak ditemukan di DB (mungkin terhapus)
                return res.status(401).json({ message: 'User tidak valid/ditemukan.' });
            }

            next();
        } catch (error) {
            console.error("Token Error:", error);
            // Jangan kirim res jika sudah terkirim di blok lain (pencegahan)
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
    // --- MODE BYPASS SEMENTARA ---
    // Selama 'req.user' ada (artinya sudah login & lolos dari 'protect'),
    // kita izinkan masuk, TIDAK PEDULI status isAdmin di database.
    
    if (req.user) {
        console.log(`[BYPASS ADMIN] User: ${req.user.name} diizinkan mengakses menu Admin.`);
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
    
    /* // KODE ASLI (KITA MATIKAN DULU)
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
    */
};

module.exports = { protect, admin };
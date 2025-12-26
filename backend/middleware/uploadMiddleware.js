const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Konfigurasi Akun Cloudinary (Sama seperti sebelumnya)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. FUNGSI PENYIMPANAN DINAMIS
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Default folder
        let folderName = 'rinspoint_uploads'; 
        
        // --- LOGIKA PEMISAH FOLDER ---
        if (file.fieldname === 'images') {
            folderName = 'rinspoint_products'; // Untuk Produk
        } else if (file.fieldname === 'bannerImage') {
            folderName = 'rinspoint_banners'; // Untuk Banner
        } else if (file.fieldname === 'paymentProof') {
            // KHUSUS BUKTI PEMBAYARAN PELANGGAN
            folderName = 'rinspoint_payments'; 
        }

        return {
            folder: folderName,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            // Kita batasi lebar max 1000px agar hemat storage, tapi tetap jelas terbaca
            transformation: [{ width: 1000, crop: "limit" }] 
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
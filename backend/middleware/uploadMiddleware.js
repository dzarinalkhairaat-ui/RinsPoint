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

// 2. FUNGSI PENYIMPANAN DINAMIS (BARU)
// Fungsi ini akan menentukan folder berdasarkan jenis uploadnya
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Cek dari field name atau path untuk menentukan folder
        let folderName = 'rinspoint_uploads'; // Default
        
        if (file.fieldname === 'images') {
            folderName = 'rinspoint_products'; // Untuk Produk
        } else if (file.fieldname === 'bannerImage') {
            folderName = 'rinspoint_banners'; // Untuk Banner
        }

        return {
            folder: folderName,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            // Banner biasanya butuh resolusi lebih lebar, kita setting di sini
            transformation: [{ width: 1000, crop: "limit" }] 
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
require('dotenv').config();
const mongoose = require('mongoose');

// Panggil Model
const User = require('./models/User');
const Category = require('./models/Category');
const Setting = require('./models/Setting');
const Product = require('./models/Product');
const Transaction = require('./models/Transaction');

// Koneksi ke Database
mongoose.connect(process.env.MONGO_URI);

// Data Kategori Awal
const categories = [
    { name: 'Fashion Pria', icon: 'fa-tshirt' },
    { name: 'Fashion Wanita', icon: 'fa-person-dress' },
    { name: 'Elektronik', icon: 'fa-tv' },
    { name: 'Gadget & HP', icon: 'fa-mobile-screen' },
    { name: 'Komputer & Laptop', icon: 'fa-laptop' },
    { name: 'Rumah Tangga', icon: 'fa-couch' },
    { name: 'Ibu & Bayi', icon: 'fa-baby-carriage' },
    { name: 'Kesehatan & Kecantikan', icon: 'fa-heart-pulse' },
    { name: 'Hobi & Koleksi', icon: 'fa-gamepad' },
    { name: 'Otomotif', icon: 'fa-car' },
    { name: 'Makanan & Minuman', icon: 'fa-utensils' }
];

// Fungsi Import Data
const importData = async () => {
    try {
        console.log('⏳ Memulai proses seeding data...');

        // 1. Hapus data lama (RESET)
        await User.deleteMany();
        await Category.deleteMany();
        await Setting.deleteMany();
        await Product.deleteMany();
        await Transaction.deleteMany();
        console.log('✅ Data lama berhasil dihapus (Reset).');

        // 2. Buat Admin Baru
        const adminUser = await User.create({
            email: process.env.ADMIN_INITIAL_EMAIL,
            password: process.env.ADMIN_INITIAL_PASSWORD,
            role: 'superadmin'
        });
        console.log(`✅ Admin dibuat: ${adminUser.email}`);

        // 3. Buat Kategori (DENGAN SLUG MANUAL)
        // Kita tambahkan slug di sini agar tidak error duplicate key
        const categoriesWithSlugs = categories.map(cat => {
            return {
                ...cat,
                slug: cat.name.toLowerCase().split(' ').join('-').replace('&', 'dan') 
            };
        });

        await Category.insertMany(categoriesWithSlugs);
        console.log('✅ 11 Kategori berhasil ditambahkan.');

        // 4. Buat Setting Default
        await Setting.create({
            siteName: 'RinsPoint',
            adminContacts: [
                { name: 'Admin Utama', phone: '6281234567890' }
            ],
            ppobMargin: 500
        });
        console.log('✅ Setting default berhasil dibuat.');

        console.log('🎉 DATA IMPORT SUCCESS! Database siap digunakan.');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

// Fungsi Hapus Data
const destroyData = async () => {
    try {
        await User.deleteMany();
        await Category.deleteMany();
        await Setting.deleteMany();
        await Product.deleteMany();
        await Transaction.deleteMany();

        console.log('🔥 Data Destroyed! Database kosong.');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
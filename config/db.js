const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Mencoba menghubungkan ke MongoDB menggunakan URL dari .env
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        // Matikan server jika database gagal terkoneksi
        process.exit(1);
    }
};

module.exports = connectDB;
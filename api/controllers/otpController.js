const axios = require('axios');
// MUNDUR 2 LANGKAH untuk mencari folder models di root
const Otp = require('../../models/Otp'); 

// 1. KIRIM OTP
exports.sendOtp = async (req, res) => {
    try {
        const { phone, name } = req.body;

        if (!phone) return res.status(400).json({ msg: 'Nomor WA wajib diisi' });

        // Generate Kode 6 Angka
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Format Pesan
        const message = `Halo Kak *${name || 'Pelanggan'}*,\n\nKode OTP RinsPoint: *${otpCode}*\n\nRahasiakan kode ini.\nBerlaku 5 menit.`;

        // Simpan ke Database
        await Otp.findOneAndUpdate(
            { phone: phone },
            { code: otpCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Kirim via Fonnte
        await axios.post('https://api.fonnte.com/send', {
            target: phone,
            message: message,
        }, {
            headers: {
                Authorization: process.env.FONNTE_TOKEN
            }
        });

        res.json({ success: true, msg: 'OTP Terkirim!' });

    } catch (error) {
        console.error("OTP Error:", error.message);
        res.status(500).json({ success: false, msg: 'Gagal kirim WA' });
    }
};

// 2. VERIFIKASI OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { phone, code } = req.body;
        
        const data = await Otp.findOne({ phone: phone });

        if (!data) {
            return res.status(400).json({ success: false, msg: 'OTP Kadaluarsa/Salah' });
        }

        if (data.code === code) {
            await Otp.deleteOne({ _id: data._id }); // Hapus setelah dipakai
            res.json({ success: true, msg: 'Login Sukses' });
        } else {
            res.status(400).json({ success: false, msg: 'Kode OTP Salah' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};
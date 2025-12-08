const Otp = require('../../models/Otp');

exports.sendOtp = async (req, res) => {
    try {
        const { phone, name } = req.body;

        if (!phone) return res.status(400).json({ msg: 'Nomor WA wajib diisi' });

        // --- MODE DEVELOPER ---
        // Tidak kirim WA/SMS beneran, tapi simpan kode '123456' di database.
        const staticCode = '123456'; 

        await Otp.findOneAndUpdate(
            { phone: phone },
            { code: staticCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Beri kode 'success' agar frontend pindah ke halaman input OTP
        res.json({ success: true, msg: 'OTP Terkirim (Mode Dev)' });

    } catch (error) {
        console.error("OTP Error:", error);
        res.status(500).json({ success: false, msg: 'Error Server' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { phone, code } = req.body;
        
        // Cari data di database
        const data = await Otp.findOne({ phone: phone });

        if (!data) return res.status(400).json({ success: false, msg: 'Nomor salah / OTP Expired' });

        // Cek Kode
        if (data.code === code) {
            await Otp.deleteOne({ _id: data._id });
            res.json({ success: true, msg: 'Login Berhasil' });
        } else {
            res.status(400).json({ success: false, msg: 'Kode Salah' });
        }

    } catch (error) {
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
};
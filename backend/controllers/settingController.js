const Setting = require('../../models/Setting');

// @desc    Ambil pengaturan website (Public)
// @route   GET /api/settings
const getSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        
        // Jika belum ada setting, buat default
        if (!setting) {
            setting = await Setting.create({
                siteName: 'RinsPoint',
                adminPhone: '6281234567890', // Default Nomor
                adminContacts: [],
                banners: []
            });
        }
        
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Pengaturan Umum (Admin Only)
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) setting = new Setting();

        // Ambil data dari body
        const { siteName, adminContacts, banners, ppobMargin, adminPhone } = req.body;

        if (siteName) setting.siteName = siteName;
        if (adminContacts) setting.adminContacts = adminContacts;
        if (banners) setting.banners = banners;
        if (ppobMargin) setting.ppobMargin = ppobMargin;
        if (adminPhone) setting.adminPhone = adminPhone;

        const updatedSetting = await setting.save();
        res.json(updatedSetting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal menyimpan pengaturan.' });
    }
};

// @desc    Update Kredensial Digiflazz (Super Admin Only)
// @route   PUT /api/settings/digiflazz
const updateDigiflazz = async (req, res) => {
    try {
        const { username, apiKey, mode } = req.body;
        
        let setting = await Setting.findOne();
        if (!setting) setting = new Setting();

        // Update data Digiflazz
        if (username) setting.digiflazz.username = username;
        if (apiKey) setting.digiflazz.apiKey = apiKey;
        if (mode) setting.digiflazz.mode = mode;
        
        await setting.save();

        res.json({ message: 'Konfigurasi Digiflazz berhasil disimpan.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal update konfigurasi.' });
    }
};

// @desc    Upload Gambar Banner (Admin Only)
// @route   POST /api/settings/banners
const updateBanners = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) setting = new Setting(); // Buat baru jika belum ada

        // Pastikan array banners ada isinya (minimal 3 slot kosong)
        while (setting.banners.length < 3) {
            setting.banners.push({});
        }

        // Cek apakah ada file yang diupload?
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                // Cloudinary Middleware sudah mengupload file dan menaruh URL di file.path
                
                if (file.fieldname === 'banner1_image') {
                    setting.banners[0].imageUrl = file.path; 
                } else if (file.fieldname === 'banner2_image') {
                    setting.banners[1].imageUrl = file.path;
                } else if (file.fieldname === 'banner3_image') {
                    setting.banners[2].imageUrl = file.path;
                }
            });
            
            await setting.save();
            res.json(setting); // Kirim balik data setting terbaru
        } else {
            res.status(400).json({ message: 'Tidak ada gambar yang dipilih.' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal update banner: ' + error.message });
    }
};

module.exports = { 
    getSettings, 
    updateSettings, 
    updateDigiflazz,
    updateBanners
};
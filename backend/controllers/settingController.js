const Setting = require('../../models/Setting');

// @desc    Ambil pengaturan (BERSIH DARI BANNER)
const getSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            // HANYA INISIALISASI DATA DASAR
            setting = await Setting.create({
                siteName: 'RinsPoint',
                adminPhone: '',
                adminContacts: []
            });
        }
        res.json(setting);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Update Pengaturan Umum (Teks Saja)
const updateSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) setting = new Setting();

        const { siteName, adminContacts, ppobMargin, adminPhone, ppobStatus } = req.body;

        if (siteName) setting.siteName = siteName;
        if (adminContacts) setting.adminContacts = adminContacts;
        if (ppobMargin) setting.ppobMargin = ppobMargin;
        if (adminPhone !== undefined) setting.adminPhone = adminPhone;

        if (ppobStatus !== undefined) {
            if (ppobStatus === 'true') setting.ppobStatus = true;
            else if (ppobStatus === 'false') setting.ppobStatus = false;
            else setting.ppobStatus = !!ppobStatus;
        }

        const updatedSetting = await setting.save();
        res.json(updatedSetting);
    } catch (error) { res.status(500).json({ message: 'Gagal menyimpan.' }); }
};

// @desc    Update Digiflazz
const updateDigiflazz = async (req, res) => {
    try {
        const { username, apiKey, mode } = req.body;
        let setting = await Setting.findOne();
        if (!setting) setting = new Setting();
        if (username) setting.digiflazz.username = username;
        if (apiKey) setting.digiflazz.apiKey = apiKey;
        if (mode) setting.digiflazz.mode = mode;
        await setting.save();
        res.json({ message: 'Konfigurasi Digiflazz berhasil.' });
    } catch (error) { res.status(500).json({ message: 'Gagal update.' }); }
};

// FITUR UPLOAD & HAPUS BANNER SUDAH DIHAPUS TOTAL

module.exports = { getSettings, updateSettings, updateDigiflazz };
const Setting = require('../../models/Setting');

// @desc    Ambil SEMUA pengaturan (Untuk debugging / dashboard utama)
const getSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            setting = await Setting.create({ siteName: 'RinsPoint' });
        }
        res.json(setting);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

// @desc    Ambil Khusus Konfigurasi PPOB (Dipakai di ppob-settings.html)
const getPPOBConfig = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            setting = await Setting.create({ siteName: 'RinsPoint' });
        }

        // Mapping data Database -> Frontend
        const config = {
            isOpen: setting.ppobStatus,      // Database: ppobStatus -> Frontend: isOpen
            margin: setting.ppobMargin,      // Database: ppobMargin -> Frontend: margin
            openTime: setting.ppobOpenTime,  // Database: ppobOpenTime -> Frontend: openTime
            closeTime: setting.ppobCloseTime // Database: ppobCloseTime -> Frontend: closeTime
        };

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Khusus Konfigurasi PPOB
const updatePPOBConfig = async (req, res) => {
    try {
        const { margin, isOpen, openTime, closeTime } = req.body;
        
        let setting = await Setting.findOne();
        if (!setting) setting = new Setting();

        // Mapping Frontend -> Database
        if (margin !== undefined) setting.ppobMargin = Number(margin);
        if (isOpen !== undefined) setting.ppobStatus = isOpen;
        if (openTime) setting.ppobOpenTime = openTime;
        if (closeTime) setting.ppobCloseTime = closeTime;

        await setting.save();
        
        // Kembalikan data yang sudah tersimpan
        res.json({
            isOpen: setting.ppobStatus,
            margin: setting.ppobMargin,
            openTime: setting.ppobOpenTime,
            closeTime: setting.ppobCloseTime,
            message: "Pengaturan PPOB berhasil disimpan"
        });

    } catch (error) {
        console.error("Error Update PPOB:", error);
        res.status(500).json({ message: 'Gagal menyimpan pengaturan PPOB.' });
    }
};

// @desc    Update Pengaturan Umum (Site Name, Kontak, dll - Cadangan)
const updateSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) setting = new Setting();

        const { siteName, adminContacts, adminPhone } = req.body;

        if (siteName) setting.siteName = siteName;
        if (adminContacts) setting.adminContacts = adminContacts;
        if (adminPhone !== undefined) setting.adminPhone = adminPhone;

        const updatedSetting = await setting.save();
        res.json(updatedSetting);
    } catch (error) { 
        res.status(500).json({ message: 'Gagal menyimpan.' }); 
    }
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
    } catch (error) { 
        res.status(500).json({ message: 'Gagal update.' }); 
    }
};

module.exports = { 
    getSettings, 
    updateSettings, 
    updateDigiflazz,
    getPPOBConfig,    // Baru
    updatePPOBConfig  // Baru
};
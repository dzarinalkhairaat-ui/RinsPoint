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
                adminPhone: '6281234567890',
                adminContacts: [],
                banners: []
            });
        }
        
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Pengaturan Umum & PPOB (Admin Only)
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) setting = new Setting();

        // 1. Ambil Data Text dari Body
        const { 
            siteName, adminContacts, banners, 
            ppobMargin, adminPhone,
            ppobStatus, ppobOpenTime, ppobCloseTime 
        } = req.body;

        // Update Field Standar
        if (siteName) setting.siteName = siteName;
        if (adminContacts) setting.adminContacts = adminContacts;
        if (banners) setting.banners = banners;
        if (ppobMargin) setting.ppobMargin = ppobMargin;
        if (adminPhone) setting.adminPhone = adminPhone;

        // --- PERBAIKAN LOGIKA STATUS PPOB ---
        // FormData mengirim boolean sebagai string "true"/"false"
        // Kita harus parse manual agar akurat
        if (ppobStatus !== undefined) {
            if (ppobStatus === 'true') {
                setting.ppobStatus = true;
            } else if (ppobStatus === 'false') {
                setting.ppobStatus = false;
            } else {
                setting.ppobStatus = !!ppobStatus; // Fallback
            }
        }

        if (ppobOpenTime) setting.ppobOpenTime = ppobOpenTime;
        if (ppobCloseTime) setting.ppobCloseTime = ppobCloseTime;

        // 2. Handle File Upload (Logo Provider)
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                // Cek apakah fieldname dimulai dengan 'logo_'
                if (file.fieldname.startsWith('logo_')) {
                    const providerName = file.fieldname.replace('logo_', ''); // telkomsel, indosat, dll
                    
                    // Pastikan object providerLogos ada
                    if (!setting.providerLogos) setting.providerLogos = {};
                    
                    // Simpan URL file
                    setting.providerLogos[providerName] = file.path;
                }
            });
        }

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
        if (!setting) setting = new Setting(); 

        while (setting.banners.length < 3) {
            setting.banners.push({});
        }

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.fieldname === 'banner1_image') {
                    setting.banners[0].imageUrl = file.path; 
                } else if (file.fieldname === 'banner2_image') {
                    setting.banners[1].imageUrl = file.path;
                } else if (file.fieldname === 'banner3_image') {
                    setting.banners[2].imageUrl = file.path;
                }
            });
            
            await setting.save();
            res.json(setting); 
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
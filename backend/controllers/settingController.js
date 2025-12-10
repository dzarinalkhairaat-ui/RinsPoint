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

        // Ambil data dari body, termasuk adminPhone baru
        const { siteName, adminContacts, banners, ppobMargin, adminPhone } = req.body;

        if (siteName) setting.siteName = siteName;
        if (adminContacts) setting.adminContacts = adminContacts;
        if (banners) setting.banners = banners;
        if (ppobMargin) setting.ppobMargin = ppobMargin;
        
        // --- UPDATE NOMOR WA ---
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

const updateBanners = async (req, res) => {
    try {
        // 1. Ambil data teks dari body
        const { 
            banner1_title, banner1_subtitle, banner1_link, banner1_bg,
            banner2_title, banner2_subtitle, banner2_link, banner2_bg,
            banner3_title, banner3_subtitle, banner3_link, banner3_bg
        } = req.body;

        let setting = await Setting.findOne();
        if (!setting) return res.status(404).json({ message: 'Setting not found' });

        // Pastikan array banners ada isinya (minimal 3 slot kosong jika belum ada)
        while (setting.banners.length < 3) {
            setting.banners.push({});
        }

        // 2. Helper function untuk update data banner
        const updateBannerData = (index, title, sub, link, bg) => {
            if (title) setting.banners[index].title = title;
            if (sub) setting.banners[index].subtitle = sub;
            if (link) setting.banners[index].link = link;
            if (bg) setting.banners[index].background = bg;
        };

        // 3. Update Data Teks Banner 1, 2, 3
        updateBannerData(0, banner1_title, banner1_subtitle, banner1_link, banner1_bg);
        updateBannerData(1, banner2_title, banner2_subtitle, banner2_link, banner2_bg);
        updateBannerData(2, banner3_title, banner3_subtitle, banner3_link, banner3_bg);

        // 4. UPDATE GAMBAR (JIKA ADA UPLOAD BARU)
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
        }

        await setting.save();
        res.json(setting);

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
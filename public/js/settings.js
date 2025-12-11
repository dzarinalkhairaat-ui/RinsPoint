const API_URL = '/api';
const token = localStorage.getItem('adminToken');
let currentSettings = {};

// Cek Login
if (!token) {
    window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', loadSettings);

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const tabEl = document.getElementById(tabId);
    if(tabEl) tabEl.classList.add('active');
    
    const btn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick').includes(tabId));
    if (btn) btn.classList.add('active');
}

async function loadSettings() {
    try {
        const res = await fetch(`${API_URL}/settings`);
        currentSettings = await res.json();

        // 1. Isi Form Umum (Site Name & Margin Biasa)
        if(document.getElementById('siteName')) document.getElementById('siteName').value = currentSettings.siteName || '';
        if(document.getElementById('ppobMargin')) document.getElementById('ppobMargin').value = currentSettings.ppobMargin || 500;

        // 2. Isi Form PPOB Setting (FITUR BARU)
        if(document.getElementById('ppobStatus')) {
            // Jam Operasional
            document.getElementById('ppobStatus').checked = currentSettings.ppobStatus !== false; // Default true
            document.getElementById('openTime').value = currentSettings.ppobOpenTime || "06:00";
            document.getElementById('closeTime').value = currentSettings.ppobCloseTime || "23:30";
            
            // Preview Logo Provider (Jika ada)
            const logos = currentSettings.providerLogos || {};
            if(logos.telkomsel && document.getElementById('prev_telkomsel')) document.getElementById('prev_telkomsel').src = logos.telkomsel;
            if(logos.indosat && document.getElementById('prev_indosat')) document.getElementById('prev_indosat').src = logos.indosat;
            if(logos.xl && document.getElementById('prev_xl')) document.getElementById('prev_xl').src = logos.xl;
            if(logos.axis && document.getElementById('prev_axis')) document.getElementById('prev_axis').src = logos.axis;
            if(logos.tri && document.getElementById('prev_tri')) document.getElementById('prev_tri').src = logos.tri;
            if(logos.smartfren && document.getElementById('prev_smartfren')) document.getElementById('prev_smartfren').src = logos.smartfren;
        }

        // 3. Render Kontak & Banner
        renderContacts();
        loadBannerPreviews();

    } catch (error) {
        console.error(error);
    }
}

// =========================================
// 1. LOGIKA BANNER (TETAP SAMA)
// =========================================
function previewBanner(input, previewId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewBox = document.getElementById(previewId);
            const img = previewBox.querySelector('img');
            const placeholder = previewBox.querySelector('.placeholder');
            img.src = e.target.result;
            img.style.display = 'block';
            if(placeholder) placeholder.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}

function loadBannerPreviews() {
    const banners = currentSettings.banners || [];
    if (banners[0] && banners[0].imageUrl) setPreview('preview1', banners[0].imageUrl);
    if (banners[1] && banners[1].imageUrl) setPreview('preview2', banners[1].imageUrl);
    if (banners[2] && banners[2].imageUrl) setPreview('preview3', banners[2].imageUrl);
}

function setPreview(elementId, url) {
    const box = document.getElementById(elementId);
    if (box) {
        const img = box.querySelector('img');
        const placeholder = box.querySelector('.placeholder');
        if(img) {
            img.src = url;
            img.style.display = 'block';
        }
        if(placeholder) placeholder.style.display = 'none';
    }
}

const bannerForm = document.getElementById('bannerForm');
if (bannerForm) {
    bannerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSave = document.getElementById('btnSaveBanner');
        const originalText = btnSave.innerText;
        btnSave.innerText = 'Mengupload...';
        btnSave.disabled = true;

        try {
            const formData = new FormData(bannerForm);
            const res = await fetch(`${API_URL}/settings/banners`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const result = await res.json();
            if (res.ok) {
                alert('Banner Berhasil Disimpan!');
                loadSettings();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert('Gagal Upload: ' + error.message);
        } finally {
            btnSave.innerText = originalText;
            btnSave.disabled = false;
        }
    });
}

// =========================================
// 2. LOGIKA PPOB SETTING (BARU DITAMBAHKAN)
// =========================================

// Preview Logo Provider saat Upload
window.previewLogo = function(input, imgId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById(imgId);
            if(img) img.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Handle Submit Form PPOB Setting (Jika ada di halaman ppob-settings.html)
const ppobForm = document.getElementById('ppobSettingsForm');
if (ppobForm) {
    ppobForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSave');
        const originalText = btn.innerText;
        btn.innerText = 'Menyimpan...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            
            // Masukkan Data Text
            formData.append('ppobStatus', document.getElementById('ppobStatus').checked);
            formData.append('ppobOpenTime', document.getElementById('openTime').value);
            formData.append('ppobCloseTime', document.getElementById('closeTime').value);
            formData.append('ppobMargin', document.getElementById('ppobMargin').value);

            // Masukkan File Logo (Jika ada yg diupload)
            // Cari semua input file di dalam form ini
            const fileInputs = ppobForm.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                if(input.files[0]) {
                    formData.append(input.name, input.files[0]);
                }
            });

            // Kirim ke Backend (Endpoint setting umum)
            const res = await fetch(`${API_URL}/settings`, { 
                method: 'PUT', // Menggunakan PUT karena update data setting
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData // FormData otomatis handle file & text
            });

            if (res.ok) {
                alert('Pengaturan PPOB Berhasil Disimpan!');
                loadSettings(); // Reload agar data sinkron
            } else {
                throw new Error('Gagal menyimpan');
            }

        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat menyimpan.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// =========================================
// 3. LOGIKA UMUM & KONTAK (TETAP SAMA)
// =========================================
function renderContacts() {
    const list = document.getElementById('contactsList');
    if (!list) return;
    list.innerHTML = '';
    if (!currentSettings.adminContacts || currentSettings.adminContacts.length === 0) {
        list.innerHTML = '<p style="color:#94a3b8;">Belum ada kontak admin.</p>';
        return;
    }
    currentSettings.adminContacts.forEach((contact, index) => {
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.innerHTML = `<div><strong>${contact.name}</strong><br><span style="font-size:0.8rem; color:#94a3b8;">${contact.phone}</span></div><i class="fa-solid fa-trash btn-del" onclick="deleteContact(${index})"></i>`;
        list.appendChild(div);
    });
}

async function saveGeneral() {
    const siteName = document.getElementById('siteName').value;
    const ppobMargin = document.getElementById('ppobMargin').value;
    await updateAPI({ siteName, ppobMargin });
    alert('Pengaturan umum disimpan!');
}

async function addContact() {
    const name = document.getElementById('adminName').value;
    const phone = document.getElementById('adminPhone').value;
    if (!name || !phone) return alert('Isi nama dan nomor!');
    if (!currentSettings.adminContacts) currentSettings.adminContacts = [];
    currentSettings.adminContacts.push({ name, phone, isActive: true });
    await updateAPI({ adminContacts: currentSettings.adminContacts });
    document.getElementById('adminName').value = '';
    document.getElementById('adminPhone').value = '';
    renderContacts();
    alert('Kontak berhasil ditambah!');
}

async function deleteContact(index) {
    if(!confirm('Hapus kontak ini?')) return;
    currentSettings.adminContacts.splice(index, 1);
    await updateAPI({ adminContacts: currentSettings.adminContacts });
    renderContacts();
}

async function updateAPI(data) {
    try {
        const res = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if(!res.ok) throw new Error('Gagal update');
    } catch (error) { 
        alert('Terjadi kesalahan saat menyimpan.'); 
        console.error(error);
    }
}

async function updateAdminAccount() {
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!email && !password) return alert('Isi Email atau Password baru!');
    if (password && password !== confirm) return alert('Password konfirmasi tidak cocok!');
    if(!confirm('Yakin ingin mengubah data login? Anda harus login ulang setelah ini.')) return;

    try {
        const res = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Akun berhasil diupdate! Silakan login ulang.');
            localStorage.removeItem('adminToken');
            window.location.href = '/login.html';
        } else {
            alert('Gagal: ' + data.message);
        }
    } catch (error) {
        alert('Error server.');
    }
}
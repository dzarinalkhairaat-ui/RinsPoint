const API_URL = '/api';
const token = localStorage.getItem('adminToken');
let currentSettings = {};

document.addEventListener('DOMContentLoaded', loadSettings);

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

async function loadSettings() {
    try {
        const res = await fetch(`${API_URL}/settings`);
        currentSettings = await res.json();

        // 1. Isi Form Umum
        document.getElementById('siteName').value = currentSettings.siteName || '';
        document.getElementById('ppobMargin').value = currentSettings.ppobMargin || 500;

        // 2. Render Kontak
        renderContacts();

        // 3. Render Form Banner
        renderBannerForms();

    } catch (error) {
        console.error(error);
    }
}

// --- LOGIC BANNER BARU ---
function renderBannerForms() {
    const container = document.getElementById('bannerFormContainer');
    container.innerHTML = '';

    // Pastikan ada 3 slot banner (kosong atau isi)
    const banners = currentSettings.banners || [];
    // Default data jika kosong
    const defaults = [
        { title: 'Promo Spesial', sub: 'Diskon Hari Ini', grad: 'linear-gradient(135deg, #4ADE80 0%, #166534 100%)', svg: '' },
        { title: 'Produk Baru', sub: 'Cek Sekarang', grad: 'linear-gradient(135deg, #0D9488 0%, #115E59 100%)', svg: '' },
        { title: 'Gratis Ongkir', sub: 'Min. Belanja 50rb', grad: 'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)', svg: '' }
    ];

    for (let i = 0; i < 3; i++) {
        const data = banners[i] || defaults[i];
        
        const html = `
            <div style="background:#0F172A; padding:1rem; border-radius:12px; margin-bottom:1rem; border:1px solid #334155;">
                <h4 style="color:#4ADE80; margin-bottom:10px;">Banner ${i+1}</h4>
                
                <div class="form-group">
                    <label>Judul Utama</label>
                    <input type="text" id="bTitle${i}" value="${data.title || ''}" placeholder="Judul besar">
                </div>
                <div class="form-group">
                    <label>Sub Judul</label>
                    <input type="text" id="bSub${i}" value="${data.subtitle || ''}" placeholder="Teks kecil di bawah">
                </div>
                <div class="form-group">
                    <label>Warna Background (CSS Gradient)</label>
                    <input type="text" id="bGrad${i}" value="${data.gradient || ''}" placeholder="linear-gradient(...)">
                </div>
                <div class="form-group">
                    <label>Kode SVG Ikon (Copy Paste kode &lt;svg&gt;...&lt;/svg&gt;)</label>
                    <textarea id="bSvg${i}" rows="3" style="width:100%; background:#1E293B; color:#fff; border:1px solid #334155; border-radius:8px; padding:10px;">${data.svgIcon || ''}</textarea>
                </div>
            </div>
        `;
        container.innerHTML += html;
    }
}

async function saveBanners() {
    const newBanners = [];
    for (let i = 0; i < 3; i++) {
        newBanners.push({
            title: document.getElementById(`bTitle${i}`).value,
            subtitle: document.getElementById(`bSub${i}`).value,
            gradient: document.getElementById(`bGrad${i}`).value,
            svgIcon: document.getElementById(`bSvg${i}`).value
        });
    }

    await updateAPI({ banners: newBanners });
    alert('Banner berhasil diperbarui!');
    loadSettings();
}

// --- LOGIC UMUM LAINNYA (SAMA SEPERTI SEBELUMNYA) ---
function renderContacts() {
    const list = document.getElementById('contactsList');
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
    } catch (error) { alert('Terjadi kesalahan saat menyimpan.'); }
}

async function updateAdminAccount() {
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    // Validasi
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
            // Logout otomatis
            localStorage.removeItem('adminToken');
            window.location.href = '/login.html';
        } else {
            alert('Gagal: ' + data.message);
        }
    } catch (error) {
        alert('Error server.');
    }
}
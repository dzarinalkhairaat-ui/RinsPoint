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
    document.getElementById(tabId).classList.add('active');
    
    // Cari tombol yang diklik dan aktifkan class-nya
    const btn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick').includes(tabId));
    if (btn) btn.classList.add('active');
}

async function loadSettings() {
    try {
        const res = await fetch(`${API_URL}/settings`);
        currentSettings = await res.json();

        // 1. Isi Form Umum
        if(document.getElementById('siteName')) document.getElementById('siteName').value = currentSettings.siteName || '';
        if(document.getElementById('ppobMargin')) document.getElementById('ppobMargin').value = currentSettings.ppobMargin || 500;

        // 2. Render Kontak
        renderContacts();

        // 3. Load Preview Banner (Jika sudah ada gambar sebelumnya)
        loadBannerPreviews();

    } catch (error) {
        console.error(error);
    }
}

// =========================================
// 1. LOGIKA BANNER GAMBAR (BARU)
// =========================================

// Fungsi untuk menampilkan preview gambar saat user memilih file
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

// Load gambar yang sudah tersimpan di database saat halaman dibuka
function loadBannerPreviews() {
    const banners = currentSettings.banners || [];
    
    // Banner 1
    if (banners[0] && banners[0].imageUrl) {
        setPreview('preview1', banners[0].imageUrl);
    }
    // Banner 2
    if (banners[1] && banners[1].imageUrl) {
        setPreview('preview2', banners[1].imageUrl);
    }
    // Banner 3
    if (banners[2] && banners[2].imageUrl) {
        setPreview('preview3', banners[2].imageUrl);
    }
}

function setPreview(elementId, url) {
    const box = document.getElementById(elementId);
    if (box) {
        const img = box.querySelector('img');
        const placeholder = box.querySelector('.placeholder');
        img.src = url;
        img.style.display = 'block';
        if(placeholder) placeholder.style.display = 'none';
    }
}

// Handle Submit Form Banner
const bannerForm = document.getElementById('bannerForm');
if (bannerForm) {
    bannerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSave = document.getElementById('btnSaveBanner');
        const originalText = btnSave.innerText;
        btnSave.innerText = 'Mengupload... (Mohon Tunggu)';
        btnSave.disabled = true;

        try {
            const formData = new FormData(bannerForm);
            
            // Kirim ke endpoint khusus upload banner
            // Kita gunakan endpoint PUT /api/settings/banners (Perlu dibuat di backend jika belum ada, tapi coba pakai endpoint umum dulu)
            
            // KARENA KITA BUTUH UPLOAD FILE, KITA TIDAK BISA PAKAI JSON BIASA
            // Kita harus kirim FormData.
            
            const res = await fetch(`${API_URL}/settings/banners`, { // Pastikan rute ini ada
                method: 'POST', // Biasanya upload pakai POST
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Jangan set Content-Type, biarkan browser set otomatis untuk FormData
                },
                body: formData
            });

            const result = await res.json();

            if (res.ok) {
                alert('Banner Berhasil Diupload & Disimpan!');
                loadSettings(); // Reload agar data sinkron
            } else {
                throw new Error(result.message || 'Gagal upload');
            }

        } catch (error) {
            console.error(error);
            alert('Gagal Upload: ' + error.message);
        } finally {
            btnSave.innerText = originalText;
            btnSave.disabled = false;
        }
    });
}


// =========================================
// 2. LOGIKA UMUM & KONTAK (TIDAK BERUBAH)
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
    
    // Update API pakai JSON biasa
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
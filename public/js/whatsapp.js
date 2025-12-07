document.addEventListener('DOMContentLoaded', () => {
    createWhatsAppElements();
    fetchAdminContacts();
});

// 1. Buat Elemen HTML secara otomatis (Inject ke DOM)
function createWhatsAppElements() {
    const body = document.body;

    // A. Tombol Floating
    const fab = document.createElement('div');
    fab.className = 'floating-wa-btn';
    fab.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    fab.onclick = openWaModal;
    body.appendChild(fab);

    // B. Modal Overlay
    const modal = document.createElement('div');
    modal.className = 'wa-modal-overlay';
    modal.id = 'waModal';
    modal.innerHTML = `
        <div class="wa-modal-content">
            <i class="fa-solid fa-xmark btn-close-modal" onclick="closeWaModal()"></i>
            <h3>Hubungi Admin</h3>
            <p>Pilih admin untuk bantuan pesanan:</p>
            <div class="admin-list" id="adminListContainer">
                <p>Memuat kontak...</p>
            </div>
        </div>
    `;
    
    // Tutup modal jika klik area gelap
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeWaModal();
    });

    body.appendChild(modal);
}

// 2. Ambil Data Kontak dari Backend API
async function fetchAdminContacts() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        
        const container = document.getElementById('adminListContainer');
        
        if (data && data.adminContacts && data.adminContacts.length > 0) {
            container.innerHTML = ''; // Bersihkan loading

            // Filter hanya kontak yang aktif (isActive: true)
            const activeContacts = data.adminContacts.filter(c => c.isActive);

            activeContacts.forEach(contact => {
                const link = document.createElement('a');
                link.href = `https://wa.me/${contact.phone}?text=Halo%20Admin%20${contact.name},%20saya%20mau%20tanya%20tentang%20produk...`;
                link.className = 'admin-btn';
                link.target = '_blank';
                link.innerHTML = `
                    <i class="fa-brands fa-whatsapp"></i>  Chat ${contact.name}
                `;
                container.appendChild(link);
            });
        } else {
            container.innerHTML = '<p style="color:red">Belum ada kontak admin.</p>';
        }

    } catch (error) {
        console.error('Gagal ambil kontak WA:', error);
    }
}

// 3. Fungsi Buka/Tutup Modal
function openWaModal() {
    document.getElementById('waModal').classList.add('show');
}

function closeWaModal() {
    document.getElementById('waModal').classList.remove('show');
}
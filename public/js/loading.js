document.addEventListener("DOMContentLoaded", () => {
    // 1. Suntikkan HTML Loading (Jika belum ada)
    if (!document.getElementById("globalLoader")) {
        const loader = document.createElement("div");
        loader.id = "globalLoader";
        loader.className = "loading-overlay";
        loader.innerHTML = `<div class="spinner"></div><p>Memuat...</p>`;
        document.body.appendChild(loader);
    }

    // 2. Matikan loading saat halaman selesai dimuat pertama kali
    setTimeout(hideLoading, 100);

    // 3. INTERCEPT FETCH (Agar loading muncul saat request API)
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        // Jangan munculkan loading jika request dilakukan di background (opsional)
        // Tapi untuk aman, kita biarkan dulu
        showLoading();
        try {
            const response = await originalFetch(...args);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setTimeout(hideLoading, 300); 
        }
    };

    // 4. DETEKSI KLIK LINK
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button.btn-confirm, button.btn-save, button.btn-add, .ppob-item, .category-item, .product-card');
        
        if (target) {
            const href = target.getAttribute('href');
            // Abaikan link kosong, javascript:, atau target blank
            if (!href || href === '#' || href.startsWith('javascript') || target.target === '_blank') return;
            
            // Abaikan tombol batal/tutup
            if (target.classList.contains('btn-cancel') || target.classList.contains('btn-close-modal')) return;
            
            showLoading();
        }
    });
});

// --- PERBAIKAN UTAMA: HANDLER TOMBOL KEMBALI (BACK BUTTON) ---

// Event 'pageshow' dipanggil saat halaman ditampilkan, termasuk dari Cache (Back Button)
window.addEventListener('pageshow', (event) => {
    // Jika halaman diambil dari cache (event.persisted), ATAU sekadar navigasi history
    // Paksa hilangkan loading
    setTimeout(hideLoading, 50); 
});

// Event 'popstate' khusus untuk navigasi history browser
window.addEventListener('popstate', () => {
    setTimeout(hideLoading, 50);
});

// -----------------------------------------------------------

function showLoading() {
    const loader = document.getElementById("globalLoader");
    if(loader) loader.classList.add("show");
}

function hideLoading() {
    const loader = document.getElementById("globalLoader");
    if(loader) loader.classList.remove("show");
}
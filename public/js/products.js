const API_URL = '/api';
let currentSort = 'newest'; 
let currentKeyword = ''; 

// --- FUNGSI GLOBAL BADGE (WAJIB ADA & DI LUAR DOMContentLoaded) ---
window.updateCartBadge = function() {
    const cart = JSON.parse(localStorage.getItem('rinsCart')) || [];
    const count = cart.length;
    // Cari badge di header/nav (bisa id="cartBadge" atau class="cart-badge-fixed")
    const badges = document.querySelectorAll('#cartBadge, .cart-badge-fixed');
    
    badges.forEach(badge => {
        badge.innerText = count;
        if (count > 0) {
            badge.classList.add('show');
            // Efek Membal
            badge.classList.remove('bump');
            void badge.offsetWidth; 
            badge.classList.add('bump');
        } else {
            badge.classList.remove('show');
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Panggil badge saat load
    updateCartBadge();

    // Cek apakah kita di halaman list produk?
    if (document.getElementById('allProductsContainer')) {
        loadProducts();
        setupFilterUI();
        setupInlineSearch();
    }
});

// ... (Sisa fungsi setupInlineSearch, setupFilterUI, dll biarkan tetap sama) ...
// (Agar tidak kepanjangan, saya tidak tulis ulang bagian bawahnya karena sudah benar)
// Pastikan fungsi window.applySort dan async loadProducts tetap ada di bawah sini.
// ...
// ...

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupFilterUI();
    setupInlineSearch(); // PENTING: Fungsi ini mengaktifkan pencarian
});

// 1. Setup Pencarian Inline (Enter & Klik Ikon)
function setupInlineSearch() {
    const input = document.getElementById('inlineSearchInput');
    // Cari elemen ikon pembesar (elemen <i> di dalam .search-bar-inline)
    const searchIcon = document.querySelector('.search-bar-inline i');
    
    // Fungsi Eksekusi Pencarian
    const doSearch = () => {
        if (!input) return;
        currentKeyword = input.value.trim();
        loadProducts(); // Reload produk dengan keyword baru
    };

    if (input) {
        // A. Tekan Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doSearch();
        });
    }

    if (searchIcon) {
        // Ubah kursor jadi pointer agar terlihat bisa diklik
        searchIcon.style.cursor = 'pointer';
        
        // B. Klik Ikon Kaca Pembesar
        searchIcon.addEventListener('click', () => {
            doSearch();
        });
    }
}

// 2. Setup UI Filter
function setupFilterUI() {
    const btn = document.getElementById('filterBtn');
    const menu = document.getElementById('filterMenu');
    
    if (btn && menu) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
            btn.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
                btn.classList.remove('active');
            }
        });
    }
}

// 3. Fungsi Apply Sort (Sortir)
window.applySort = function(sortType, element) {
    currentSort = sortType;
    document.querySelectorAll('.filter-option').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');

    const menu = document.getElementById('filterMenu');
    const btn = document.getElementById('filterBtn');
    if(menu) menu.classList.remove('show');
    if(btn) btn.classList.remove('active');

    loadProducts();
}

// 4. Load & Render Produk
async function loadProducts() {
    const container = document.getElementById('allProductsContainer');
    if (!container) return;

    container.innerHTML = '<p style="color:#64748b; padding:1rem; grid-column: 1/-1; text-align: center;">Memuat...</p>';

    try {
        // Susun URL dengan Sortir & Keyword
        let url = `${API_URL}/products?sort=${currentSort}`;
        if (currentKeyword) {
            // Jika ada keyword, gunakan endpoint pencarian
            url = `${API_URL}/products/search?keyword=${encodeURIComponent(currentKeyword)}`;
        }

        const res = await fetch(url);
        const products = await res.json();

        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
                    <i class="fa-solid fa-box-open" style="font-size: 4rem; color: #334155; margin-bottom: 1rem;"></i>
                    <h3 style="color: #94a3b8; font-size: 1.1rem; font-weight: 600;">Tidak ada produk.</h3>
                    <p style="color: #64748b; font-size: 0.8rem;">Coba kata kunci lain.</p>
                </div>
            `;
            return;
        }

        products.forEach(prod => {
            const harga = new Intl.NumberFormat('id-ID').format(prod.price);
            
            let badgeHtml = '';
            let priceHtml = `<div class="current-price">Rp ${harga}</div>`;

            if (prod.originalPrice && prod.originalPrice > prod.price) {
                const diskon = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
                const hargaCoret = new Intl.NumberFormat('id-ID').format(prod.originalPrice);
                badgeHtml = `<div class="badges">Hemat ${diskon}%</div>`;
                priceHtml = `<div class="original-price">Rp ${hargaCoret}</div><div class="current-price">Rp ${harga}</div>`;
            }

            const card = document.createElement('div');
            card.className = 'product-card';
            card.onclick = () => window.location.href = `product.html?slug=${prod.slug}`;

            card.innerHTML = `
                ${badgeHtml}
                <div class="img-wrapper">
                    <img src="${prod.images[0]}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                </div>
                <div class="details">
                    <h4>${prod.name}</h4>
                    <div class="price-container">${priceHtml}</div>
                    <div class="btn-buy">LIHAT DETAIL</div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red; grid-column: 1/-1; text-align: center;">Gagal memuat data.</p>';
    }
}

/* --- LOGIKA BADGE KERANJANG & ANIMASI --- */

// 1. Fungsi Update Angka Badge (Dipanggil saat load & saat tambah barang)
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('rinsCart')) || [];
    const count = cart.length;
    const badge = document.getElementById('cartBadge');
    
    if (badge) {
        badge.innerText = count;
        
        if (count > 0) {
            badge.classList.add('show'); // Munculkan jika ada isi
        } else {
            badge.classList.remove('show'); // Sembunyikan jika kosong
        }

        // Efek "Bump" (Membal) saat angka berubah
        badge.classList.remove('bump');
        void badge.offsetWidth; // Trigger reflow (reset animasi)
        badge.classList.add('bump');
    }
}

// 2. Jalankan saat halaman dibuka pertama kali
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    
    // Tambahan: Override fungsi tombol "Troli" yang lama agar ada animasinya
    // Cek apakah ada tombol Add To Cart di halaman ini (Halaman Detail)
    const btnAdd = document.getElementById('btnAddToCart');
    if (btnAdd) {
        // Hapus listener lama (trick: clone node) agar tidak dobel, atau kita timpa logicnya
        // Tapi cara paling aman adalah menambahkan efek visual saja di sini
        btnAdd.addEventListener('click', function() {
            // Efek Tombol Mengecil (Klik)
            this.classList.add('btn-clicked');
            setTimeout(() => this.classList.remove('btn-clicked'), 150);

            // Update Badge (Ada delay sedikit biar sinkron dengan simpan data)
            setTimeout(updateCartBadge, 100); 
        });
    }
});

// PENTING: Karena Anda punya logika "Add to Cart" yang tersebar, 
// pastikan setiap kali Anda menyimpan ke localStorage, Anda memanggil updateCartBadge()
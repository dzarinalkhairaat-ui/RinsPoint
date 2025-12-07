const API_URL = '/api';
let currentSort = 'newest'; 
let currentKeyword = ''; 

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
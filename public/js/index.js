const API_URL = '/api';
const titleElement = document.querySelector('.section-title h3'); 

document.addEventListener('DOMContentLoaded', () => {
    // HAPUS loadBanners(); karena banner sekarang manual
    fetchCategories();
    fetchProducts();
    setupSearch(); 
});

// --- FUNGSI LOAD BANNER & SLIDER SUDAH DIHAPUS TOTAL ---

async function fetchCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`);
        const categories = await res.json();
        const container = document.getElementById('categoryContainer');
        container.innerHTML = ''; 
        if (categories.length === 0) { container.innerHTML = '<p style="font-size:0.8rem; color:#64748b; padding:10px;">Kategori kosong</p>'; return; }
        categories.forEach(cat => {
            const iconClass = cat.icon ? cat.icon : 'fa-box'; 
            const div = document.createElement('a');
            div.href = `category.html?id=${cat._id}&name=${encodeURIComponent(cat.name)}`;
            div.className = 'category-item'; 
            div.innerHTML = `<i class="fa-solid ${iconClass} icon"></i><span>${cat.name}</span>`;
            container.appendChild(div);
        });
    } catch (error) { console.error('Gagal load kategori'); }
}

async function fetchProducts() {
    try {
        if(titleElement) titleElement.innerText = 'Terbaru';
        const res = await fetch(`${API_URL}/products?platform=Affiliate`);
        const products = await res.json();
        renderProducts(products);
    } catch (error) { console.error('Gagal load produk'); }
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    if (!products || products.length === 0) { container.innerHTML = '<p style="padding:1rem; color:#94a3b8; width:100%;">Belum ada produk.</p>'; return; }
    products.forEach(prod => {
        const harga = new Intl.NumberFormat('id-ID').format(prod.price);
        let badgeHtml = ''; let priceHtml = `<div class="price">Rp ${harga}</div>`;
        if (prod.originalPrice && prod.originalPrice > prod.price) {
            const diskon = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
            const hargaCoret = new Intl.NumberFormat('id-ID').format(prod.originalPrice);
            badgeHtml = `<div class="badges">Hemat ${diskon}%</div>`;
            priceHtml = `<div class="original-price">Rp ${hargaCoret}</div><div class="price">Rp ${harga}</div>`;
        }
        const gambar = (prod.images && prod.images.length > 0) ? prod.images[0] : 'https://via.placeholder.com/150?text=No+Image';
        const card = document.createElement('div'); card.className = 'product-card';
        card.onclick = () => window.location.href = `product.html?slug=${prod.slug}`; card.style.cursor = 'pointer';
        card.innerHTML = `${badgeHtml}<div class="img-wrapper"><img src="${gambar}" alt="${prod.name}" loading="lazy"></div><div class="details"><h4 style="margin-bottom: 5px;">${prod.name}</h4>${priceHtml}<div class="btn-buy" style="margin-top: auto; text-align:center; font-size:0.8rem;">LIHAT DETAIL</div></div>`;
        container.appendChild(card);
    });
}

function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchIcon = document.querySelector('.search-bar i');
    const goToSearch = () => { const keyword = searchInput.value.trim(); if (keyword) window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`; };
    if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') goToSearchPage(); });
    if (searchIcon) { searchIcon.style.cursor = 'pointer'; searchIcon.addEventListener('click', () => goToSearch()); }
}
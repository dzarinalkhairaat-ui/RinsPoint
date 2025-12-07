const API_URL = '/api';
const titleElement = document.querySelector('.section-title h3'); 

document.addEventListener('DOMContentLoaded', () => {
    loadBanners(); // Load Banner dari Database
    fetchCategories();
    fetchProducts();
    setupSearch(); 
});

// =========================================
// 1. BANNER SLIDER (DINAMIS DARI DB)
// =========================================
let currentSlide = 0;
let totalSlides = 3; 
const slideInterval = 4000; 
let slideTimer;

async function loadBanners() {
    try {
        const res = await fetch(`${API_URL}/settings`);
        const settings = await res.json();
        
        if (settings.banners && settings.banners.length > 0) {
            renderBanners(settings.banners);
        } else {
            // Jika kosong di DB, inisialisasi slider default (HTML)
            initSlider(); 
        }
    } catch (error) {
        console.error("Gagal load banner custom");
        initSlider();
    }
}

function renderBanners(banners) {
    const track = document.getElementById('sliderTrack');
    const dotsContainer = document.getElementById('sliderDots');
    
    track.innerHTML = ''; 
    dotsContainer.innerHTML = '';
    totalSlides = banners.length;

    banners.forEach((banner, index) => {
        // Render Slide
        const div = document.createElement('div');
        div.className = 'hero-banner slide';
        // Terapkan Gradient dari Database
        div.style.background = banner.gradient || 'linear-gradient(135deg, #4ADE80 0%, #166534 100%)'; 
        
        // Terapkan SVG dan Teks
        div.innerHTML = `
            <div class="banner-text">
                <h2>${banner.title || 'Judul Banner'}</h2>
                <p>${banner.subtitle || 'Subjudul Banner'}</p>
            </div>
            <div class="banner-decoration-svg" style="position: absolute; right: -20px; bottom: -20px; width: 140px; height: 140px; opacity: 0.2; color:white;">
                ${banner.svgIcon || ''}
            </div>
        `;
        track.appendChild(div);

        // Render Dot
        const dot = document.createElement('span');
        dot.className = index === 0 ? 'dot active' : 'dot';
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });

    // Reset dan Jalankan Slider
    currentSlide = 0;
    initSlider();
}

function initSlider() {
    if(slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, slideInterval);
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, slideInterval);
}

function updateSlider() {
    const track = document.getElementById('sliderTrack');
    const dots = document.querySelectorAll('.dot');

    if(track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    if(dots.length > 0) {
        dots.forEach(dot => dot.classList.remove('active'));
        if(dots[currentSlide]) dots[currentSlide].classList.add('active');
    }
}

// =========================================
// 2. KATEGORI (SCROLL SAMPING)
// =========================================
async function fetchCategories() {
    try {
        const res = await fetch(`${API_URL}/categories`);
        const categories = await res.json();
        const container = document.getElementById('categoryContainer');
        
        container.innerHTML = ''; 

        categories.forEach(cat => {
            const iconClass = cat.icon ? cat.icon : 'fa-box'; 
            
            const div = document.createElement('a');
            div.href = `category.html?id=${cat._id}&name=${encodeURIComponent(cat.name)}`;
            
            // Class 'category-item' untuk style scroll samping
            div.className = 'category-item'; 
            
            div.innerHTML = `
                <i class="fa-solid ${iconClass} icon"></i>
                <span>${cat.name}</span>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Gagal load kategori');
    }
}

// =========================================
// 3. PRODUK TERBARU (GRID 2 KOLOM)
// =========================================
async function fetchProducts() {
    try {
        if(titleElement) titleElement.innerText = 'Terbaru';
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        renderProducts(products);
    } catch (error) {
        console.error('Gagal load produk');
    }
}

// Helper: Render Produk (Standar Konsisten)
function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="padding:1rem; color:#94a3b8;">Belum ada produk.</p>';
        return;
    }

    products.forEach(prod => {
        const harga = new Intl.NumberFormat('id-ID').format(prod.price);
        
        let badgeHtml = '';
        let priceHtml = `<div class="price">Rp ${harga}</div>`;

        if (prod.originalPrice && prod.originalPrice > prod.price) {
            const diskon = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
            const hargaCoret = new Intl.NumberFormat('id-ID').format(prod.originalPrice);
            badgeHtml = `<div class="badges">Hemat ${diskon}%</div>`;
            priceHtml = `
                <div class="original-price">Rp ${hargaCoret}</div>
                <div class="price">Rp ${harga}</div>
            `;
        }

        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => window.location.href = `product.html?slug=${prod.slug}`;
        card.style.cursor = 'pointer';

        card.innerHTML = `
            ${badgeHtml}
            <div class="img-wrapper">
                <img src="${prod.images[0]}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/150'">
            </div>
            <div class="details">
                <h4>${prod.name}</h4>
                ${priceHtml}
                <div class="btn-buy" style="margin-top: auto; text-align:center;">LIHAT DETAIL</div>
            </div>
        `;
        container.appendChild(card);
    });
}

// =========================================
// 4. PENCARIAN MANUAL
// =========================================
function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchIcon = document.querySelector('.search-bar i');

    const goToSearch = () => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            window.location.href = `/search.html?keyword=${encodeURIComponent(keyword)}`;
        }
    };

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') goToSearch();
        });
    }

    if (searchIcon) {
        searchIcon.style.cursor = 'pointer'; 
        searchIcon.addEventListener('click', () => goToSearch());
    }
}
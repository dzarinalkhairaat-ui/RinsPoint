const API_URL = '/api';
const titleElement = document.querySelector('.section-title h3'); 

document.addEventListener('DOMContentLoaded', () => {
    loadBanners(); // Load Banner Gambar dari Database
    fetchCategories();
    fetchProducts();
    setupSearch(); 
});

// =========================================
// 1. BANNER SLIDER (DINAMIS GAMBAR)
// =========================================
let currentSlide = 0;
let totalSlides = 1; 
const slideInterval = 4000; 
let slideTimer;

async function loadBanners() {
    try {
        const res = await fetch(`${API_URL}/settings`);
        const settings = await res.json();
        
        // Cek apakah ada banner yang diupload?
        if (settings.banners && settings.banners.length > 0) {
            renderBanners(settings.banners);
        } else {
            // Jika kosong, biarkan default HTML (atau kosongkan)
            console.log("Belum ada banner yang diupload.");
            initSlider(); 
        }
    } catch (error) {
        console.error("Gagal load banner:", error);
        initSlider();
    }
}

function renderBanners(banners) {
    const track = document.getElementById('sliderTrack');
    const dotsContainer = document.getElementById('sliderDots');
    
    // Reset Konten Lama
    track.innerHTML = ''; 
    dotsContainer.innerHTML = '';
    totalSlides = banners.length;

    banners.forEach((banner, index) => {
        const div = document.createElement('div');
        div.className = 'hero-banner slide';
        
        // Hapus padding bawaan CSS agar gambar full
        div.style.padding = '0'; 
        div.style.background = 'transparent';
        div.style.overflow = 'hidden';
        
        // PENTING: Set tinggi container jadi auto agar mengikuti tinggi gambar
        div.style.height = 'auto'; 

        // LOGIKA BARU: Tampilkan Gambar UTUH
        // Kita gunakan 'imageUrl' yang tersimpan di database
        if (banner.imageUrl) {
            div.innerHTML = `
                <img src="${banner.imageUrl}" alt="Banner ${index + 1}" 
                     style="width: 100%; height: auto; border-radius: 16px; display: block;">
            `;
            // Catatan: height: auto menjamin gambar tidak terpotong (cropping)
        } else {
            // Fallback: Jika gambar rusak/hilang, tampilkan gradient sederhana
            div.style.padding = '1.5rem';
            div.style.height = '180px'; // Tinggi fix hanya untuk gradient fallback
            div.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
            div.innerHTML = `
                <div class="banner-text">
                    <h2 style="font-size: 1.2rem;">RinsPoint</h2>
                    <p>Promo Spesial</p>
                </div>
            `;
        }
        
        track.appendChild(div);

        // Render Dot Navigasi
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
    // Logic loop: Jika sudah slide terakhir, balik ke 0
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

    // Geser Track
    if(track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Update Dots Active
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

        if (categories.length === 0) {
            container.innerHTML = '<p style="font-size:0.8rem; color:#64748b; padding:10px;">Kategori kosong</p>';
            return;
        }

        categories.forEach(cat => {
            const iconClass = cat.icon ? cat.icon : 'fa-box'; 
            
            const div = document.createElement('a');
            div.href = `category.html?id=${cat._id}&name=${encodeURIComponent(cat.name)}`;
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
// 3. PRODUK TERBARU (GRID)
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

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    if (!products || products.length === 0) {
        container.innerHTML = '<p style="padding:1rem; color:#94a3b8; width:100%;">Belum ada produk.</p>';
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

        const gambar = (prod.images && prod.images.length > 0) ? prod.images[0] : 'https://via.placeholder.com/150?text=No+Image';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => window.location.href = `product.html?slug=${prod.slug}`;
        card.style.cursor = 'pointer';

        card.innerHTML = `
            ${badgeHtml}
            <div class="img-wrapper">
                <img src="${gambar}" alt="${prod.name}" loading="lazy">
            </div>
            <div class="details">
                <h4 style="margin-bottom: 5px;">${prod.name}</h4>
                ${priceHtml}
                <div class="btn-buy" style="margin-top: auto; text-align:center; font-size:0.8rem;">LIHAT DETAIL</div>
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
            window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`;
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
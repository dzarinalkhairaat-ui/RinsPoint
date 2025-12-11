const API_URL = '/api';

// Fungsi Utama: Load Produk Berdasarkan Kategori
async function loadProductsByCategory(categoryName) {
    const container = document.getElementById('productsContainer');
    
    // Tampilkan Loading
    container.innerHTML = `
        <div style="text-align:center; padding:20px; color:#64748b;">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Memuat produk...
        </div>
    `;

    try {
        // PERUBAHAN: Kita ambil 2 data sekaligus (Produk & Setting)
        // Promise.all agar loadingnya paralel dan cepat
        const [productsRes, settingsRes] = await Promise.all([
            fetch(`${API_URL}/products?platform=PPOB`),
            fetch(`${API_URL}/settings`)
        ]);

        const allProducts = await productsRes.json();
        const settings = await settingsRes.json();

        // 1. CEK STATUS TOKO DARI SETTING
        // Jika settings.ppobStatus undefined, anggap true (buka)
        const isStoreOpen = settings.ppobStatus !== false; 

        // Filter Sesuai Kategori Halaman Ini (Misal: "Pulsa")
        const filteredProducts = allProducts.filter(p => {
            const pCat = p.category && p.category.name ? p.category.name : p.category;
            return pCat === categoryName;
        });

        // Bersihkan Container
        container.innerHTML = '';

        if (filteredProducts.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:#64748b;">
                    <i class="fa-solid fa-box-open" style="font-size:3rem; margin-bottom:10px;"></i><br>
                    Produk belum tersedia.
                </div>`;
            return;
        }

        // Render Produk
        filteredProducts.forEach(prod => {
            const harga = new Intl.NumberFormat('id-ID').format(prod.price);
            
            // LOGIKA GAMBAR
            let imageHtml = '';
            if (prod.images && prod.images.length > 0) {
                imageHtml = `<img src="${prod.images[0]}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; margin-right:12px;">`;
            } else {
                imageHtml = `<div style="width:40px; height:40px; border-radius:8px; background:rgba(74,222,128,0.1); display:flex; align-items:center; justify-content:center; margin-right:12px; color:#4ade80;"><i class="fa-solid fa-bolt"></i></div>`;
            }

            // LOGIKA STATUS TOKO (NEW)
            let statusText = '';
            let statusColor = '';
            let cursorStyle = '';

            if (isStoreOpen) {
                statusText = 'Stok Tersedia';
                statusColor = '#4ade80'; // Hijau
                cursorStyle = 'pointer';
            } else {
                statusText = 'Produk tidak tersedia';
                statusColor = '#ef4444'; // Merah
                cursorStyle = 'not-allowed'; // Kursor tanda larang
            }

            const div = document.createElement('div');
            // Style Card Produk
            div.style.cssText = `background:#1e293b; padding:12px; border-radius:12px; border:1px solid #334155; margin-bottom:10px; display:flex; align-items:center; cursor:${cursorStyle}; transition:0.2s;`;
            
            // Hover effect (Hanya jika toko buka)
            if (isStoreOpen) {
                div.onmouseover = () => { div.style.borderColor = '#4ade80'; };
                div.onmouseout = () => { div.style.borderColor = '#334155'; };
                
                // Klik hanya bisa jika toko buka
                div.onclick = () => showPurchaseModalWithNumber(prod);
            } else {
                // Jika tutup, klik munculkan alert
                div.onclick = () => alert("Maaf, Layanan PPOB sedang dinonaktifkan oleh Admin.");
                div.style.opacity = "0.7"; // Agak redup biar kelihatan tidak aktif
            }

            div.innerHTML = `
                ${imageHtml} 
                
                <div style="flex:1;">
                    <div style="color:white; font-weight:600; font-size:0.95rem; margin-bottom:2px;">${prod.name}</div>
                    <div style="color:${statusColor}; font-size:0.75rem; font-weight:500;">${statusText}</div>
                </div>
                
                <div style="text-align:right;">
                    <div style="color:#4ade80; font-weight:bold; font-size:1rem;">Rp ${harga}</div>
                </div>
            `;
            container.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div style="text-align:center; color:#ef4444; padding:20px;">
                <i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat produk.
            </div>`;
    }
}

// Logic Modal Pembelian
function showPurchaseModalWithNumber(product) {
    const phoneInput = document.getElementById('headerPhoneNumber');
    let phoneNumber = '';

    if (phoneInput) {
        phoneNumber = phoneInput.value;
        if (!phoneNumber || phoneNumber.length < 4) {
            alert('Mohon masukkan nomor/ID tujuan terlebih dahulu!');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            phoneInput.focus();
            return;
        }
    }

    if(document.getElementById('detailName')) document.getElementById('detailName').innerText = product.name;
    if(document.getElementById('detailPrice')) document.getElementById('detailPrice').innerText = 'Rp ' + new Intl.NumberFormat('id-ID').format(product.price);
    
    if(document.getElementById('displayNumber')) document.getElementById('displayNumber').innerText = phoneNumber;
    if(document.getElementById('customerNumber')) document.getElementById('customerNumber').value = phoneNumber;
    
    window.selectedProduct = product;

    const modal = document.getElementById('purchaseModal');
    if(modal) modal.style.display = 'flex';
}

function closePurchaseModal() {
    document.getElementById('purchaseModal').style.display = 'none';
}

function processToPayment() {
    // 1. Validasi Produk
    if (!window.selectedProduct) {
        alert("Terjadi kesalahan: Produk tidak terpilih.");
        return;
    }
    
    // 2. Validasi Nomor HP
    const customerNumber = document.getElementById('customerNumber').value;
    if (!customerNumber || customerNumber.length < 4) {
        alert("Mohon masukkan Nomor Tujuan / ID Game dengan benar.");
        document.getElementById('customerNumber').focus();
        return;
    }
    
    // 3. Simpan Data Transaksi ke LocalStorage (Data Sementara)
    const transactionData = {
        type: 'PPOB',
        productName: window.selectedProduct.name,
        productPrice: window.selectedProduct.price,
        productCategory: window.selectedProduct.category, // String atau Object aman
        customerNumber: customerNumber,
        date: new Date().toISOString()
    };
    
    localStorage.setItem('currentTransaction', JSON.stringify(transactionData));
    
    // 4. Redirect ke Halaman Pembayaran
    window.location.href = '/payment.html'; 
}
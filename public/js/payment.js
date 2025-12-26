// public/js/payment.js

const API_URL = '/api';
let transaction = null;
let selectedMethod = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Ambil Data dari LocalStorage
    const rawData = localStorage.getItem('currentTransaction');
    if (!rawData) { 
        alert('Data transaksi hilang.'); 
        window.location.href = '/ppob.html'; 
        return; 
    }
    
    transaction = JSON.parse(rawData);
    
    // 2. Tampilkan Data
    document.getElementById('dispProduct').innerText = transaction.productName;
    document.getElementById('dispNumber').innerText = transaction.customerNumber;
    const formattedPrice = 'Rp ' + new Intl.NumberFormat('id-ID').format(transaction.productPrice);
    document.getElementById('dispPrice').innerText = formattedPrice;
    
    const floatPrice = document.getElementById('dispPriceFloat');
    if(floatPrice) floatPrice.innerText = formattedPrice;
    
    // 3. Muat Metode Pembayaran
    await loadPaymentMethods();
});

async function loadPaymentMethods() {
    const container = document.getElementById('paymentMethodsContainer');
    try {
        const res = await fetch(`${API_URL}/payments?t=${new Date().getTime()}`);
        const methods = await res.json();
        
        container.innerHTML = '';
        const groups = { bank: [], ewallet: [], qris: [] };
        
        methods.forEach(m => { 
            if(m.isActive) groups[m.type].push(m); 
        });
        
        if (groups.qris.length > 0) renderGroup(container, 'Scan QRIS', groups.qris);
        if (groups.bank.length > 0) renderGroup(container, 'Transfer Bank', groups.bank);
        if (groups.ewallet.length > 0) renderGroup(container, 'E-Wallet', groups.ewallet);
        
    } catch (error) { 
        console.error(error); 
        container.innerHTML = '<p style="color:#ef4444; text-align:center;">Gagal memuat metode pembayaran.</p>'; 
    }
}

function renderGroup(container, title, items) {
    let html = `<div class="method-group"><span class="method-label">${title}</span>`;
    items.forEach(m => {
        let iconHtml = '<i class="fa-solid fa-building-columns" style="color:#0f172a;"></i>';
        if(m.icon && m.icon.trim() !== "") {
            iconHtml = `<img src="${m.icon}" alt="${m.name}">`;
        } else {
            if(m.type === 'ewallet') iconHtml = '<i class="fa-solid fa-wallet" style="color:#0f172a;"></i>';
            if(m.type === 'qris') iconHtml = '<i class="fa-solid fa-qrcode" style="color:#0f172a;"></i>';
        }
        let desc = m.type === 'qris' ? 'Ketuk untuk melihat QR Code' : `${m.number} a.n ${m.holder}`;
        const methodString = encodeURIComponent(JSON.stringify(m));
        
        html += `
        <div class="payment-method" onclick="selectMethod(this, '${methodString}')">
            <div class="method-icon">${iconHtml}</div>
            <div class="method-info">
                <div class="method-name">${m.name} 
                    ${m.type !== 'qris' ? `<button class="btn-copy" onclick="copyText(event, '${m.number}')"><i class="fa-regular fa-copy"></i></button>` : ''}
                </div>
                <div class="method-desc">${desc}</div>
            </div>
            <div class="check-badge"><i class="fa-solid fa-check"></i></div>
        </div>`;
    });
    html += `</div>`;
    container.innerHTML += html;
}

function selectMethod(el, methodString) {
    document.querySelectorAll('.payment-method').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    selectedMethod = JSON.parse(decodeURIComponent(methodString));
    checkForm();
    if (selectedMethod.type === 'qris') {
        document.getElementById('qrisName').innerText = selectedMethod.name;
        document.getElementById('qrisImage').src = selectedMethod.icon;
        document.getElementById('qrisModal').classList.add('show');
    }
}

function copyText(e, text) {
    e.stopPropagation(); 
    navigator.clipboard.writeText(text);
    alert('Nomor disalin: ' + text); 
}

function previewProof(input) {
    const preview = document.getElementById('previewImg');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
        checkForm();
    }
}

function checkForm() {
    const hasMethod = selectedMethod !== null;
    const hasProof = document.getElementById('proofFile').files.length > 0;
    const btn = document.getElementById('btnConfirm');
    if (hasMethod && hasProof) btn.disabled = false; 
    else btn.disabled = true; 
}

// --- BAGIAN INI YANG DIMODIFIKASI UNTUK DEBUG ---
async function processPayment() {
    const btn = document.getElementById('btnConfirm');
    const originalText = btn.innerHTML;
    
    // Loading State
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses...';
    
    try {
        const formData = new FormData();
        const fileInput = document.getElementById('proofFile');
        
        formData.append('productCode', transaction.productCode || transaction.buyer_sku_code);
        formData.append('productName', transaction.productName);
        formData.append('customerPhone', transaction.customerNumber || transaction.customer_no);
        formData.append('price', transaction.productPrice);
        
        if(fileInput.files[0]){
            formData.append('paymentProof', fileInput.files[0]);
        }

        // --- AMBIL ID NOTIFIKASI PEMBELI (DEBUG MODE) ---
        let userIdCaptured = null;

        if (window.OneSignalDeferred) {
            await new Promise(resolve => {
                window.OneSignalDeferred.push(async function(OneSignal) {
                    try {
                        // Coba ambil ID
                        userIdCaptured = await OneSignal.User.PushSubscription.id;
                        console.log("Player ID Found:", userIdCaptured);
                    } catch (e) {
                        console.warn("Gagal ambil OneSignal ID", e);
                    }
                    resolve();
                });
            });
        }

        // --- CEK APAKAH ID DAPAT ATAU TIDAK ---
        if (!userIdCaptured) {
            // Tampilkan Alert biar Admin sadar kalau ID nya kosong
            alert("⚠️ PERINGATAN: Sistem Gagal Mengambil ID Notifikasi HP ini.\n\nNotifikasi status mungkin tidak akan masuk. Pastikan Izin Notifikasi browser sudah 'Allow'.");
        } else {
            // alert("✅ ID Ditemukan: " + userIdCaptured); // Opsional: Aktifkan kalau mau lihat ID-nya
            formData.append('userPlayerId', userIdCaptured);
        }

        // Kirim ke Backend
        const response = await fetch('/api/ppob/transaction', {
            method: 'POST',
            body: formData 
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('successModal').classList.add('show');
            localStorage.removeItem('currentTransaction');
        } else {
            throw new Error(result.message || 'Gagal memproses transaksi');
        }

    } catch (error) {
        console.error("Payment Error:", error);
        alert('Terjadi kesalahan: ' + error.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function finishOrder() {
    window.location.href = '/ppob.html'; 
}
// Fungsi untuk mengecek apakah user sudah login
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    
    // Jika tidak ada token, tendang ke halaman login
    if (!token) {
        window.location.href = '/login.html';
    }
}

// Fungsi Logout
function logout() {
    if(confirm('Yakin ingin keluar?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        window.location.href = '/login.html';
    }
}
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCsV9fJKzYQHLuSBC4LIf740OyNjgL36VE",
    authDomain: "rinspoint-2e239.firebaseapp.com",
    projectId: "rinspoint-2e239",
    storageBucket: "rinspoint-2e239.firebasestorage.app",
    messagingSenderId: "680165358672",
    appId: "1:680165358672:web:5bdf28d0b55c9b71a06555",
    measurementId: "G-S0EYYE6EDL"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 1. EVENT SAAT HP MATI / APLIKASI TERTUTUP (BACKGROUND)
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Notifikasi Background Masuk:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/assets/images/icon-512.png', // Pastikan icon ini ada!
        badge: '/assets/images/icon-512.png', // Icon kecil di status bar
        vibrate: [500, 200, 500, 200, 500], // Getar Panjang & Agresif
        tag: 'order-masuk', // Tag unik
        renotify: true, // WAJIB TRUE: Agar kalau ada notif baru, dia bunyi lagi!
        priority: 'high', // Prioritas Tinggi
        data: {
            url: '/admin/dashboard.html' // Link tujuan saat diklik
        }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 2. EVENT SAAT NOTIFIKASI DIKLIK
self.addEventListener('notificationclick', function(event) {
    console.log('[SW] Notifikasi Diklik');
    event.notification.close(); // Tutup notifikasi

    // Buka Halaman Dashboard Admin
    event.waitUntil(
        clients.matchAll({type: 'window'}).then(windowClients => {
            // Cek kalau admin sudah terbuka, fokuskan ke sana
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url.includes('/admin/dashboard.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Kalau belum terbuka, buka baru
            if (clients.openWindow) {
                return clients.openWindow('/admin/dashboard.html');
            }
        })
    );
});
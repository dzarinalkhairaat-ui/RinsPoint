importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// 1. Config Firebase
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

// 2. Handler Saat Layar Mati / Background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notif Background:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // Gunakan icon.png yang pasti ada (sesuai header html kamu)
    icon: '/assets/images/icon.png', 
    badge: '/assets/images/icon.png',
    vibrate: [200, 100, 200], // Getar Biar Terasa
    tag: 'order-notification', // Agar notif tidak menumpuk
    renotify: true // Bunyi lagi kalau ada notif baru
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 3. LOGIKA WAJIB: Paksa Service Worker Selalu Aktif
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    self.skipWaiting(); // Jangan antri, langsung install!
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(clients.claim()); // Ambil alih kontrol segera!
});
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

// HANDLER BACKGROUND (Saat Layar Mati / Aplikasi Tutup)
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Order Masuk (Background):', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/assets/images/icon.png',
        badge: '/assets/images/icon.png',
        // Getar Agresif: Panjang-Pendek-Panjang
        vibrate: [500, 200, 500], 
        tag: 'order-notification',
        renotify: true // Pastikan bunyi lagi walau notif lama belum dihapus
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
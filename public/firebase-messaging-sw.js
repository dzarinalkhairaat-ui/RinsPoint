importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Config Firebase (Sesuai data kamu)
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

// Handler Pesan Background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notif Background:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/images/icon-512.png', // Saya ubah jadi icon.png sesuai manifest kamu
    badge: '/assets/images/icon-512.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
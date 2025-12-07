if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('PWA ServiceWorker registration successful');
    }, function(err) {
      console.log('PWA ServiceWorker registration failed: ', err);
    });
  });
}
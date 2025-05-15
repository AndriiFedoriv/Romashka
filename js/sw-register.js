if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/js/service-worker.js')
    .then(reg => console.log('✅ Service Worker зареєстрований:', reg.scope))
    .catch(err => console.error('❌ Service Worker не вдалося зареєструвати:', err));
}
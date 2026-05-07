const CACHE = 'obs-psicosocial-v3';
const ARCHIVOS = ['/index.html', '/manifest.json'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(cache){ return cache.addAll(ARCHIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
  self.clients.matchAll().then(function(clients){
    clients.forEach(function(c){ c.postMessage({type:'RELOAD'}); });
  });
});

self.addEventListener('fetch', function(e){
  if(e.request.url.includes('index.html')||e.request.url.endsWith('/')){
    e.respondWith(fetch(e.request).then(function(r){
      var c=r.clone(); caches.open(CACHE).then(function(cache){ cache.put(e.request,c); }); return r;
    }).catch(function(){ return caches.match(e.request); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(cached){
    return cached||fetch(e.request).then(function(r){
      var c=r.clone(); caches.open(CACHE).then(function(cache){ cache.put(e.request,c); }); return r;
    });
  }).catch(function(){ return caches.match('/index.html'); }));
});

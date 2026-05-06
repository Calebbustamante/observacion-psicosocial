const CACHE = 'obs-psicosocial-v1';
const ARCHIVOS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalar — guarda archivos en caché
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ARCHIVOS);
    })
  );
  self.skipWaiting();
});

// Activar — limpia cachés viejos
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — sirve desde caché si no hay red
self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(response){
        // Guarda nueva respuesta en caché
        var clone = response.clone();
        caches.open(CACHE).then(function(cache){
          cache.put(e.request, clone);
        });
        return response;
      });
    }).catch(function(){
      // Sin red y sin caché — devuelve index.html
      return caches.match('/index.html');
    })
  );
});

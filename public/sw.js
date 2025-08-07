// Optimized Service Worker pour Performance Mobile
const CACHE_VERSION = 'v2.1.0';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`,
  pages: `pages-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  fonts: `fonts-${CACHE_VERSION}`
};

// URLs critiques à précacher
const CRITICAL_URLS = [
  '/',
  '/offline.html',
  '/manifest.json'
];

// Assets statiques (Cache First - 30 jours)
const STATIC_ASSETS = [
  /^\/static\/js\/.+\.js$/,
  /^\/static\/css\/.+\.css$/,
  /^\/static\/media\/.+\.(woff2?|ttf|eot)$/
];

// API endpoints (Network First - 5 minutes)
const API_ENDPOINTS = [
  /^\/api\//,
  /firebase\.googleapis\.com/,
  /firestore\.googleapis\.com/
];

// Pages (Stale While Revalidate - 24h)
const PAGE_ROUTES = [
  /^\/$/,
  /^\/workout/,
  /^\/profile/,
  /^\/leaderboard/,
  /^\/badges/
];

// Images (Cache First - 7 jours)
const IMAGES = [
  /^\/static\/media\/.+\.(jpg|jpeg|png|gif|webp|svg)$/,
  /\.(?:jpg|jpeg|png|gif|webp|svg)$/
];

// Installation optimisée
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installation');
  
  event.waitUntil(
    Promise.all([
      // Cache des ressources critiques
      caches.open(CACHE_NAMES.pages).then(cache => 
        cache.addAll(CRITICAL_URLS)
      ),
      // Création des autres caches
      caches.open(CACHE_NAMES.static),
      caches.open(CACHE_NAMES.api),
      caches.open(CACHE_NAMES.images),
      caches.open(CACHE_NAMES.fonts)
    ])
  );
  
  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activation optimisée avec nettoyage intelligent
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activation');
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      caches.keys().then((cacheNames) => {
        const validCacheNames = Object.values(CACHE_NAMES);
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!validCacheNames.includes(cacheName)) {
              console.log(`🗑️ Suppression cache obsolète: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle de tous les clients
      self.clients.claim()
    ])
  );
});

// Stratégies de cache intelligentes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Stratégie selon le type de ressource
  if (matchesPattern(url.pathname, STATIC_ASSETS) || matchesPattern(url.pathname, IMAGES)) {
    // Cache First pour assets statiques et images
    event.respondWith(cacheFirst(request, getCacheNameForRequest(request)));
  } else if (matchesPattern(url.href, API_ENDPOINTS)) {
    // Network First pour API
    event.respondWith(networkFirst(request, CACHE_NAMES.api, 5000));
  } else if (matchesPattern(url.pathname, PAGE_ROUTES) || request.destination === 'document') {
    // Stale While Revalidate pour pages
    event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.pages));
  } else {
    // Réseau par défaut
    event.respondWith(fetch(request));
  }
});

// Utilitaires
function matchesPattern(url, patterns) {
  return patterns.some(pattern => pattern.test(url));
}

function getCacheNameForRequest(request) {
  const url = new URL(request.url);
  
  if (matchesPattern(url.pathname, IMAGES)) {
    return CACHE_NAMES.images;
  } else if (matchesPattern(url.pathname, [/\.(woff2?|ttf|eot)$/])) {
    return CACHE_NAMES.fonts;
  } else {
    return CACHE_NAMES.static;
  }
}

// Stratégie Cache First (pour assets statiques)
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Cache First failed:', error);
    throw error;
  }
}

// Stratégie Network First (pour API)
async function networkFirst(request, cacheName, timeout = 5000) {
  try {
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    );

    const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Network First fallback to cache:', error.message);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback ultime pour les pages
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline');
    }
    
    throw error;
  }
}

// Stratégie Stale While Revalidate (pour pages)
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse || caches.match('/offline.html'));

  return cachedResponse || fetchPromise;
}

// Background Sync pour synchronisation hors ligne
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);
  
  switch (event.tag) {
    case 'sync-workouts':
      event.waitUntil(syncWorkouts());
      break;
    case 'sync-user-data':
      event.waitUntil(syncUserData());
      break;
    case 'sync-ai-cache':
      event.waitUntil(syncAICache());
      break;
    default:
      console.warn('Unknown sync tag:', event.tag);
  }
});

// Synchronisation des entraînements
async function syncWorkouts() {
  try {
    const cache = await caches.open('pending-sync');
    const requests = await cache.keys();
    const workoutRequests = requests.filter(req => req.url.includes('/api/workouts'));
    
    for (const request of workoutRequests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.warn('Sync workout failed:', error);
      }
    }
  } catch (error) {
    console.error('Background sync workouts failed:', error);
  }
}

// Synchronisation des données utilisateur
async function syncUserData() {
  try {
    const cache = await caches.open('pending-sync');
    const requests = await cache.keys();
    const userRequests = requests.filter(req => req.url.includes('/api/user'));
    
    for (const request of userRequests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.warn('Sync user data failed:', error);
      }
    }
  } catch (error) {
    console.error('Background sync user data failed:', error);
  }
}

// Synchronisation du cache IA
async function syncAICache() {
  try {
    // Nettoyer le cache IA obsolète
    const cache = await caches.open(CACHE_NAMES.api);
    const requests = await cache.keys();
    const now = Date.now();
    
    for (const request of requests) {
      if (request.url.includes('/api/openai') || request.url.includes('/ai/')) {
        const response = await cache.match(request);
        if (response) {
          const cacheDate = response.headers.get('date');
          if (cacheDate && now - new Date(cacheDate).getTime() > 30 * 60 * 1000) {
            await cache.delete(request);
          }
        }
      }
    }
  } catch (error) {
    console.error('Background sync AI cache failed:', error);
  }
}

// Gestion des notifications push optimisée
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  let notificationData = { title: 'Ici Ca Pousse', body: "N'oubliez pas votre entraînement ! 💪" };
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.warn('Failed to parse push data:', e);
    }
  }

  const options = {
    body: notificationData.body,
    icon: '/manifest-icon-192.png',
    badge: '/manifest-icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.id || 1,
      url: notificationData.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: "Ouvrir l'app",
        icon: '/manifest-icon-192.png',
      },
      {
        action: 'dismiss',
        title: 'Ignorer'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Gestion optimisée des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une instance de l'app est déjà ouverte, la focuser
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Sinon, ouvrir une nouvelle instance
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Gestion des messages depuis l'application principale
self.addEventListener('message', (event) => {
  console.log('📨 Message reçu:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_STATS':
        getCacheStats().then(stats => {
          event.ports[0].postMessage({ type: 'CACHE_STATS_RESPONSE', data: stats });
        });
        break;
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
        });
        break;
      default:
        console.warn('Type de message non reconnu:', event.data.type);
    }
  }
});

// Utilitaires pour les statistiques de cache
async function getCacheStats() {
  const cacheNames = Object.values(CACHE_NAMES);
  const stats = {};
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats[cacheName] = {
        count: keys.length,
        size: await calculateCacheSize(cache, keys)
      };
    } catch (error) {
      stats[cacheName] = { count: 0, size: 0 };
    }
  }
  
  return stats;
}

async function calculateCacheSize(cache, keys) {
  let totalSize = 0;
  
  for (const request of keys.slice(0, 10)) { // Limiter pour les performances
    try {
      const response = await cache.match(request);
      if (response && response.headers.get('content-length')) {
        totalSize += parseInt(response.headers.get('content-length'), 10);
      }
    } catch (error) {
      // Ignorer les erreurs individuelles
    }
  }
  
  return totalSize;
}

async function clearAllCaches() {
  const cacheNames = Object.values(CACHE_NAMES);
  return Promise.all(cacheNames.map(name => caches.delete(name)));
}

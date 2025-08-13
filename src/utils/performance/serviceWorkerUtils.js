// Utilitaires pour communiquer avec le Service Worker
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.controller = null;
    this.isSupported = 'serviceWorker' in navigator;
    this.messageQueue = [];
    
    if (this.isSupported) {
      this.initialize();
    }
  }

  async initialize() {
    try {
      this.registration = await navigator.serviceWorker.ready;
      this.controller = navigator.serviceWorker.controller;
      
      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));
      
      // Écouter les changements de contrôleur
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.controller = navigator.serviceWorker.controller;
        // Service Worker: Nouveau contrôleur
        
        // Traiter les messages en file d'attente
        this.processMessageQueue();
      });
      
      // Service Worker Manager initialisé
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du Service Worker Manager:', error);
    }
  }

  handleMessage(event) {
    const { data } = event;
    
    if (data && data.type) {
      switch (data.type) {
        case 'CACHE_STATS_RESPONSE':
          this.dispatchEvent('cacheStats', data.data);
          break;
        case 'CACHE_CLEARED':
          this.dispatchEvent('cacheCleared');
          break;
        case 'SYNC_COMPLETE':
          this.dispatchEvent('syncComplete', data.tag);
          break;
        case 'PERFORMANCE_DATA':
          this.dispatchEvent('performanceData', data.data);
          break;
        default:
          // Message SW non géré: ${data}
      }
    }
  }

  // Système d'événements simple
  dispatchEvent(eventName, data = null) {
    const event = new CustomEvent(`sw:${eventName}`, { detail: data });
    window.dispatchEvent(event);
  }

  // Envoyer un message au service worker
  async sendMessage(message) {
    if (!this.isSupported) {
      console.warn('Service Worker non supporté');
      return false;
    }

    if (!this.controller) {
      // Mettre en file d'attente si pas de contrôleur
      this.messageQueue.push(message);
      return false;
    }

    try {
      if (message.requiresResponse) {
        return await this.sendMessageWithResponse(message);
      } else {
        this.controller.postMessage(message);
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message au SW:', error);
      return false;
    }
  }

  // Envoyer un message avec attente de réponse
  sendMessageWithResponse(message) {
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout: Pas de réponse du Service Worker'));
      }, 5000);
      
      channel.port1.onmessage = (event) => {
        clearTimeout(timeoutId);
        resolve(event.data);
      };
      
      this.controller.postMessage(message, [channel.port2]);
    });
  }

  // Traiter les messages en file d'attente
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  // Obtenir les statistiques de cache
  async getCacheStats() {
    return await this.sendMessage({
      type: 'CACHE_STATS',
      requiresResponse: true
    });
  }

  // Vider tous les caches
  async clearCache() {
    return await this.sendMessage({
      type: 'CLEAR_CACHE'
    });
  }

  // Forcer la mise à jour du service worker
  async skipWaiting() {
    return await this.sendMessage({
      type: 'SKIP_WAITING'
    });
  }

  // Enregistrer une synchronisation en arrière-plan
  async registerBackgroundSync(tag, data = null) {
    if (!this.registration || !this.registration.sync) {
      console.warn('Background Sync non supporté');
      return false;
    }

    try {
      await this.registration.sync.register(tag);
      
      // Optionnellement stocker des données pour la sync
      if (data) {
        localStorage.setItem(`sync_data_${tag}`, JSON.stringify(data));
      }
      
      // Background Sync enregistré: ${tag}
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la sync:', error);
      return false;
    }
  }

  // Précharger des URLs dans le cache
  async preloadUrls(urls, cacheName = 'pages') {
    return await this.sendMessage({
      type: 'PRELOAD_URLS',
      urls,
      cacheName
    });
  }

  // Obtenir l'état de la connexion
  getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false
    };
  }

  // Notifier le SW des changements de page
  notifyPageChange(page) {
    this.sendMessage({
      type: 'PAGE_CHANGE',
      page,
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  // Notifier les métriques de performance
  notifyPerformanceMetrics(metrics) {
    this.sendMessage({
      type: 'PERFORMANCE_METRICS',
      metrics,
      timestamp: Date.now(),
      url: window.location.href
    });
  }
}

// Instance singleton
const swManager = new ServiceWorkerManager();


// Utilitaires pour la synchronisation hors ligne
export const OfflineSync = {
  // Mettre une requête en file d'attente pour sync
  queueRequest: async (url, options = {}) => {
    const request = {
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body || null,
      timestamp: Date.now(),
      id: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };

    // Stocker en localStorage
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    queue.push(request);
    localStorage.setItem('offline_queue', JSON.stringify(queue));

    // Enregistrer la sync
    return await swManager.registerBackgroundSync('sync-offline-queue', request);
  },

  // Obtenir les requêtes en attente
  getPendingRequests: () => {
    return JSON.parse(localStorage.getItem('offline_queue') || '[]');
  },

  // Vider la file d'attente
  clearQueue: () => {
    localStorage.removeItem('offline_queue');
  }
};

// Utilitaires de cache préventif
export const CacheUtils = {
  // Précharger les pages importantes
  preloadCriticalPages: async () => {
    const criticalPages = ['/', '/workout', '/profile'];
    return await swManager.preloadUrls(criticalPages);
  },

  // Précharger selon la navigation
  preloadForNavigation: async (nextRoute) => {
    const routeAssets = {
      '/workout': ['/api/exercises', '/static/js/workout-chunk.js'],
      '/profile': ['/api/user/profile', '/static/js/profile-chunk.js'],
      '/leaderboard': ['/api/leaderboard', '/static/js/leaderboard-chunk.js']
    };

    const assets = routeAssets[nextRoute] || [];
    if (assets.length > 0) {
      return await swManager.preloadUrls(assets);
    }
  },

  // Nettoyer les caches obsolètes
  cleanupOldCaches: async () => {
    return await swManager.clearCache();
  }
};

// Auto-initialisation des optimisations
if (typeof window !== 'undefined') {
  // Précharger les pages critiques après le chargement
  window.addEventListener('load', () => {
    setTimeout(() => {
      CacheUtils.preloadCriticalPages();
    }, 2000);
  });

  // Notifier les changements de route (pour les SPA)
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      swManager.notifyPageChange(currentPath);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

export default swManager;
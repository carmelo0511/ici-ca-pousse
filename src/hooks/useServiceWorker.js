import { useState, useEffect } from 'react';

// Hook React pour utiliser le service worker
export const useServiceWorker = () => {
  const [cacheStats, setCacheStats] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({});

  useEffect(() => {
    // Écouter les événements du service worker
    const handleCacheStats = (event) => setCacheStats(event.detail);
    const handleSyncComplete = (event) => {
      setSyncStatus(prev => ({ ...prev, [event.detail]: 'completed' }));
    };

    window.addEventListener('sw:cacheStats', handleCacheStats);
    window.addEventListener('sw:syncComplete', handleSyncComplete);

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('sw:cacheStats', handleCacheStats);
      window.removeEventListener('sw:syncComplete', handleSyncComplete);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fonctions utilitaires pour interagir avec le service worker
  const clearCache = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      return true;
    }
    return false;
  };

  const getCacheStats = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve) => {
        const channel = new MessageChannel();
        
        channel.port1.onmessage = (event) => {
          resolve(event.data?.data || null);
        };
        
        const timeoutId = setTimeout(() => {
          resolve(null);
        }, 2000);
        
        channel.port1.onmessage = (event) => {
          clearTimeout(timeoutId);
          resolve(event.data?.data || null);
        };
        
        navigator.serviceWorker.controller.postMessage({ type: 'CACHE_STATS' }, [channel.port2]);
      });
    }
    return null;
  };

  const registerSync = async (tag, data = null) => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker non supporté');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (!registration.sync) {
        console.warn('Background Sync non supporté');
        return false;
      }

      await registration.sync.register(tag);
      
      // Optionnellement stocker des données pour la sync
      if (data) {
        localStorage.setItem(`sync_data_${tag}`, JSON.stringify(data));
      }
      
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la sync:', error);
      return false;
    }
  };

  const preloadUrls = async (urls) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PRELOAD_URLS',
        urls,
        cacheName: 'pages'
      });
      return true;
    }
    return false;
  };

  const getConnectionInfo = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      saveData: connection?.saveData || false
    };
  };

  return {
    cacheStats,
    isOnline,
    syncStatus,
    clearCache,
    getCacheStats,
    registerSync,
    preloadUrls,
    connectionInfo: getConnectionInfo()
  };
};

export default useServiceWorker;
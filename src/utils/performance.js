// Utilitaires pour optimiser les performances

// Debounce function pour éviter les appels trop fréquents
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function pour limiter la fréquence des appels
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Cache simple pour les calculs coûteux
export class SimpleCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item) {
      // Mettre à jour l'ordre d'accès
      this.cache.delete(key);
      this.cache.set(key, item);
      return item.value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Supprimer le premier élément (LRU)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Optimisation des images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Optimisation des listes avec virtualisation
export const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Optimisation des calculs avec memoization
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Optimisation des événements avec passive listeners
export const addPassiveEventListener = (element, event, handler) => {
  element.addEventListener(event, handler, { passive: true });
};

// Optimisation des animations avec requestAnimationFrame
export const smoothScroll = (target, duration = 300) => {
  const start = window.pageYOffset;
  const distance = target - start;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, start, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
};

// Optimisation des performances avec Intersection Observer
export const createIntersectionObserver = (callback, options = {}) => {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  });
};

// Optimisation des performances avec Resize Observer
export const createResizeObserver = (callback) => {
  return new ResizeObserver(debounce(callback, 100));
};

// Optimisation des performances avec Mutation Observer
export const createMutationObserver = (callback) => {
  return new MutationObserver(debounce(callback, 100));
};

// Optimisation des performances avec Performance API
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Optimisation des performances avec Web Workers (si disponible)
export const createWorker = (workerFunction) => {
  if (typeof Worker !== 'undefined') {
    const blob = new Blob([`(${workerFunction.toString()})()`], {
      type: 'application/javascript'
    });
    return new Worker(URL.createObjectURL(blob));
  }
  return null;
};

// Optimisation des performances avec Service Worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Optimisation des performances avec IndexedDB
export const openIndexedDB = (dbName, version = 1) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Créer les object stores ici si nécessaire
    };
  });
};

// Optimisation des performances avec localStorage
export const batchLocalStorage = (() => {
  let batch = new Map();
  let timeout = null;

  const flush = () => {
    batch.forEach((value, key) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    });
    batch.clear();
    timeout = null;
  };

  return {
    setItem: (key, value) => {
      batch.set(key, value);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(flush, 100);
    },
    getItem: (key) => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    },
    flush
  };
})();

// Optimisation des performances avec compression
export const compressData = async (data) => {
  if (typeof CompressionStream !== 'undefined') {
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    const reader = cs.readable.getReader();
    
    const encoder = new TextEncoder();
    const encoded = encoder.encode(JSON.stringify(data));
    
    writer.write(encoded);
    writer.close();
    
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    return new Blob(chunks);
  }
  return data;
};

// Optimisation des performances avec décompression
export const decompressData = async (compressedData) => {
  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();
    
    writer.write(compressedData);
    writer.close();
    
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const decoder = new TextDecoder();
    const decompressed = decoder.decode(new Uint8Array(chunks.flat()));
    return JSON.parse(decompressed);
  }
  return compressedData;
}; 
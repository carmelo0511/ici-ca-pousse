// Service d'optimisation du rendu React
class ReactOptimizationService {
  constructor() {
    this.memoCache = new Map();
    this.lazyComponents = new Map();
    this.virtualizationConfig = {
      itemHeight: 60,
      overscan: 5,
      threshold: 100
    };
    this.performanceMetrics = {
      renderCount: 0,
      memoHits: 0,
      lazyLoads: 0,
      averageRenderTime: 0
    };
  }

  // Memoization avancée avec cache intelligent
  memoize(key, computeFn, dependencies = [], ttl = 5 * 60 * 1000) {
    const cacheKey = this.generateMemoKey(key, dependencies);
    const cached = this.memoCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiry) {
      this.performanceMetrics.memoHits++;
      return cached.value;
    }

    const startTime = performance.now();
    const result = computeFn();
    const renderTime = performance.now() - startTime;
    
    this.memoCache.set(cacheKey, {
      value: result,
      expiry: Date.now() + ttl,
      renderTime,
      dependencies: [...dependencies]
    });

    this.updatePerformanceMetrics(renderTime);
    return result;
  }

  // Génération de clé de memoization
  generateMemoKey(key, dependencies) {
    const depsHash = dependencies.length > 0 
      ? btoa(JSON.stringify(dependencies)).slice(0, 16)
      : 'no-deps';
    return `${key}_${depsHash}`;
  }

  // Lazy loading intelligent des composants
  lazyLoadComponent(componentName, importFn, preload = false) {
    if (this.lazyComponents.has(componentName)) {
      return this.lazyComponents.get(componentName);
    }

    const lazyComponent = {
      component: null,
      loading: false,
      error: null,
      lastAccessed: 0
    };

    const loadComponent = async () => {
      if (lazyComponent.component) {
        return lazyComponent.component;
      }

      if (lazyComponent.loading) {
        // Attendre que le chargement se termine
        return new Promise((resolve, reject) => {
          const checkLoaded = () => {
            if (lazyComponent.component) {
              resolve(lazyComponent.component);
            } else if (lazyComponent.error) {
              reject(lazyComponent.error);
            } else {
              setTimeout(checkLoaded, 50);
            }
          };
          checkLoaded();
        });
      }

      lazyComponent.loading = true;
      lazyComponent.error = null;

      try {
        const startTime = performance.now();
        const module = await importFn();
        const loadTime = performance.now() - startTime;
        
        lazyComponent.component = module.default || module;
        lazyComponent.lastAccessed = Date.now();
        this.performanceMetrics.lazyLoads++;
        
        console.log(`📦 Component ${componentName} loaded in ${Math.round(loadTime)}ms`);
      } catch (error) {
        lazyComponent.error = error;
        console.error(`❌ Failed to load component ${componentName}:`, error);
        throw error;
      } finally {
        lazyComponent.loading = false;
      }

      return lazyComponent.component;
    };

    const componentWrapper = {
      load: loadComponent,
      preload: () => {
        if (preload && !lazyComponent.component && !lazyComponent.loading) {
          loadComponent().catch(() => {
            // Ignorer les erreurs de préchargement
          });
        }
      },
      isLoaded: () => !!lazyComponent.component,
      isLoading: () => lazyComponent.loading,
      getError: () => lazyComponent.error
    };

    this.lazyComponents.set(componentName, componentWrapper);
    return componentWrapper;
  }

  // Virtualisation pour les listes longues
  createVirtualizedList(items, itemHeight = this.virtualizationConfig.itemHeight) {
    const containerHeight = window.innerHeight * 0.8; // 80% de la hauteur de l'écran
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const overscan = this.virtualizationConfig.overscan;
    
    return {
      getVisibleRange: (scrollTop) => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
          startIndex + visibleCount + overscan,
          items.length - 1
        );
        
        return {
          start: Math.max(0, startIndex - overscan),
          end: endIndex,
          visibleCount: endIndex - startIndex + 1
        };
      },
      
      getItemStyle: (index) => ({
        position: 'absolute',
        top: index * itemHeight,
        height: itemHeight,
        width: '100%'
      }),
      
      getContainerStyle: () => ({
        height: items.length * itemHeight,
        position: 'relative'
      }),
      
      getViewportStyle: () => ({
        height: containerHeight,
        overflow: 'auto'
      })
    };
  }

  // Optimisation des images avec lazy loading
  optimizeImage(src, options = {}) {
    const {
      width = 300,
      height = 200,
      quality = 80,
      format = 'webp',
      placeholder = true
    } = options;

    return {
      src,
      srcSet: this.generateSrcSet(src, width, height, quality, format),
      sizes: `(max-width: 768px) 100vw, ${width}px`,
      loading: 'lazy',
      placeholder: placeholder ? this.generatePlaceholder(width, height) : null,
      onLoad: (event) => {
        // Optimisation du chargement d'image
        const img = event.target;
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      },
      onError: (event) => {
        // Fallback en cas d'erreur
        event.target.src = '/images/placeholder.jpg';
      }
    };
  }

  // Génération de srcSet pour les images responsives
  generateSrcSet(src, baseWidth, baseHeight, quality, format) {
    const sizes = [0.5, 1, 1.5, 2]; // Multiplicateurs de taille
    return sizes
      .map(size => {
        const width = Math.round(baseWidth * size);
        const height = Math.round(baseHeight * size);
        return `${src}?w=${width}&h=${height}&q=${quality}&fmt=${format} ${size}x`;
      })
      .join(', ');
  }

  // Génération de placeholder pour les images
  generatePlaceholder(width, height) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3ELoading...%3C/text%3E%3C/svg%3E`;
  }

  // Optimisation des événements avec debouncing
  debounceEvent(handler, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handler(...args), delay);
    };
  }

  // Optimisation des événements avec throttling
  throttleEvent(handler, delay = 100) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        handler(...args);
      }
    };
  }

  // Optimisation des animations avec requestAnimationFrame
  animateWithRAF(animationFn, duration = 300) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        animationFn(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  // Optimisation des calculs coûteux avec Web Workers
  runInWorker(workerFn, data) {
    return new Promise((resolve, reject) => {
      const workerCode = `
        self.onmessage = function(e) {
          try {
            const result = (${workerFn.toString()})(e.data);
            self.postMessage({ success: true, result });
          } catch (error) {
            self.postMessage({ success: false, error: error.message });
          }
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      worker.onmessage = (e) => {
        if (e.data.success) {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
        worker.terminate();
        URL.revokeObjectURL(blob);
      };
      
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
        URL.revokeObjectURL(blob);
      };
      
      worker.postMessage(data);
    });
  }

  // Optimisation des listes avec intersection observer
  createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target, entry);
        }
      });
    }, { ...defaultOptions, ...options });
    
    return observer;
  }

  // Mise à jour des métriques de performance
  updatePerformanceMetrics(renderTime) {
    this.performanceMetrics.renderCount++;
    const currentAvg = this.performanceMetrics.averageRenderTime;
    const totalRenders = this.performanceMetrics.renderCount;
    this.performanceMetrics.averageRenderTime = 
      (currentAvg * (totalRenders - 1) + renderTime) / totalRenders;
  }

  // Obtenir les métriques de performance
  getPerformanceMetrics() {
    const memoHitRate = this.performanceMetrics.renderCount > 0 
      ? (this.performanceMetrics.memoHits / this.performanceMetrics.renderCount) * 100 
      : 0;

    return {
      ...this.performanceMetrics,
      memoHitRate: Math.round(memoHitRate * 100) / 100,
      averageRenderTime: Math.round(this.performanceMetrics.averageRenderTime * 100) / 100,
      cacheSize: this.memoCache.size,
      lazyComponentsCount: this.lazyComponents.size
    };
  }

  // Nettoyage du cache de memoization
  clearMemoCache() {
    this.memoCache.clear();
  }

  // Nettoyage des composants lazy chargés
  clearLazyComponents() {
    this.lazyComponents.clear();
  }

  // Nettoyage complet
  cleanup() {
    this.clearMemoCache();
    this.clearLazyComponents();
    this.performanceMetrics = {
      renderCount: 0,
      memoHits: 0,
      lazyLoads: 0,
      averageRenderTime: 0
    };
  }
}

// Instance singleton
const reactOptimizationService = new ReactOptimizationService();

export default reactOptimizationService; 
// Service de cache intelligent optimisé pour le chatbot
class OptimizedIntelligentCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 30 * 60 * 1000; // 30 minutes
    this.maxSize = 200; // Augmenté pour plus de cache
    this.cleanupInterval = null;
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastCleanup: Date.now()
    };
    
    this.loadFromStorage();
    this.startAutoCleanup();
  }

  // Génération de clé optimisée avec hash plus rapide
  generateKey(content, context, height, weight, goal) {
    // Utiliser un hash simple et rapide au lieu de btoa
    const keyData = `${content}|${context}|${height}|${weight}|${goal}`;
    return this.simpleHash(keyData);
  }

  // Hash simple et rapide
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Get optimisé avec cache des clés fréquentes
  get(key) {
    this.stats.totalRequests++;
    
    const item = this.cache.get(key);
    if (!item) {
      this.stats.cacheMisses++;
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.cacheMisses++;
      return null;
    }

    // Mettre à jour les statistiques
    item.hits = (item.hits || 0) + 1;
    item.lastAccessed = Date.now();
    this.stats.cacheHits++;

    return item.response;
  }

  // Set optimisé avec compression des données
  set(key, response, ttl = this.defaultTTL) {
    // Nettoyer le cache si nécessaire (seulement si vraiment nécessaire)
    if (this.cache.size >= this.maxSize * 1.2) {
      this.cleanup();
    }

    // Compresser la réponse si elle est longue
    const compressedResponse = this.compressResponse(response);

    const item = {
      response: compressedResponse,
      originalSize: typeof response === 'string' ? response.length : 0,
      compressedSize: typeof compressedResponse === 'string' ? compressedResponse.length : 0,
      expiry: Date.now() + ttl,
      created: Date.now(),
      hits: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, item);
    
    // Sauvegarder de manière asynchrone pour ne pas bloquer
    this.debouncedSave();
  }

  // Compression simple des réponses longues
  compressResponse(response) {
    if (typeof response !== 'string' || response.length < 1000) {
      return response;
    }
    
    // Compression simple : supprimer les espaces multiples et les retours à la ligne
    return response
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  // Cleanup optimisé avec algorithme LRU amélioré
  cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Supprimer les éléments expirés
    let expiredCount = 0;
    entries.forEach(([key, item]) => {
      if (now > item.expiry) {
        this.cache.delete(key);
        expiredCount++;
      }
    });

    // Si encore trop d'éléments, utiliser un algorithme LRU amélioré
    if (this.cache.size >= this.maxSize) {
      const validEntries = entries.filter(([_, item]) => now <= item.expiry);
      
      // Calculer un score basé sur l'utilisation récente et la fréquence
      const scoredEntries = validEntries.map(([key, item]) => {
        const timeSinceLastAccess = now - item.lastAccessed;
        const frequency = item.hits / Math.max(1, (now - item.created) / (1000 * 60)); // hits par minute
        const score = frequency / Math.max(1, timeSinceLastAccess / (1000 * 60));
        return { key, score, item };
      });

      // Trier par score et supprimer les moins utiles
      scoredEntries.sort((a, b) => a.score - b.score);
      const toRemove = scoredEntries.slice(0, Math.floor(this.maxSize * 0.3));
      
      toRemove.forEach(({ key }) => this.cache.delete(key));
    }

    this.stats.lastCleanup = now;
    console.log(`🧹 Cache cleanup: ${expiredCount} expired, ${this.cache.size} remaining`);
  }

  // Auto-cleanup périodique
  startAutoCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  // Sauvegarde debounced pour éviter les écritures fréquentes
  debouncedSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, 2000); // Sauvegarder après 2 secondes d'inactivité
  }

  // Statistiques détaillées
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    const validEntries = entries.filter(([_, item]) => now <= item.expiry);
    const totalHits = validEntries.reduce((sum, [_, item]) => sum + (item.hits || 0), 0);
    const totalSize = validEntries.reduce((sum, [_, item]) => sum + (item.compressedSize || 0), 0);
    
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0;

    return {
      size: validEntries.length,
      maxSize: this.maxSize,
      totalHits,
      averageHits: validEntries.length > 0 ? totalHits / validEntries.length : 0,
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests: this.stats.totalRequests,
      cacheHits: this.stats.cacheHits,
      cacheMisses: this.stats.cacheMisses,
      totalSize: Math.round(totalSize / 1024 * 100) / 100, // KB
      compressionRatio: this.calculateCompressionRatio(),
      lastCleanup: this.stats.lastCleanup
    };
  }

  // Calcul du ratio de compression
  calculateCompressionRatio() {
    const entries = Array.from(this.cache.entries());
    let totalOriginal = 0;
    let totalCompressed = 0;
    
    entries.forEach(([_, item]) => {
      totalOriginal += item.originalSize || 0;
      totalCompressed += item.compressedSize || 0;
    });
    
    if (totalOriginal === 0) return 1;
    return Math.round((totalCompressed / totalOriginal) * 100) / 100;
  }

  // Préchargement intelligent
  preload(keys) {
    const now = Date.now();
    const validKeys = keys.filter(key => {
      const item = this.cache.get(key);
      return item && now <= item.expiry;
    });
    
    return validKeys.length;
  }

  // Warmup du cache avec des données fréquentes
  warmup(frequentQueries) {
    console.log('🔥 Warming up cache with frequent queries...');
    let warmedCount = 0;
    
    frequentQueries.forEach(query => {
      const key = this.generateKey(query.content, query.context, query.height, query.weight, query.goal);
      if (!this.cache.has(key)) {
        this.set(key, query.response, query.ttl || this.defaultTTL);
        warmedCount++;
      }
    });
    
    console.log(`🔥 Cache warmed up with ${warmedCount} queries`);
    return warmedCount;
  }

  clear() {
    this.cache.clear();
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      lastCleanup: Date.now()
    };
    this.saveToStorage();
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
  }

  saveToStorage() {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: Date.now()
      };
      localStorage.setItem('optimized_intelligent_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache optimisé:', error);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('optimized_intelligent_cache');
      if (data) {
        const parsed = JSON.parse(data);
        const cacheAge = Date.now() - parsed.timestamp;
        
        // Ne charger que si le cache n'est pas trop vieux (12h)
        if (cacheAge < 12 * 60 * 60 * 1000) {
          this.cache = new Map(parsed.cache);
          this.stats = parsed.stats || this.stats;
          this.cleanup(); // Nettoyer les éléments expirés
          console.log('💾 Cache optimisé chargé:', this.cache.size, 'éléments');
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du cache optimisé:', error);
      this.cache = new Map();
    }
  }
}

// Instance singleton
const optimizedIntelligentCache = new OptimizedIntelligentCache();

export default optimizedIntelligentCache; 
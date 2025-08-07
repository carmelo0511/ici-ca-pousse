// Service de cache hybride optimisé pour le chatbot
class IntelligentCache {
  constructor() {
    // Cache en mémoire pour les accès ultra-rapides
    this.memoryCache = new Map();
    this.maxMemorySize = 50; // Cache mémoire plus petit mais plus rapide
    
    // Cache localStorage pour persistance
    this.persistentCache = new Map();
    this.maxPersistentSize = 200; // Cache persistant plus grand
    
    // TTL adaptatif selon le type de contenu
    this.ttlConfig = {
      simple: 5 * 60 * 1000,     // 5 min pour réponses simples
      complex: 30 * 60 * 1000,   // 30 min pour réponses complexes
      frequent: 2 * 60 * 60 * 1000 // 2h pour réponses fréquentes
    };
    
    this.loadFromStorage();
  }

  generateKey(content, context, height, weight, goal) {
    const keyData = { content, context, height, weight, goal };
    return btoa(JSON.stringify(keyData)).slice(0, 50);
  }

  // Détermine le type de cache selon le contenu
  getCacheType(content) {
    if (!content) return 'simple';
    
    const simpleKeywords = ['bonjour', 'salut', 'hello', 'merci', 'ok'];
    const complexKeywords = ['programme', 'plan', 'entraînement', 'analyse'];
    
    const lowerContent = content.toLowerCase();
    
    if (simpleKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'frequent';
    } else if (complexKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'complex';
    } else {
      return 'simple';
    }
  }

  get(key) {
    // Vérifier d'abord le cache mémoire (plus rapide)
    let item = this.memoryCache.get(key);
    let fromMemory = true;
    
    if (!item) {
      // Si pas trouvé, vérifier le cache persistant
      item = this.persistentCache.get(key);
      fromMemory = false;
    }

    if (!item) return null;

    if (Date.now() > item.expiry) {
      // Nettoyer les deux caches
      this.memoryCache.delete(key);
      this.persistentCache.delete(key);
      return null;
    }

    // Mettre à jour les statistiques
    item.hits = (item.hits || 0) + 1;
    item.lastAccessed = Date.now();

    // Promouvoir vers le cache mémoire si ce n'était pas déjà le cas
    if (!fromMemory && this.memoryCache.size < this.maxMemorySize) {
      this.memoryCache.set(key, item);
    }

    return item.response;
  }

  set(key, response, content = '', ttl = null) {
    // Déterminer le TTL selon le type de contenu
    const cacheType = this.getCacheType(content);
    const adaptiveTTL = ttl || this.ttlConfig[cacheType];

    const item = {
      response,
      expiry: Date.now() + adaptiveTTL,
      created: Date.now(),
      hits: 0,
      lastAccessed: Date.now(),
      type: cacheType
    };

    // Nettoyer les caches si nécessaire
    if (this.memoryCache.size >= this.maxMemorySize) {
      this.cleanupMemoryCache();
    }
    if (this.persistentCache.size >= this.maxPersistentSize) {
      this.cleanupPersistentCache();
    }

    // Toujours stocker dans le cache persistant
    this.persistentCache.set(key, item);

    // Stocker dans le cache mémoire selon la priorité
    if (cacheType === 'frequent' || this.memoryCache.size < this.maxMemorySize) {
      this.memoryCache.set(key, item);
    }

    this.saveToStorage();
  }

  cleanupMemoryCache() {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries());
    
    // Supprimer les éléments expirés du cache mémoire
    entries.forEach(([key, item]) => {
      if (now > item.expiry) {
        this.memoryCache.delete(key);
      }
    });

    // Si encore trop d'éléments, supprimer les moins utilisés
    if (this.memoryCache.size >= this.maxMemorySize) {
      const sortedEntries = entries
        .filter(([_, item]) => now <= item.expiry)
        .sort((a, b) => {
          // Prioriser par type puis par hits
          if (a[1].type === 'frequent' && b[1].type !== 'frequent') return 1;
          if (b[1].type === 'frequent' && a[1].type !== 'frequent') return -1;
          return a[1].hits - b[1].hits;
        });
      
      const toRemove = sortedEntries.slice(0, Math.floor(this.maxMemorySize / 3));
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  cleanupPersistentCache() {
    const now = Date.now();
    const entries = Array.from(this.persistentCache.entries());
    
    // Supprimer les éléments expirés
    entries.forEach(([key, item]) => {
      if (now > item.expiry) {
        this.persistentCache.delete(key);
      }
    });

    // Si encore trop d'éléments, supprimer les moins utilisés
    if (this.persistentCache.size >= this.maxPersistentSize) {
      const sortedEntries = entries
        .filter(([_, item]) => now <= item.expiry)
        .sort((a, b) => a[1].hits - b[1].hits);
      
      const toRemove = sortedEntries.slice(0, Math.floor(this.maxPersistentSize / 3));
      toRemove.forEach(([key]) => this.persistentCache.delete(key));
    }
  }

  getStats() {
    const now = Date.now();
    
    // Stats cache mémoire
    const memoryEntries = Array.from(this.memoryCache.entries());
    const validMemoryEntries = memoryEntries.filter(([_, item]) => now <= item.expiry);
    const memoryHits = validMemoryEntries.reduce((sum, [_, item]) => sum + (item.hits || 0), 0);
    
    // Stats cache persistant
    const persistentEntries = Array.from(this.persistentCache.entries());
    const validPersistentEntries = persistentEntries.filter(([_, item]) => now <= item.expiry);
    const persistentHits = validPersistentEntries.reduce((sum, [_, item]) => sum + (item.hits || 0), 0);
    
    return {
      memory: {
        size: validMemoryEntries.length,
        maxSize: this.maxMemorySize,
        hits: memoryHits,
        averageHits: validMemoryEntries.length > 0 ? memoryHits / validMemoryEntries.length : 0
      },
      persistent: {
        size: validPersistentEntries.length,
        maxSize: this.maxPersistentSize,
        hits: persistentHits,
        averageHits: validPersistentEntries.length > 0 ? persistentHits / validPersistentEntries.length : 0
      },
      total: {
        size: validPersistentEntries.length,
        totalHits: persistentHits,
        hitRate: this.calculateHitRate()
      }
    };
  }

  calculateHitRate() {
    // Calculer le taux de réussite basé sur les accès récents du cache persistant
    const recentEntries = Array.from(this.persistentCache.entries())
      .filter(([_, item]) => Date.now() - item.lastAccessed < 24 * 60 * 60 * 1000);
    
    if (recentEntries.length === 0) return 0;
    
    const totalHits = recentEntries.reduce((sum, [_, item]) => sum + (item.hits || 0), 0);
    return Math.min((totalHits / recentEntries.length) * 10, 100); // Normaliser sur 100
  }

  clear() {
    this.memoryCache.clear();
    this.persistentCache.clear();
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      const data = {
        persistentCache: Array.from(this.persistentCache.entries()),
        timestamp: Date.now()
      };
      localStorage.setItem('intelligent_cache_hybrid', JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache:', error);
    }
  }

  loadFromStorage() {
    try {
      // Charger le nouveau format hybride
      const hybridData = localStorage.getItem('intelligent_cache_hybrid');
      if (hybridData) {
        const parsed = JSON.parse(hybridData);
        const cacheAge = Date.now() - parsed.timestamp;
        
        // Ne charger que si le cache n'est pas trop vieux (24h)
        if (cacheAge < 24 * 60 * 60 * 1000) {
          this.persistentCache = new Map(parsed.persistentCache);
          this.cleanupPersistentCache(); // Nettoyer les éléments expirés
          
          // Promouvoir les éléments fréquents vers le cache mémoire
          this.promoteFrequentItems();
          return;
        }
      }
      
      // Fallback: migrer l'ancien format si présent
      const oldData = localStorage.getItem('intelligent_cache');
      if (oldData) {
        const parsed = JSON.parse(oldData);
        const cacheAge = Date.now() - parsed.timestamp;
        
        if (cacheAge < 24 * 60 * 60 * 1000) {
          // Migrer vers le nouveau format
          this.persistentCache = new Map(parsed.cache);
          this.cleanupPersistentCache();
          this.promoteFrequentItems();
          
          // Supprimer l'ancien cache
          localStorage.removeItem('intelligent_cache');
          this.saveToStorage();
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du cache:', error);
      this.memoryCache = new Map();
      this.persistentCache = new Map();
    }
  }

  // Promouvoir les éléments fréquents vers le cache mémoire
  promoteFrequentItems() {
    const entries = Array.from(this.persistentCache.entries());
    const frequentItems = entries
      .filter(([_, item]) => item.type === 'frequent' || item.hits > 2)
      .sort((a, b) => (b[1].hits || 0) - (a[1].hits || 0))
      .slice(0, this.maxMemorySize);
      
    frequentItems.forEach(([key, item]) => {
      this.memoryCache.set(key, item);
    });
  }
}

// Instance singleton
const intelligentCache = new IntelligentCache();

export default intelligentCache; 
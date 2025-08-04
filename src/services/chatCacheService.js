// Service de cache intelligent pour le chatbot
class IntelligentCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 30 * 60 * 1000; // 30 minutes
    this.maxSize = 100;
    this.loadFromStorage();
  }

  generateKey(content, context, height, weight, goal) {
    const keyData = { content, context, height, weight, goal };
    return btoa(JSON.stringify(keyData)).slice(0, 50);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Mettre à jour les statistiques
    item.hits = (item.hits || 0) + 1;
    item.lastAccessed = Date.now();

    return item.response;
  }

  set(key, response, ttl = this.defaultTTL) {
    // Nettoyer le cache si nécessaire
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    const item = {
      response,
      expiry: Date.now() + ttl,
      created: Date.now(),
      hits: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, item);
    this.saveToStorage();
  }

  cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Supprimer les éléments expirés
    entries.forEach(([key, item]) => {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    });

    // Si encore trop d'éléments, supprimer les moins utilisés
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([_, item]) => now <= item.expiry)
        .sort((a, b) => a[1].hits - b[1].hits);
      
      const toRemove = sortedEntries.slice(0, Math.floor(this.maxSize / 2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    const validEntries = entries.filter(([_, item]) => now <= item.expiry);
    const totalHits = validEntries.reduce((sum, [_, item]) => sum + (item.hits || 0), 0);
    
    return {
      size: validEntries.length,
      maxSize: this.maxSize,
      totalHits,
      averageHits: validEntries.length > 0 ? totalHits / validEntries.length : 0,
      hitRate: this.calculateHitRate()
    };
  }

  calculateHitRate() {
    // Calculer le taux de réussite basé sur les accès récents
    const recentEntries = Array.from(this.cache.entries())
      .filter(([_, item]) => Date.now() - item.lastAccessed < 24 * 60 * 60 * 1000);
    
    if (recentEntries.length === 0) return 0;
    
    const totalHits = recentEntries.reduce((sum, [_, item]) => sum + (item.hits || 0), 0);
    return totalHits / recentEntries.length;
  }

  clear() {
    this.cache.clear();
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        timestamp: Date.now()
      };
      localStorage.setItem('intelligent_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache:', error);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('intelligent_cache');
      if (data) {
        const parsed = JSON.parse(data);
        const cacheAge = Date.now() - parsed.timestamp;
        
        // Ne charger que si le cache n'est pas trop vieux (24h)
        if (cacheAge < 24 * 60 * 60 * 1000) {
          this.cache = new Map(parsed.cache);
          this.cleanup(); // Nettoyer les éléments expirés
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du cache:', error);
      this.cache = new Map();
    }
  }
}

// Instance singleton
const intelligentCache = new IntelligentCache();

export default intelligentCache; 
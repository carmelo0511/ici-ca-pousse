// Service d'optimisation des appels API
class APIOptimizationService {
  constructor() {
    this.requestQueue = new Map();
    this.batchQueue = [];
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cachedRequests: 0,
      averageResponseTime: 0
    };
  }

  // Debouncing des requêtes similaires
  debounceRequest(key, requestFn, delay = 300) {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    let timeoutId;
    const promise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.requestQueue.delete(key);
        }
      }, delay);
    });

    // Annuler le timeout si la requête est annulée
    promise.cancel = () => {
      clearTimeout(timeoutId);
      this.requestQueue.delete(key);
    };

    this.requestQueue.set(key, promise);
    return promise;
  }

  // Batching des requêtes multiples
  batchRequests(requests, batchSize = 5) {
    const batches = [];
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }

    return batches.map(async (batch) => {
      const promises = batch.map(req => req());
      return Promise.allSettled(promises);
    });
  }

  // Retry logic avec backoff exponentiel
  async retryRequest(requestFn, retries = this.retryConfig.maxRetries) {
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();
        const result = await requestFn();
        const responseTime = Date.now() - startTime;
        
        this.updateStats(true, responseTime);
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === retries) {
          this.updateStats(false);
          throw error;
        }
        
        // Backoff exponentiel
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );
        
        console.warn(`API request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retries + 1})`);
        await this.sleep(delay);
      }
    }
  }

  // Optimisation des requêtes avec cache et préchargement
  async optimizedRequest(requestFn, cacheKey = null, options = {}) {
    const {
      useCache = true,
      cacheTTL = 5 * 60 * 1000, // 5 minutes
      preload = false,
      priority = 'normal'
    } = options;

    // Vérifier le cache si activé
    if (useCache && cacheKey) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.stats.cachedRequests++;
        return cached;
      }
    }

    // Exécuter la requête avec retry
    const result = await this.retryRequest(requestFn);
    
    // Mettre en cache si activé
    if (useCache && cacheKey) {
      this.setInCache(cacheKey, result, cacheTTL);
    }

    // Précharger les données liées si demandé
    if (preload && result.relatedData) {
      this.preloadRelatedData(result.relatedData);
    }

    return result;
  }

  // Préchargement intelligent des données liées
  preloadRelatedData(relatedData) {
    if (!relatedData || !Array.isArray(relatedData)) return;
    
    // Précharger en arrière-plan
    setTimeout(() => {
      relatedData.forEach(data => {
        if (data.url && data.cacheKey) {
          this.optimizedRequest(
            () => fetch(data.url),
            data.cacheKey,
            { useCache: true, priority: 'low' }
          ).catch(() => {
            // Ignorer les erreurs de préchargement
          });
        }
      });
    }, 100);
  }

  // Cache simple en mémoire
  getFromCache(key) {
    const cached = sessionStorage.getItem(`api_cache_${key}`);
    if (!cached) return null;
    
    try {
      const { data, expiry } = JSON.parse(cached);
      if (Date.now() > expiry) {
        sessionStorage.removeItem(`api_cache_${key}`);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  setInCache(key, data, ttl) {
    try {
      const cacheData = {
        data,
        expiry: Date.now() + ttl
      };
      sessionStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erreur lors de la mise en cache:', error);
    }
  }

  // Optimisation des requêtes OpenAI
  async optimizedOpenAIRequest(prompt, options = {}) {
    const {
      model = 'gpt-4o',
      maxTokens = 1000,
      temperature = 0.7,
      useStreaming = false
    } = options;

    const cacheKey = this.generateCacheKey(prompt, options);
    
    return this.optimizedRequest(
      async () => {
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            model,
            maxTokens,
            temperature,
            useStreaming
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        return response.json();
      },
      cacheKey,
      { useCache: true, cacheTTL: 10 * 60 * 1000 } // 10 minutes pour OpenAI
    );
  }

  // Génération de clé de cache optimisée
  generateCacheKey(prompt, options) {
    const keyData = {
      prompt: prompt.substring(0, 100), // Limiter la taille
      model: options.model,
      maxTokens: options.maxTokens,
      temperature: Math.round(options.temperature * 100) / 100
    };
    
    return btoa(JSON.stringify(keyData)).slice(0, 32);
  }

  // Optimisation des requêtes de fonction
  async optimizedFunctionCall(functionName, args, options = {}) {
    const cacheKey = `function_${functionName}_${JSON.stringify(args)}`;
    
    return this.optimizedRequest(
      async () => {
        // Simulation d'appel de fonction
        const startTime = Date.now();
        
        // Ici, vous intégreriez l'appel réel à votre fonction
        const result = await this.callFunction(functionName, args);
        
        const responseTime = Date.now() - startTime;
        console.log(`⚡ Function ${functionName} executed in ${responseTime}ms`);
        
        return result;
      },
      cacheKey,
      { useCache: true, cacheTTL: 30 * 60 * 1000 } // 30 minutes pour les fonctions
    );
  }

  // Simulation d'appel de fonction
  async callFunction(functionName, args) {
    // Simulation d'un délai d'exécution
    await this.sleep(Math.random() * 1000 + 100);
    
    // Retourner un résultat simulé
    return {
      success: true,
      functionName,
      result: `Result for ${functionName} with args: ${JSON.stringify(args)}`,
      timestamp: Date.now()
    };
  }

  // Mise à jour des statistiques
  updateStats(success, responseTime = 0) {
    this.stats.totalRequests++;
    
    if (success) {
      this.stats.successfulRequests++;
      if (responseTime > 0) {
        const currentAvg = this.stats.averageResponseTime;
        const totalRequests = this.stats.successfulRequests;
        this.stats.averageResponseTime = (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
      }
    } else {
      this.stats.failedRequests++;
    }
  }

  // Obtenir les statistiques
  getStats() {
    const successRate = this.stats.totalRequests > 0 
      ? (this.stats.successfulRequests / this.stats.totalRequests) * 100 
      : 0;
    
    const cacheHitRate = this.stats.totalRequests > 0 
      ? (this.stats.cachedRequests / this.stats.totalRequests) * 100 
      : 0;

    return {
      ...this.stats,
      successRate: Math.round(successRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      averageResponseTime: Math.round(this.stats.averageResponseTime)
    };
  }

  // Nettoyage du cache
  clearCache() {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('api_cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Utilitaires
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Annuler toutes les requêtes en cours
  cancelAllRequests() {
    this.requestQueue.forEach(promise => {
      if (promise.cancel) {
        promise.cancel();
      }
    });
    this.requestQueue.clear();
  }
}

// Instance singleton
const apiOptimizationService = new APIOptimizationService();

export default apiOptimizationService; 
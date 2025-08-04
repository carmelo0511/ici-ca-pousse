// Service de rate limiting pour protéger contre les attaques
class RateLimitService {
  constructor() {
    this.limits = {
      // Limites par type d'action
      auth: {
        login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 tentatives en 15 minutes
        register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 tentatives en 1 heure
        passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }
      },
      
      api: {
        chat: { maxAttempts: 50, windowMs: 60 * 1000 }, // 50 messages par minute
        workout: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 requêtes par minute
        profile: { maxAttempts: 30, windowMs: 60 * 1000 }, // 30 requêtes par minute
        upload: { maxAttempts: 10, windowMs: 60 * 1000 } // 10 uploads par minute
      },
      
      // Limites par IP
      ip: {
        general: { maxAttempts: 1000, windowMs: 60 * 1000 }, // 1000 requêtes par minute
        suspicious: { maxAttempts: 100, windowMs: 60 * 1000 } // 100 requêtes par minute si suspect
      }
    };
    
    this.storage = new Map();
    this.blockedIPs = new Set();
    this.suspiciousIPs = new Set();
    
    // Nettoyage périodique
    this.startCleanup();
  }

  // Vérifier si une action est autorisée
  checkLimit(identifier, action, type = 'general') {
    const key = `${identifier}:${action}:${type}`;
    const now = Date.now();
    
    // Vérifier si l'IP est bloquée
    if (this.blockedIPs.has(identifier)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.getResetTime(key),
        reason: 'IP bloquée temporairement'
      };
    }
    
    // Récupérer les tentatives existantes
    const attempts = this.storage.get(key) || [];
    
    // Nettoyer les tentatives expirées
    const validAttempts = attempts.filter(timestamp => 
      now - timestamp < this.getWindowMs(action, type)
    );
    
    // Mettre à jour le stockage
    this.storage.set(key, validAttempts);
    
    // Vérifier la limite
    const limit = this.getLimit(action, type);
    const remaining = Math.max(0, limit - validAttempts.length);
    const allowed = remaining > 0;
    
    // Si autorisé, ajouter la tentative actuelle
    if (allowed) {
      validAttempts.push(now);
      this.storage.set(key, validAttempts);
    }
    
    // Détecter les comportements suspects
    this.detectSuspiciousActivity(identifier, action, validAttempts.length);
    
    return {
      allowed,
      remaining,
      resetTime: this.getResetTime(key),
      reason: allowed ? null : 'Limite dépassée'
    };
  }

  // Enregistrer une tentative
  recordAttempt(identifier, action, type = 'general') {
    const key = `${identifier}:${action}:${type}`;
    const now = Date.now();
    
    const attempts = this.storage.get(key) || [];
    attempts.push(now);
    this.storage.set(key, attempts);
    
    // Nettoyer automatiquement
    this.cleanupKey(key);
  }

  // Obtenir la limite pour une action
  getLimit(action, type) {
    const category = this.limits[type];
    if (!category) {
      return this.limits.ip.general.maxAttempts;
    }
    
    const actionLimit = category[action];
    if (!actionLimit) {
      return this.limits.ip.general.maxAttempts;
    }
    
    return actionLimit.maxAttempts;
  }

  // Obtenir la fenêtre de temps pour une action
  getWindowMs(action, type) {
    const category = this.limits[type];
    if (!category) {
      return this.limits.ip.general.windowMs;
    }
    
    const actionLimit = category[action];
    if (!actionLimit) {
      return this.limits.ip.general.windowMs;
    }
    
    return actionLimit.windowMs;
  }

  // Calculer le temps de réinitialisation
  getResetTime(key) {
    const attempts = this.storage.get(key) || [];
    if (attempts.length === 0) return Date.now();
    
    const oldestAttempt = Math.min(...attempts);
    const [identifier, action, type] = key.split(':');
    const windowMs = this.getWindowMs(action, type);
    
    return oldestAttempt + windowMs;
  }

  // Détecter les activités suspectes
  detectSuspiciousActivity(identifier, action, attemptCount) {
    const limit = this.getLimit(action, 'general');
    const threshold = limit * 0.8; // 80% de la limite
    
    if (attemptCount > threshold) {
      this.suspiciousIPs.add(identifier);
      console.warn(`⚠️ Activité suspecte détectée pour ${identifier}: ${attemptCount} tentatives`);
    }
    
    // Bloquer si trop de tentatives
    if (attemptCount >= limit * 1.5) {
      this.blockIP(identifier, 30 * 60 * 1000); // Bloquer 30 minutes
      console.error(`🚫 IP ${identifier} bloquée pour activité malveillante`);
    }
  }

  // Bloquer une IP
  blockIP(identifier, duration = 15 * 60 * 1000) {
    this.blockedIPs.add(identifier);
    
    setTimeout(() => {
      this.blockedIPs.delete(identifier);
      console.log(`✅ IP ${identifier} débloquée`);
    }, duration);
  }

  // Débloquer une IP manuellement
  unblockIP(identifier) {
    this.blockedIPs.delete(identifier);
    this.suspiciousIPs.delete(identifier);
    console.log(`✅ IP ${identifier} débloquée manuellement`);
  }

  // Nettoyer les clés expirées
  cleanupKey(key) {
    const attempts = this.storage.get(key) || [];
    const now = Date.now();
    const [, action, type] = key.split(':');
    const windowMs = this.getWindowMs(action, type);
    
    const validAttempts = attempts.filter(timestamp => 
      now - timestamp < windowMs
    );
    
    if (validAttempts.length === 0) {
      this.storage.delete(key);
    } else {
      this.storage.set(key, validAttempts);
    }
  }

  // Nettoyage périodique complet
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, attempts] of this.storage.entries()) {
      const [, action, type] = key.split(':');
      const windowMs = this.getWindowMs(action, type);
      
      const validAttempts = attempts.filter(timestamp => 
        now - timestamp < windowMs
      );
      
      if (validAttempts.length === 0) {
        keysToDelete.push(key);
      } else {
        this.storage.set(key, validAttempts);
      }
    }
    
    keysToDelete.forEach(key => this.storage.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Nettoyage: ${keysToDelete.length} clés supprimées`);
    }
  }

  // Démarrer le nettoyage périodique
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  // Middleware pour Express.js
  middleware(action, type = 'general') {
    return (req, res, next) => {
      const identifier = req.ip || req.connection.remoteAddress;
      const result = this.checkLimit(identifier, action, type);
      
      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: result.reason,
          resetTime: result.resetTime,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }
      
      // Ajouter les headers de rate limiting
      res.set({
        'X-RateLimit-Limit': this.getLimit(action, type),
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': result.resetTime
      });
      
      next();
    };
  }

  // Middleware pour les routes d'authentification
  authMiddleware(action) {
    return this.middleware(action, 'auth');
  }

  // Middleware pour les routes API
  apiMiddleware(action) {
    return this.middleware(action, 'api');
  }

  // Obtenir les statistiques
  getStats() {
    const stats = {
      totalKeys: this.storage.size,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      storageSize: 0
    };
    
    // Calculer la taille du stockage
    for (const [key, attempts] of this.storage.entries()) {
      stats.storageSize += key.length + attempts.length * 8; // 8 bytes par timestamp
    }
    
    return stats;
  }

  // Obtenir les détails pour une IP
  getIPDetails(identifier) {
    const details = {
      identifier,
      isBlocked: this.blockedIPs.has(identifier),
      isSuspicious: this.suspiciousIPs.has(identifier),
      activities: {}
    };
    
    // Récupérer toutes les activités pour cette IP
    for (const [key, attempts] of this.storage.entries()) {
      const [ip, action, type] = key.split(':');
      
      if (ip === identifier) {
        details.activities[`${action}:${type}`] = {
          attempts: attempts.length,
          lastAttempt: attempts.length > 0 ? Math.max(...attempts) : null,
          limit: this.getLimit(action, type)
        };
      }
    }
    
    return details;
  }

  // Réinitialiser toutes les limites pour une IP
  resetIP(identifier) {
    const keysToDelete = [];
    
    for (const key of this.storage.keys()) {
      const [ip] = key.split(':');
      if (ip === identifier) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.storage.delete(key));
    this.unblockIP(identifier);
    
    console.log(`🔄 IP ${identifier} réinitialisée: ${keysToDelete.length} clés supprimées`);
  }

  // Exporter les données pour sauvegarde
  exportData() {
    return {
      storage: Array.from(this.storage.entries()),
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousIPs: Array.from(this.suspiciousIPs),
      timestamp: Date.now()
    };
  }

  // Importer les données depuis une sauvegarde
  importData(data) {
    if (data.storage) {
      this.storage = new Map(data.storage);
    }
    
    if (data.blockedIPs) {
      this.blockedIPs = new Set(data.blockedIPs);
    }
    
    if (data.suspiciousIPs) {
      this.suspiciousIPs = new Set(data.suspiciousIPs);
    }
    
    console.log(`📥 Données de rate limiting importées: ${this.storage.size} clés`);
  }
}

// Instance singleton
const rateLimitService = new RateLimitService();

export default rateLimitService; 
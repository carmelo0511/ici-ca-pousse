// Service de logs de sécurité pour tracer les activités suspectes
class SecurityLogService {
  constructor() {
    this.logs = [];
    this.maxLogs = 10000; // Limite de logs en mémoire
    this.severityLevels = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };
    
    this.eventTypes = {
      // Authentification
      AUTH_LOGIN_SUCCESS: 'auth.login.success',
      AUTH_LOGIN_FAILED: 'auth.login.failed',
      AUTH_REGISTER_SUCCESS: 'auth.register.success',
      AUTH_REGISTER_FAILED: 'auth.register.failed',
      AUTH_LOGOUT: 'auth.logout',
      AUTH_PASSWORD_RESET: 'auth.password.reset',
      
      // API
      API_RATE_LIMIT: 'api.rate.limit',
      API_SUSPICIOUS_ACTIVITY: 'api.suspicious.activity',
      API_BLOCKED_IP: 'api.blocked.ip',
      
      // Validation
      VALIDATION_FAILED: 'validation.failed',
      VALIDATION_XSS_DETECTED: 'validation.xss.detected',
      VALIDATION_INJECTION_DETECTED: 'validation.injection.detected',
      
      // Fichiers
      FILE_UPLOAD_SUCCESS: 'file.upload.success',
      FILE_UPLOAD_FAILED: 'file.upload.failed',
      FILE_SUSPICIOUS_TYPE: 'file.suspicious.type',
      
      // IA
      AI_SAFETY_VIOLATION: 'ai.safety.violation',
      AI_UNSAFE_RECOMMENDATION: 'ai.unsafe.recommendation',
      
      // Système
      SYSTEM_ERROR: 'system.error',
      SYSTEM_WARNING: 'system.warning',
      SYSTEM_INFO: 'system.info'
    };
    
    // Démarrer la sauvegarde périodique
    this.startPeriodicSave();
  }

  // Logger un événement de sécurité
  log(eventType, severity, details = {}, userId = null, ip = null) {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      eventType,
      severity: this.severityLevels[severity] || this.severityLevels.LOW,
      severityName: severity,
      details,
      userId,
      ip,
      userAgent: this.getUserAgent(),
      sessionId: this.getSessionId()
    };
    
    this.logs.push(logEntry);
    
    // Limiter le nombre de logs en mémoire
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Logger dans la console selon la sévérité
    this.consoleLog(logEntry);
    
    // Sauvegarder si critique
    if (severity === 'CRITICAL') {
      this.saveLogs();
    }
    
    return logEntry;
  }

  // Logger une tentative de connexion réussie
  logLoginSuccess(userId, ip, details = {}) {
    return this.log(
      this.eventTypes.AUTH_LOGIN_SUCCESS,
      'LOW',
      { ...details, method: 'email' },
      userId,
      ip
    );
  }

  // Logger une tentative de connexion échouée
  logLoginFailed(email, ip, reason, details = {}) {
    return this.log(
      this.eventTypes.AUTH_LOGIN_FAILED,
      'MEDIUM',
      { email, reason, ...details },
      null,
      ip
    );
  }

  // Logger une inscription réussie
  logRegisterSuccess(userId, ip, details = {}) {
    return this.log(
      this.eventTypes.AUTH_REGISTER_SUCCESS,
      'LOW',
      details,
      userId,
      ip
    );
  }

  // Logger une inscription échouée
  logRegisterFailed(email, ip, reason, details = {}) {
    return this.log(
      this.eventTypes.AUTH_REGISTER_FAILED,
      'MEDIUM',
      { email, reason, ...details },
      null,
      ip
    );
  }

  // Logger un dépassement de rate limit
  logRateLimit(ip, action, limit, details = {}) {
    return this.log(
      this.eventTypes.API_RATE_LIMIT,
      'HIGH',
      { action, limit, ...details },
      null,
      ip
    );
  }

  // Logger une activité suspecte
  logSuspiciousActivity(ip, activity, details = {}) {
    return this.log(
      this.eventTypes.API_SUSPICIOUS_ACTIVITY,
      'HIGH',
      { activity, ...details },
      null,
      ip
    );
  }

  // Logger un blocage d'IP
  logBlockedIP(ip, reason, duration, details = {}) {
    return this.log(
      this.eventTypes.API_BLOCKED_IP,
      'CRITICAL',
      { reason, duration, ...details },
      null,
      ip
    );
  }

  // Logger une validation échouée
  logValidationFailed(field, value, reason, userId = null, ip = null) {
    return this.log(
      this.eventTypes.VALIDATION_FAILED,
      'MEDIUM',
      { field, value: this.sanitizeValue(value), reason },
      userId,
      ip
    );
  }

  // Logger une tentative XSS
  logXSSDetected(input, userId = null, ip = null) {
    return this.log(
      this.eventTypes.VALIDATION_XSS_DETECTED,
      'HIGH',
      { input: this.sanitizeValue(input) },
      userId,
      ip
    );
  }

  // Logger une tentative d'injection
  logInjectionDetected(input, type, userId = null, ip = null) {
    return this.log(
      this.eventTypes.VALIDATION_INJECTION_DETECTED,
      'HIGH',
      { input: this.sanitizeValue(input), type },
      userId,
      ip
    );
  }

  // Logger un upload de fichier
  logFileUpload(file, userId, ip, success = true) {
    const eventType = success ? 
      this.eventTypes.FILE_UPLOAD_SUCCESS : 
      this.eventTypes.FILE_UPLOAD_FAILED;
    
    return this.log(
      eventType,
      success ? 'LOW' : 'MEDIUM',
      {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      },
      userId,
      ip
    );
  }

  // Logger un fichier suspect
  logSuspiciousFile(file, userId, ip, reason) {
    return this.log(
      this.eventTypes.FILE_SUSPICIOUS_TYPE,
      'HIGH',
      {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        reason
      },
      userId,
      ip
    );
  }

  // Logger une violation de sécurité IA
  logAISafetyViolation(recommendation, userProfile, details = {}) {
    return this.log(
      this.eventTypes.AI_SAFETY_VIOLATION,
      'HIGH',
      { recommendation, userProfile, ...details },
      userProfile?.userId
    );
  }

  // Logger une recommandation IA non sécurisée
  logUnsafeAIRecommendation(recommendation, safetyScore, details = {}) {
    return this.log(
      this.eventTypes.AI_UNSAFE_RECOMMENDATION,
      'MEDIUM',
      { recommendation, safetyScore, ...details }
    );
  }

  // Logger une erreur système
  logSystemError(error, context = {}) {
    return this.log(
      this.eventTypes.SYSTEM_ERROR,
      'CRITICAL',
      { error: error.message, stack: error.stack, ...context }
    );
  }

  // Logger un avertissement système
  logSystemWarning(message, context = {}) {
    return this.log(
      this.eventTypes.SYSTEM_WARNING,
      'MEDIUM',
      { message, ...context }
    );
  }

  // Rechercher dans les logs
  search(filters = {}) {
    let filteredLogs = [...this.logs];
    
    // Filtrer par type d'événement
    if (filters.eventType) {
      filteredLogs = filteredLogs.filter(log => 
        log.eventType === filters.eventType
      );
    }
    
    // Filtrer par sévérité
    if (filters.severity) {
      const minSeverity = this.severityLevels[filters.severity];
      filteredLogs = filteredLogs.filter(log => 
        log.severity >= minSeverity
      );
    }
    
    // Filtrer par utilisateur
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => 
        log.userId === filters.userId
      );
    }
    
    // Filtrer par IP
    if (filters.ip) {
      filteredLogs = filteredLogs.filter(log => 
        log.ip === filters.ip
      );
    }
    
    // Filtrer par date
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filters.endDate)
      );
    }
    
    // Trier par date (plus récent en premier)
    filteredLogs.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Limiter le nombre de résultats
    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }
    
    return filteredLogs;
  }

  // Obtenir les statistiques des logs
  getStats(timeRange = '24h') {
    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const startDate = new Date(now.getTime() - timeRangeMs);
    
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp) >= startDate
    );
    
    const stats = {
      totalLogs: recentLogs.length,
      bySeverity: {},
      byEventType: {},
      byIP: {},
      byUser: {},
      criticalEvents: 0,
      suspiciousIPs: new Set(),
      timeRange
    };
    
    recentLogs.forEach(log => {
      // Compter par sévérité
      const severityName = log.severityName;
      stats.bySeverity[severityName] = (stats.bySeverity[severityName] || 0) + 1;
      
      // Compter par type d'événement
      stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;
      
      // Compter par IP
      if (log.ip) {
        stats.byIP[log.ip] = (stats.byIP[log.ip] || 0) + 1;
      }
      
      // Compter par utilisateur
      if (log.userId) {
        stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
      }
      
      // Compter les événements critiques
      if (log.severity === this.severityLevels.CRITICAL) {
        stats.criticalEvents++;
      }
      
      // Identifier les IPs suspectes
      if (log.eventType === this.eventTypes.API_SUSPICIOUS_ACTIVITY) {
        stats.suspiciousIPs.add(log.ip);
      }
    });
    
    stats.suspiciousIPs = Array.from(stats.suspiciousIPs);
    
    return stats;
  }

  // Obtenir les alertes de sécurité
  getSecurityAlerts() {
    const alerts = [];
    const last24h = this.search({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });
    
    // Alerte pour trop d'échecs de connexion
    const loginFailures = last24h.filter(log => 
      log.eventType === this.eventTypes.AUTH_LOGIN_FAILED
    );
    
    if (loginFailures.length > 10) {
      alerts.push({
        type: 'MULTIPLE_LOGIN_FAILURES',
        severity: 'HIGH',
        count: loginFailures.length,
        message: `${loginFailures.length} échecs de connexion détectés`
      });
    }
    
    // Alerte pour activités suspectes
    const suspiciousActivities = last24h.filter(log => 
      log.eventType === this.eventTypes.API_SUSPICIOUS_ACTIVITY
    );
    
    if (suspiciousActivities.length > 5) {
      alerts.push({
        type: 'SUSPICIOUS_ACTIVITIES',
        severity: 'HIGH',
        count: suspiciousActivities.length,
        message: `${suspiciousActivities.length} activités suspectes détectées`
      });
    }
    
    // Alerte pour violations de sécurité IA
    const aiViolations = last24h.filter(log => 
      log.eventType === this.eventTypes.AI_SAFETY_VIOLATION
    );
    
    if (aiViolations.length > 0) {
      alerts.push({
        type: 'AI_SAFETY_VIOLATIONS',
        severity: 'CRITICAL',
        count: aiViolations.length,
        message: `${aiViolations.length} violations de sécurité IA détectées`
      });
    }
    
    return alerts;
  }

  // Sauvegarder les logs
  saveLogs() {
    try {
      const data = {
        logs: this.logs,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem('security_logs', JSON.stringify(data));
      console.log(`💾 ${this.logs.length} logs de sécurité sauvegardés`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des logs:', error);
    }
  }

  // Charger les logs
  loadLogs() {
    try {
      const data = localStorage.getItem('security_logs');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.logs && Array.isArray(parsed.logs)) {
          this.logs = parsed.logs;
          console.log(`📥 ${this.logs.length} logs de sécurité chargés`);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    }
  }

  // Sauvegarde périodique
  startPeriodicSave() {
    setInterval(() => {
      this.saveLogs();
    }, 5 * 60 * 1000); // Toutes les 5 minutes
  }

  // Utilitaires
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserAgent() {
    return navigator.userAgent || 'Unknown';
  }

  getSessionId() {
    return sessionStorage.getItem('sessionId') || 'Unknown';
  }

  sanitizeValue(value) {
    if (typeof value === 'string') {
      return value.substring(0, 100); // Limiter la longueur
    }
    return value;
  }

  getTimeRangeMs(timeRange) {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return ranges[timeRange] || ranges['24h'];
  }

  consoleLog(logEntry) {
    const { severityName, eventType, details, ip, userId } = logEntry;
    
    const message = `🔒 [${severityName}] ${eventType} - IP: ${ip || 'Unknown'} - User: ${userId || 'Anonymous'}`;
    
    switch (severityName) {
      case 'CRITICAL':
        console.error(message, details);
        break;
      case 'HIGH':
        console.warn(message, details);
        break;
      case 'MEDIUM':
        console.warn(message, details);
        break;
      case 'LOW':
        console.log(message, details);
        break;
      default:
        console.log(message, details);
    }
  }

  // Nettoyer les anciens logs
  cleanup(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 jours par défaut
    const cutoff = Date.now() - maxAge;
    const initialCount = this.logs.length;
    
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > cutoff
    );
    
    const removedCount = initialCount - this.logs.length;
    if (removedCount > 0) {
      console.log(`🧹 ${removedCount} anciens logs supprimés`);
    }
  }
}

// Instance singleton
const securityLogService = new SecurityLogService();

export default securityLogService; 
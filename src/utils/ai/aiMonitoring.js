// Système de monitoring IA pour le chatbot
class AIMonitoring {
  constructor() {
    this.metrics = {
      functionCalls: new Map(),
      responseTimes: [],
      userSatisfaction: [],
      errorRates: new Map(),
      functionAccuracy: new Map(),
      conversationFlow: [],
      cacheHitRate: 0,
      totalRequests: 0,
      successfulRequests: 0,
      safetyValidations: [],
    };

    this.startTime = Date.now();
    this.sessionId = this.generateSessionId();
  }

  // Générer un ID de session unique
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enregistrer un appel de fonction
  recordFunctionCall(functionName, args, response, executionTime) {
    if (!this.metrics.functionCalls.has(functionName)) {
      this.metrics.functionCalls.set(functionName, {
        count: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        lastCalled: null,
        successRate: 0,
        errors: 0,
        args: [],
        responses: [],
      });
    }

    const functionStats = this.metrics.functionCalls.get(functionName);
    functionStats.count++;
    functionStats.totalExecutionTime += executionTime;
    functionStats.averageExecutionTime =
      functionStats.totalExecutionTime / functionStats.count;
    functionStats.lastCalled = new Date();
    functionStats.args.push(args);
    functionStats.responses.push(response);

    // Vérifier si la réponse est valide
    const isValidResponse = this.validateFunctionResponse(
      functionName,
      response
    );
    if (isValidResponse) {
      functionStats.successRate =
        ((functionStats.count - functionStats.errors) / functionStats.count) *
        100;
    } else {
      functionStats.errors++;
      functionStats.successRate =
        ((functionStats.count - functionStats.errors) / functionStats.count) *
        100;
    }

    console.log(
      `📊 Fonction ${functionName} appelée - Temps: ${executionTime}ms, Succès: ${isValidResponse}`
    );
  }

  // Enregistrer le temps de réponse
  recordResponseTime(responseTime) {
    this.metrics.responseTimes.push({
      timestamp: Date.now(),
      responseTime,
      sessionId: this.sessionId,
    });

    // Garder seulement les 1000 dernières mesures
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
  }

  // Enregistrer la satisfaction utilisateur (basée sur les interactions)
  recordUserSatisfaction(message, response, interactionType) {
    const satisfaction = this.calculateSatisfactionScore(
      message,
      response,
      interactionType
    );
    this.metrics.userSatisfaction.push({
      timestamp: Date.now(),
      satisfaction,
      message,
      response,
      interactionType,
    });

    // Garder seulement les 500 dernières mesures
    if (this.metrics.userSatisfaction.length > 500) {
      this.metrics.userSatisfaction.shift();
    }
  }

  // Calculer un score de satisfaction basé sur l'interaction
  calculateSatisfactionScore(message, response, interactionType) {
    let score = 0.5; // Score de base

    // Facteurs positifs
    if (
      response.includes('💪') ||
      response.includes('🔥') ||
      response.includes('✅')
    )
      score += 0.2;
    if (response.length > 100) score += 0.1; // Réponse détaillée
    if (response.includes('**') && response.includes('**')) score += 0.1; // Formatage
    if (interactionType === 'function_call') score += 0.2; // Utilisation de fonction

    // Facteurs négatifs
    if (response.includes('Erreur') || response.includes('error')) score -= 0.3;
    if (response.length < 20) score -= 0.2; // Réponse trop courte
    if (response.includes('non implémentée')) score -= 0.4;

    return Math.max(0, Math.min(1, score)); // Normaliser entre 0 et 1
  }

  // Enregistrer une erreur
  recordError(functionName, error, context) {
    if (!this.metrics.errorRates.has(functionName)) {
      this.metrics.errorRates.set(functionName, []);
    }

    this.metrics.errorRates.get(functionName).push({
      timestamp: Date.now(),
      error: error.message || error,
      context,
      sessionId: this.sessionId,
    });
  }

  // Enregistrer le flux de conversation
  recordConversationFlow(userMessage, assistantResponse, functionUsed = null) {
    this.metrics.conversationFlow.push({
      timestamp: Date.now(),
      userMessage: userMessage.substring(0, 100), // Limiter la taille
      assistantResponse: assistantResponse.substring(0, 200), // Limiter la taille
      functionUsed,
      sessionId: this.sessionId,
    });

    // Garder seulement les 200 dernières interactions
    if (this.metrics.conversationFlow.length > 200) {
      this.metrics.conversationFlow.shift();
    }
  }

  // Mettre à jour les statistiques de cache
  updateCacheStats(hit, totalRequests) {
    this.metrics.cacheHitRate = (hit / totalRequests) * 100;
    this.metrics.totalRequests = totalRequests;
  }

  // Enregistrer une requête réussie
  recordSuccessfulRequest() {
    this.metrics.successfulRequests++;
  }

  // Valider la réponse d'une fonction
  validateFunctionResponse(functionName, response) {
    if (!response || typeof response !== 'string') return false;

    // Vérifications spécifiques par fonction
    switch (functionName) {
      case 'generate_personalized_workout':
        return response.includes('Exercices') || response.includes('Séance');
      case 'analyze_workout_performance':
        return response.includes('Analyse') || response.includes('Performance');
      case 'nutrition_recommendations':
        return response.includes('Nutrition') || response.includes('Calories');
      case 'progress_analysis':
        return (
          response.includes('Progression') || response.includes('Métriques')
        );
      case 'recovery_recommendations':
        return response.includes('Récupération') || response.includes('Repos');
      case 'exercise_form_analysis':
        return response.includes('Forme') || response.includes('Technique');
      case 'motivation_boost':
        return (
          response.includes('Motivation') || response.includes('Stratégies')
        );
      default:
        return response.length > 10; // Réponse minimale
    }
  }

  // Obtenir les statistiques globales
  getGlobalStats() {
    const avgResponseTime =
      this.metrics.responseTimes.length > 0
        ? this.metrics.responseTimes.reduce(
            (sum, rt) => sum + rt.responseTime,
            0
          ) / this.metrics.responseTimes.length
        : 0;

    const avgSatisfaction =
      this.metrics.userSatisfaction.length > 0
        ? this.metrics.userSatisfaction.reduce(
            (sum, us) => sum + us.satisfaction,
            0
          ) / this.metrics.userSatisfaction.length
        : 0;

    const successRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
        : 0;

    return {
      sessionId: this.sessionId,
      uptime: Date.now() - this.startTime,
      totalRequests: this.metrics.totalRequests,
      successfulRequests: this.metrics.successfulRequests,
      successRate: successRate.toFixed(2) + '%',
      averageResponseTime: Math.round(avgResponseTime) + 'ms',
      averageSatisfaction: (avgSatisfaction * 100).toFixed(1) + '%',
      cacheHitRate: this.metrics.cacheHitRate.toFixed(1) + '%',
      functionCallCount: this.metrics.functionCalls.size,
      totalFunctionCalls: Array.from(
        this.metrics.functionCalls.values()
      ).reduce((sum, fc) => sum + fc.count, 0),
    };
  }

  // Obtenir les statistiques par fonction
  getFunctionStats(functionName = null) {
    if (functionName) {
      const stats = this.metrics.functionCalls.get(functionName);
      if (!stats) return null;

      return {
        name: functionName,
        count: stats.count,
        averageExecutionTime: Math.round(stats.averageExecutionTime) + 'ms',
        successRate: stats.successRate.toFixed(1) + '%',
        lastCalled: stats.lastCalled,
        errorCount: stats.errors,
      };
    }

    // Statistiques pour toutes les fonctions
    return Array.from(this.metrics.functionCalls.entries()).map(
      ([name, stats]) => ({
        name,
        count: stats.count,
        averageExecutionTime: Math.round(stats.averageExecutionTime) + 'ms',
        successRate: stats.successRate.toFixed(1) + '%',
        lastCalled: stats.lastCalled,
        errorCount: stats.errors,
      })
    );
  }

  // Obtenir les tendances de performance
  getPerformanceTrends() {
    const recentResponseTimes = this.metrics.responseTimes.slice(-50);
    const recentSatisfaction = this.metrics.userSatisfaction.slice(-50);

    const responseTimeTrend =
      recentResponseTimes.length > 1
        ? this.calculateTrend(recentResponseTimes.map((rt) => rt.responseTime))
        : 'stable';

    const satisfactionTrend =
      recentSatisfaction.length > 1
        ? this.calculateTrend(recentSatisfaction.map((us) => us.satisfaction))
        : 'stable';

    return {
      responseTimeTrend,
      satisfactionTrend,
      recentPerformance: {
        avgResponseTime:
          recentResponseTimes.length > 0
            ? Math.round(
                recentResponseTimes.reduce(
                  (sum, rt) => sum + rt.responseTime,
                  0
                ) / recentResponseTimes.length
              )
            : 0,
        avgSatisfaction:
          recentSatisfaction.length > 0
            ? (
                (recentSatisfaction.reduce(
                  (sum, us) => sum + us.satisfaction,
                  0
                ) /
                  recentSatisfaction.length) *
                100
              ).toFixed(1)
            : 0,
      },
    };
  }

  // Calculer la tendance (amélioration, détérioration, stable)
  calculateTrend(values) {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 5) return 'amélioration';
    if (change < -5) return 'détérioration';
    return 'stable';
  }

  // Obtenir les alertes de performance
  getPerformanceAlerts() {
    const alerts = [];
    const globalStats = this.getGlobalStats();
    const functionStats = this.getFunctionStats();

    // Alertes de temps de réponse
    const avgResponseTime = parseFloat(globalStats.averageResponseTime);
    if (avgResponseTime > 5000) {
      alerts.push({
        type: 'warning',
        message: `Temps de réponse élevé: ${avgResponseTime}ms`,
        severity: 'medium',
      });
    }

    // Alertes de satisfaction
    const avgSatisfaction = parseFloat(globalStats.averageSatisfaction);
    if (avgSatisfaction < 60) {
      alerts.push({
        type: 'error',
        message: `Satisfaction utilisateur faible: ${avgSatisfaction}%`,
        severity: 'high',
      });
    }

    // Alertes de taux de succès
    const successRate = parseFloat(globalStats.successRate);
    if (successRate < 90) {
      alerts.push({
        type: 'error',
        message: `Taux de succès faible: ${successRate}%`,
        severity: 'high',
      });
    }

    // Alertes par fonction
    functionStats.forEach((fn) => {
      const successRate = parseFloat(fn.successRate);
      if (successRate < 80) {
        alerts.push({
          type: 'warning',
          message: `Fonction ${fn.name}: taux de succès faible (${successRate}%)`,
          severity: 'medium',
        });
      }
    });

    return alerts;
  }

  // Générer un rapport de performance
  generatePerformanceReport() {
    const globalStats = this.getGlobalStats();
    const functionStats = this.getFunctionStats();
    const trends = this.getPerformanceTrends();
    const alerts = this.getPerformanceAlerts();

    return {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      globalStats,
      functionStats,
      trends,
      alerts,
      recommendations: this.generateRecommendations(
        globalStats,
        functionStats,
        trends
      ),
    };
  }

  // Générer des recommandations d'amélioration
  generateRecommendations(globalStats, functionStats, trends) {
    const recommendations = [];

    // Recommandations basées sur les performances
    if (parseFloat(globalStats.averageResponseTime) > 3000) {
      recommendations.push(
        'Optimiser le cache pour réduire les temps de réponse'
      );
    }

    if (parseFloat(globalStats.averageSatisfaction) < 70) {
      recommendations.push('Améliorer la qualité des réponses et le formatage');
    }

    if (parseFloat(globalStats.successRate) < 95) {
      recommendations.push("Renforcer la gestion d'erreurs et la validation");
    }

    // Recommandations basées sur les tendances
    if (trends.responseTimeTrend === 'détérioration') {
      recommendations.push(
        'Investigation nécessaire sur la dégradation des performances'
      );
    }

    if (trends.satisfactionTrend === 'détérioration') {
      recommendations.push(
        'Analyser les réponses récentes pour améliorer la satisfaction'
      );
    }

    // Recommandations par fonction
    functionStats.forEach((fn) => {
      if (parseFloat(fn.successRate) < 85) {
        recommendations.push(
          `Améliorer la fonction ${fn.name} (taux de succès: ${fn.successRate})`
        );
      }
    });

    return recommendations;
  }

  // Sauvegarder les métriques
  saveMetrics() {
    try {
      const report = this.generatePerformanceReport();
      localStorage.setItem('ai_monitoring_report', JSON.stringify(report));
      console.log('📊 Rapport de monitoring sauvegardé');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des métriques:', error);
    }
  }

  // Charger les métriques sauvegardées
  loadMetrics() {
    try {
      const saved = localStorage.getItem('ai_monitoring_report');
      if (saved) {
        const report = JSON.parse(saved);
        console.log('📊 Rapport de monitoring chargé:', report);
        return report;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
    }
    return null;
  }

  // Réinitialiser les métriques
  resetMetrics() {
    this.metrics = {
      functionCalls: new Map(),
      responseTimes: [],
      userSatisfaction: [],
      errorRates: new Map(),
      functionAccuracy: new Map(),
      conversationFlow: [],
      cacheHitRate: 0,
      totalRequests: 0,
      successfulRequests: 0,
      safetyValidations: [],
    };
    this.startTime = Date.now();
    this.sessionId = this.generateSessionId();
    console.log('📊 Métriques réinitialisées');
  }

  // Enregistrer une validation de sécurité
  recordSafetyValidation(functionName, validation) {
    if (!this.metrics.safetyValidations) {
      this.metrics.safetyValidations = [];
    }

    this.metrics.safetyValidations.push({
      timestamp: Date.now(),
      functionName,
      validation,
      sessionId: this.sessionId,
    });

    // Garder seulement les 100 dernières validations
    if (this.metrics.safetyValidations.length > 100) {
      this.metrics.safetyValidations.shift();
    }

    console.log(
      `🔒 Validation de sécurité pour ${functionName}: Score ${validation.safetyScore}/100`
    );
  }

  // Obtenir les statistiques de sécurité
  getSafetyStats() {
    const validations = this.metrics.safetyValidations || [];

    if (!validations || validations.length === 0) {
      return {
        totalValidations: 0,
        averageSafetyScore: 100,
        criticalIssues: 0,
        warnings: 0,
        safeRecommendations: 0,
        safetyRate: 100,
      };
    }

    const totalValidations = validations.length;
    const averageSafetyScore =
      validations.reduce((sum, v) => sum + v.validation.safetyScore, 0) /
      totalValidations;
    const criticalIssues = validations.filter(
      (v) => v.validation.errors.length > 0
    ).length;
    const warnings = validations.filter(
      (v) => v.validation.warnings.length > 0
    ).length;
    const safeRecommendations = validations.filter(
      (v) => v.validation.safetyScore >= 90
    ).length;

    return {
      totalValidations,
      averageSafetyScore: Math.round(averageSafetyScore),
      criticalIssues,
      warnings,
      safeRecommendations,
      safetyRate: Math.round((safeRecommendations / totalValidations) * 100),
    };
  }
}

// Instance globale du monitoring
const aiMonitoring = new AIMonitoring();

export { AIMonitoring };
export default aiMonitoring;

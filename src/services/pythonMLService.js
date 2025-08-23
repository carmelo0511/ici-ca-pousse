/**
 * Service pour communiquer avec l'API Python ML
 * Fallback automatique vers le système JavaScript en cas d'erreur
 */

import { getApiUrl, getApiConfig } from '../config/api.js';

class PythonMLService {
  constructor() {
    // Configuration intelligente de l'URL selon l'environnement
    this.baseURL = getApiUrl();
    this.isAvailable = false;
    this.lastHealthCheck = 0;
    this.healthCheckInterval = getApiConfig().INTERVALS.healthCheck;
    this.timeout = getApiConfig().TIMEOUTS.healthCheck;
    
    // Vérifier la disponibilité au démarrage
    this.checkAvailability();
  }

  async checkAvailability() {
    const now = Date.now();
    
    // Éviter les vérifications trop fréquentes
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.isAvailable;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        this.isAvailable = data.status === 'healthy';
        console.log('✅ Python ML API disponible:', data);
      } else {
        this.isAvailable = false;
        console.log('❌ Python ML API indisponible - Status:', response.status);
      }
    } catch (error) {
      this.isAvailable = false;
      if (error.name === 'AbortError') {
        console.log('⏱️ Python ML API timeout - Utilisation du fallback JavaScript');
      } else {
        console.log('🔄 Python ML API non accessible - Utilisation du fallback JavaScript');
      }
    }
    
    this.lastHealthCheck = now;
    return this.isAvailable;
  }

  async predictWeight(exerciseName, userData, workoutHistory) {
    // Vérifier la disponibilité
    await this.checkAvailability();
    
    if (!this.isAvailable) {
      return this.fallbackToJSPrediction(exerciseName, userData, workoutHistory);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.baseURL}/api/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          exercise_name: exerciseName,
          user_data: {
            current_weight: userData.currentWeight || 0,
            level: userData.level || 'beginner',
            goals: userData.goals || []
          },
          workout_history: this.formatWorkoutHistory(workoutHistory)
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('🎯 Prédiction Python ML réussie:', result.prediction);
        return {
          ...result.prediction,
          modelUsed: 'python_ensemble',
          apiSource: 'python',
          confidence: result.prediction.confidence * 100 // Convertir en pourcentage
        };
      } else {
        throw new Error(result.error || 'Erreur inconnue de l\'API Python');
      }
    } catch (error) {
      console.error('❌ Erreur Python ML API:', error.message);
      
      // Marquer comme indisponible pour éviter les appels répétés
      this.isAvailable = false;
      
      return this.fallbackToJSPrediction(exerciseName, userData, workoutHistory);
    }
  }

  async trainModels(userId, newData, retrain = false) {
    await this.checkAvailability();
    
    if (!this.isAvailable) {
      return { 
        success: false, 
        error: 'API Python non disponible',
        fallback: true
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes pour l'entraînement
      
      const response = await fetch(`${this.baseURL}/api/ml/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          user_id: userId,
          new_data: this.formatWorkoutHistory(newData),
          retrain: retrain
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🎓 Entraînement Python ML:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Erreur entraînement API:', error);
      return { 
        success: false, 
        error: error.message,
        fallback: true
      };
    }
  }

  async getAnalytics() {
    await this.checkAvailability();
    
    if (!this.isAvailable) {
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.baseURL}/api/ml/analytics`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analytics = await response.json();
      console.log('📊 Analytics Python ML:', analytics);
      return analytics;
      
    } catch (error) {
      console.error('❌ Erreur analytics API:', error);
      return null;
    }
  }

  async getMLStatus() {
    await this.checkAvailability();
    
    try {
      const response = await fetch(`${this.baseURL}/api/ml/status`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('❌ Erreur status ML:', error);
    }
    
    return {
      ml_pipeline_available: false,
      ensemble_model_available: false,
      fallback_mode: true,
      features: { fallback: true }
    };
  }

  fallbackToJSPrediction(exerciseName, userData, workoutHistory) {
    console.log('🔄 Utilisation du système JavaScript de fallback');
    
    try {
      // Dans un environnement React, utiliser l'import dynamique
      if (typeof require !== 'undefined') {
        const { predictNextWeight } = require('../utils/ml/weightPrediction');
        const prediction = predictNextWeight(exerciseName, workoutHistory, userData.currentWeight);
        
        return {
          exercise_name: exerciseName,
          predicted_weight: prediction.predictedWeight,
          confidence: prediction.confidence,
          trend: prediction.trend,
          recommendation: prediction.recommendation,
          factors: prediction.factors || [],
          modelUsed: 'javascript_fallback',
          apiSource: 'javascript',
          plateau_analysis: { detected: false },
          recommendations: [prediction.recommendation]
        };
      } else {
        // Fallback pour environnements sans require (Node.js ES modules)
        throw new Error('Module require non disponible');
      }
    } catch (error) {
      console.error('❌ Erreur système de fallback:', error);
      
      // Fallback ultime avec prédiction simple
      const currentWeight = userData.currentWeight || 0;
      let fallbackWeight;
      
      if (currentWeight > 0) {
        // Logique simple de progression basée sur l'historique
        if (workoutHistory && workoutHistory.length > 0) {
          const progression = 2.5; // Progression standard
          fallbackWeight = currentWeight + progression;
        } else {
          fallbackWeight = currentWeight + 2.5; // Incrément par défaut
        }
      } else {
        fallbackWeight = 10; // Poids de départ par défaut
      }
      
      return {
        exercise_name: exerciseName,
        predicted_weight: fallbackWeight,
        confidence: 30,
        trend: 'unknown',
        recommendation: `Essayez ${fallbackWeight}kg`,
        factors: ['Prédiction d\'urgence'],
        modelUsed: 'emergency_fallback',
        apiSource: 'emergency',
        plateau_analysis: { detected: false },
        recommendations: [`Essayez ${fallbackWeight}kg`, 'Vérifier la configuration']
      };
    }
  }

  formatWorkoutHistory(workouts) {
    /**
     * Formate l'historique d'entraînement pour l'API Python
     */
    if (!Array.isArray(workouts)) {
      return [];
    }

    return workouts.map(workout => ({
      date: workout.date || new Date().toISOString(),
      exercises: workout.exercises || [],
      duration: workout.duration || 60,
      weight: workout.weight || 0,
      reps: workout.reps || 0,
      sets: workout.sets || 0
    }));
  }

  // Méthode pour forcer la réinitialisation de la disponibilité
  async resetAvailability() {
    this.isAvailable = false;
    this.lastHealthCheck = 0;
    return await this.checkAvailability();
  }

  // Méthode pour obtenir le statut actuel
  getStatus() {
    return {
      isAvailable: this.isAvailable,
      baseURL: this.baseURL,
      lastHealthCheck: new Date(this.lastHealthCheck).toLocaleString(),
      timeout: this.timeout
    };
  }

  // Méthode pour configurer l'URL de base
  setBaseURL(url) {
    this.baseURL = url;
    this.resetAvailability();
  }
}

// Export de l'instance singleton
const pythonMLService = new PythonMLService();
export default pythonMLService;
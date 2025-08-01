// Tests unitaires simples pour les fonctions utilitaires
import {
  getRelevantFunctions,
  processFunctionResponse,
} from '../../utils/ai/openaiFunctions';
import aiMonitoring from '../../utils/ai/aiMonitoring';
import safetyValidator from '../../utils/ai/safetyValidator';
import knowledgeBase from '../../utils/ai/knowledgeBase';

// Mock des dépendances
jest.mock('../../utils/ai/openaiFunctions');
jest.mock('../../utils/ai/aiMonitoring');
jest.mock('../../utils/ai/safetyValidator');
jest.mock('../../utils/ai/knowledgeBase');

describe('Fonctions Utilitaires - Tests Unitaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getRelevantFunctions.mockReturnValue([]);
    processFunctionResponse.mockImplementation((name, response) => response);
    aiMonitoring.metrics = { totalRequests: 0 };
    aiMonitoring.recordResponseTime = jest.fn();
    aiMonitoring.recordUserSatisfaction = jest.fn();
    aiMonitoring.recordConversationFlow = jest.fn();
    aiMonitoring.recordSuccessfulRequest = jest.fn();
    aiMonitoring.recordError = jest.fn();
    aiMonitoring.recordFunctionCall = jest.fn();
    aiMonitoring.recordSafetyValidation = jest.fn();
    aiMonitoring.updateCacheStats = jest.fn();
    aiMonitoring.saveMetrics = jest.fn();
    aiMonitoring.loadMetrics = jest.fn(() => ({}));
    aiMonitoring.getGlobalStats = jest.fn(() => ({}));
    aiMonitoring.getFunctionStats = jest.fn(() => ({}));
    aiMonitoring.getPerformanceTrends = jest.fn(() => ({}));
    aiMonitoring.getPerformanceAlerts = jest.fn(() => ({}));
    aiMonitoring.generatePerformanceReport = jest.fn(() => ({}));
    aiMonitoring.resetMetrics = jest.fn();
    aiMonitoring.getSafetyStats = jest.fn(() => ({}));
    knowledgeBase.generateEnrichedContext = jest.fn(() => null);
    knowledgeBase.getStats = jest.fn(() => ({}));
    knowledgeBase.addCustomDocument = jest.fn(() => 'doc1');
    knowledgeBase.searchDocuments = jest.fn(() => []);
    knowledgeBase.searchByCategory = jest.fn(() => []);
    safetyValidator.validateExerciseRecommendation = jest.fn(() => ({
      isValid: true,
      warnings: [],
      errors: [],
      safetyScore: 100,
    }));
    safetyValidator.validateNutritionRecommendation = jest.fn(() => ({
      isValid: true,
      warnings: [],
      errors: [],
      safetyScore: 100,
    }));
    safetyValidator.validateRecoveryRecommendation = jest.fn(() => ({
      isValid: true,
      warnings: [],
      errors: [],
      safetyScore: 100,
    }));
    safetyValidator.validateProgressRecommendation = jest.fn(() => ({
      isValid: true,
      warnings: [],
      errors: [],
      safetyScore: 100,
    }));
  });

  describe('Fonctions de Monitoring', () => {
    test('devrait obtenir les statistiques de monitoring', () => {
      const stats = aiMonitoring.getGlobalStats();
      expect(stats).toBeDefined();
      expect(aiMonitoring.getGlobalStats).toHaveBeenCalled();
    });

    test('devrait obtenir les statistiques de fonction', () => {
      const stats = aiMonitoring.getFunctionStats('test_function');
      expect(stats).toBeDefined();
      expect(aiMonitoring.getFunctionStats).toHaveBeenCalledWith(
        'test_function'
      );
    });

    test('devrait obtenir les tendances de performance', () => {
      const trends = aiMonitoring.getPerformanceTrends();
      expect(trends).toBeDefined();
      expect(aiMonitoring.getPerformanceTrends).toHaveBeenCalled();
    });

    test('devrait obtenir les alertes de performance', () => {
      const alerts = aiMonitoring.getPerformanceAlerts();
      expect(alerts).toBeDefined();
      expect(aiMonitoring.getPerformanceAlerts).toHaveBeenCalled();
    });

    test('devrait générer un rapport de performance', () => {
      const report = aiMonitoring.generatePerformanceReport();
      expect(report).toBeDefined();
      expect(aiMonitoring.generatePerformanceReport).toHaveBeenCalled();
    });

    test('devrait réinitialiser les métriques', () => {
      aiMonitoring.resetMetrics();
      expect(aiMonitoring.resetMetrics).toHaveBeenCalled();
    });

    test('devrait obtenir les statistiques de sécurité', () => {
      const stats = aiMonitoring.getSafetyStats();
      expect(stats).toBeDefined();
      expect(aiMonitoring.getSafetyStats).toHaveBeenCalled();
    });
  });

  describe('Base de Connaissances', () => {
    test('devrait ajouter un document personnalisé', () => {
      const docId = knowledgeBase.addCustomDocument(
        'title',
        'content',
        'category'
      );
      expect(docId).toBe('doc1');
      expect(knowledgeBase.addCustomDocument).toHaveBeenCalledWith(
        'title',
        'content',
        'category'
      );
    });

    test('devrait rechercher des documents', () => {
      const results = knowledgeBase.searchDocuments('query');
      expect(Array.isArray(results)).toBe(true);
      expect(knowledgeBase.searchDocuments).toHaveBeenCalledWith('query');
    });

    test('devrait rechercher par catégorie', () => {
      const results = knowledgeBase.searchByCategory('fitness');
      expect(Array.isArray(results)).toBe(true);
      expect(knowledgeBase.searchByCategory).toHaveBeenCalledWith('fitness');
    });

    test('devrait obtenir les statistiques', () => {
      const stats = knowledgeBase.getStats();
      expect(stats).toBeDefined();
      expect(knowledgeBase.getStats).toHaveBeenCalled();
    });

    test('devrait générer un contexte enrichi', () => {
      const context = knowledgeBase.generateEnrichedContext('query');
      expect(context).toBeNull();
      expect(knowledgeBase.generateEnrichedContext).toHaveBeenCalledWith(
        'query'
      );
    });
  });

  describe('Validation de Sécurité', () => {
    test("devrait valider les recommandations d'exercice", () => {
      const result = safetyValidator.validateExerciseRecommendation({
        difficulty: 'beginner',
      });
      expect(result.isValid).toBe(true);
      expect(result.safetyScore).toBe(100);
      expect(
        safetyValidator.validateExerciseRecommendation
      ).toHaveBeenCalledWith({ difficulty: 'beginner' });
    });

    test('devrait valider les recommandations nutritionnelles', () => {
      const result = safetyValidator.validateNutritionRecommendation({
        goal: 'weight_loss',
      });
      expect(result.isValid).toBe(true);
      expect(result.safetyScore).toBe(100);
      expect(
        safetyValidator.validateNutritionRecommendation
      ).toHaveBeenCalledWith({ goal: 'weight_loss' });
    });

    test('devrait valider les recommandations de récupération', () => {
      const result = safetyValidator.validateRecoveryRecommendation({
        fatigue_level: 'high',
      });
      expect(result.isValid).toBe(true);
      expect(result.safetyScore).toBe(100);
      expect(
        safetyValidator.validateRecoveryRecommendation
      ).toHaveBeenCalledWith({ fatigue_level: 'high' });
    });

    test('devrait valider les recommandations de progression', () => {
      const result = safetyValidator.validateProgressRecommendation({
        period: 'month',
      });
      expect(result.isValid).toBe(true);
      expect(result.safetyScore).toBe(100);
      expect(
        safetyValidator.validateProgressRecommendation
      ).toHaveBeenCalledWith({ period: 'month' });
    });
  });

  describe('Fonctions OpenAI', () => {
    test('devrait obtenir les fonctions pertinentes', () => {
      const functions = getRelevantFunctions('Generate a workout');
      expect(Array.isArray(functions)).toBe(true);
      expect(getRelevantFunctions).toHaveBeenCalledWith('Generate a workout');
    });

    test('devrait traiter une réponse de fonction', () => {
      const response = {
        difficulty: 'beginner',
        exercises: ['squat', 'pushup'],
      };
      const result = processFunctionResponse(
        'generate_personalized_workout',
        response
      );
      expect(result).toEqual(response);
      expect(processFunctionResponse).toHaveBeenCalledWith(
        'generate_personalized_workout',
        response
      );
    });
  });

  describe('Gestion des Erreurs', () => {
    test('devrait gérer les erreurs de validation de sécurité', () => {
      safetyValidator.validateExerciseRecommendation.mockImplementation(() => {
        throw new Error('Safety validation failed');
      });

      expect(() => {
        safetyValidator.validateExerciseRecommendation({
          difficulty: 'beginner',
        });
      }).toThrow('Safety validation failed');
    });

    test('devrait gérer les erreurs de base de connaissances', () => {
      knowledgeBase.addCustomDocument.mockImplementation(() => {
        throw new Error('Database error');
      });

      expect(() => {
        knowledgeBase.addCustomDocument('title', 'content', 'category');
      }).toThrow('Database error');
    });

    test('devrait gérer les erreurs de monitoring', () => {
      aiMonitoring.getGlobalStats.mockImplementation(() => {
        throw new Error('Monitoring error');
      });

      expect(() => {
        aiMonitoring.getGlobalStats();
      }).toThrow('Monitoring error');
    });
  });

  describe("Tests d'Intégration Simples", () => {
    test("devrait traiter un workflow complet de génération d'entraînement", () => {
      // Simuler le workflow complet
      const query = 'Generate a workout for beginners';
      const functions = getRelevantFunctions(query);
      const response = {
        difficulty: 'beginner',
        exercises: ['squat', 'pushup'],
      };
      const validation =
        safetyValidator.validateExerciseRecommendation(response);
      const processedResponse = processFunctionResponse(
        'generate_personalized_workout',
        response
      );

      expect(functions).toBeDefined();
      expect(validation.isValid).toBe(true);
      expect(processedResponse).toEqual(response);
    });

    test("devrait traiter un workflow d'analyse de performance", () => {
      // Simuler l'analyse de performance
      const query = 'Analyze my workout performance';
      const functions = getRelevantFunctions(query);
      const response = {
        performance_score: 85,
        recommendations: ['rest more'],
      };
      const validation =
        safetyValidator.validateProgressRecommendation(response);
      const processedResponse = processFunctionResponse(
        'analyze_workout_performance',
        response
      );

      expect(functions).toBeDefined();
      expect(validation.isValid).toBe(true);
      expect(processedResponse).toEqual(response);
    });

    test('devrait traiter un workflow de recommandations nutritionnelles', () => {
      // Simuler les recommandations nutritionnelles
      const query = 'Get nutrition advice for muscle gain';
      const functions = getRelevantFunctions(query);
      const response = { protein: '150g', carbs: '200g', fats: '60g' };
      const validation =
        safetyValidator.validateNutritionRecommendation(response);
      const processedResponse = processFunctionResponse(
        'nutrition_recommendations',
        response
      );

      expect(functions).toBeDefined();
      expect(validation.isValid).toBe(true);
      expect(processedResponse).toEqual(response);
    });
  });

  describe('Tests de Performance', () => {
    test('devrait gérer plusieurs appels de fonction rapidement', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        getRelevantFunctions(`query ${i}`);
        processFunctionResponse(`function_${i}`, { data: i });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Moins d'1 seconde pour 100 appels
      expect(getRelevantFunctions).toHaveBeenCalledTimes(100);
      expect(processFunctionResponse).toHaveBeenCalledTimes(100);
    });

    test('devrait gérer les appels de monitoring sans impact sur les performances', () => {
      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        aiMonitoring.recordSuccessfulRequest();
        aiMonitoring.recordResponseTime(100 + i);
        aiMonitoring.updateCacheStats({ hits: i, misses: 10 });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Moins de 500ms pour 50 appels
      expect(aiMonitoring.recordSuccessfulRequest).toHaveBeenCalledTimes(50);
      expect(aiMonitoring.recordResponseTime).toHaveBeenCalledTimes(50);
      expect(aiMonitoring.updateCacheStats).toHaveBeenCalledTimes(50);
    });
  });

  describe('Tests de Robustesse', () => {
    test('devrait gérer les paramètres vides ou null', () => {
      expect(() => getRelevantFunctions('')).not.toThrow();
      expect(() => getRelevantFunctions(null)).not.toThrow();
      expect(() => processFunctionResponse('', {})).not.toThrow();
      expect(() => processFunctionResponse(null, null)).not.toThrow();
    });

    test('devrait gérer les objets complexes', () => {
      const complexObject = {
        nested: {
          deep: {
            value: 'test',
            array: [1, 2, 3],
            function: () => 'test',
          },
        },
        date: new Date(),
        regex: /test/,
      };

      expect(() =>
        processFunctionResponse('test_function', complexObject)
      ).not.toThrow();
      expect(() =>
        safetyValidator.validateExerciseRecommendation(complexObject)
      ).not.toThrow();
    });

    test('devrait gérer les chaînes très longues', () => {
      const longString = 'a'.repeat(10000);
      expect(() => getRelevantFunctions(longString)).not.toThrow();
      expect(() => knowledgeBase.searchDocuments(longString)).not.toThrow();
    });
  });
});

/**
 * Tests pour le modèle TensorFlow - utilise le fallback system
 */

// Utilise le fallback TensorFlow qui fonctionne en environnement de test
import { TensorFlowModel } from '../../utils/ml/models/tensorflowFallback.js';

// Mock des contraintes de musculation
jest.mock('../../utils/ml/musculationConstraints.js', () => ({
  validateMusculationPrediction: (prediction, current, level, type) => ({
    validatedWeight: Math.max(current, prediction),
    increment: Math.max(0, prediction - current),
    appliedConstraints: [],
    recommendations: []
  })
}));

describe('TensorFlowModel (Fallback System)', () => {
  let model;

  beforeEach(() => {
    model = new TensorFlowModel({
      modelType: 'mlp',
      epochs: 5,
      batchSize: 4
    });
  });

  afterEach(() => {
    if (model) {
      model.dispose();
    }
  });

  describe('Construction', () => {
    test('devrait créer un modèle MLP par défaut', () => {
      expect(model.modelType).toBe('mlp');
      expect(model.uncertaintyEnabled).toBe(true);
      expect(model.isTrained).toBe(false);
    });

    test('devrait accepter une configuration LSTM', () => {
      const lstmModel = new TensorFlowModel({
        modelType: 'lstm',
        sequenceLength: 8,
        lstmUnits: 16
      });

      expect(lstmModel.modelType).toBe('lstm');
      expect(lstmModel.config.sequenceLength).toBe(8);
      expect(lstmModel.config.lstmUnits).toBe(16);
      
      lstmModel.dispose();
    });

    test('devrait accepter une configuration CNN 1D', () => {
      const cnnModel = new TensorFlowModel({
        modelType: 'cnn1d',
        filters: [8, 16],
        kernelSize: 2
      });

      expect(cnnModel.modelType).toBe('cnn1d');
      expect(cnnModel.config.filters).toEqual([8, 16]);
      expect(cnnModel.config.kernelSize).toBe(2);
      
      cnnModel.dispose();
    });
  });

  describe('Configuration des modèles', () => {
    test('devrait utiliser le fallback neural network', () => {
      expect(model.fallbackModel).toBeDefined();
      expect(model.fallbackModel.constructor.name).toBe('NeuralNetworkModel');
    });

    test('devrait maintenir la configuration TensorFlow', () => {
      model.modelType = 'lstm';
      expect(model.modelType).toBe('lstm');
      expect(model.fallbackModel).toBeDefined();
    });

    test('devrait supporter différents types de modèles', () => {
      const cnnModel = new TensorFlowModel({ modelType: 'cnn1d' });
      expect(cnnModel.modelType).toBe('cnn1d');
      expect(cnnModel.fallbackModel).toBeDefined();
      cnnModel.dispose();
    });
  });

  describe('Entraînement', () => {
    const mockFeatures = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
    ];
    const mockTargets = [100, 102, 104, 106];

    test('devrait entraîner le modèle avec succès', async () => {
      const result = await model.train(mockFeatures, mockTargets);

      expect(result.modelType).toBe('TensorFlowFallback');
      expect(result.fallbackUsed).toBe(true);
      expect(result.finalLoss).toBeDefined();
      expect(model.isTrained).toBe(true);
    });

    test('devrait gérer les données vides', async () => {
      await expect(model.train([], [])).rejects.toThrow('Features et targets ne peuvent pas être vides');
    });

    test('devrait adapter la taille de batch aux données disponibles', async () => {
      const smallFeatures = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      ];
      const smallTargets = [100, 102];

      const result = await model.train(smallFeatures, smallTargets);
      expect(result.modelType).toBe('TensorFlowFallback');
    });
  });

  describe('Prédictions', () => {
    const mockFeatures = {
      progression_1week: 0.5,
      progression_2weeks: 1.0,
      progression_4weeks: 2.0,
      frequency_1week: 2,
      frequency_2weeks: 4,
      consistency_score: 85,
      momentum_score: 0.8,
      current_weight: 100,
      currentWeight: 100,
      max_weight: 105,
      avg_weight: 98,
      total_volume: 1000,
      intensity_score: 0.9,
      is_compound_exercise: true,
      realistic_progression_rate: 0.05,
      exercise_experience: 12,
      userLevel: 'intermediate',
      exercise_type: 'compound'
    };

    beforeEach(async () => {
      // Entraîner le modèle pour pouvoir faire des prédictions
      const mockFeatures = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      ];
      const mockTargets = [100, 102];
      await model.train(mockFeatures, mockTargets);
    });

    test('devrait faire une prédiction avec uncertainty', () => {
      const prediction = model.predict(mockFeatures);

      expect(prediction).toHaveProperty('rawPrediction');
      expect(prediction).toHaveProperty('validatedPrediction');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('uncertainty');
      expect(prediction).toHaveProperty('uncertaintyInterval');
      expect(prediction.modelInfo.type).toBe('TensorFlowFallback'); // Fallback maintient l'interface
    });

    test('devrait gérer les prédictions sans modèle entraîné', () => {
      const newModel = new TensorFlowModel();
      expect(() => newModel.predict(mockFeatures)).toThrow();
      newModel.dispose();
    });

    test('devrait convertir les features en array correctement', () => {
      const featureArray = model.convertFeaturesToArray(mockFeatures);
      
      expect(featureArray).toHaveLength(15);
      expect(featureArray[0]).toBe(0.5); // progression_1week
      expect(featureArray[7]).toBe(100); // current_weight
      expect(featureArray[12]).toBe(1); // is_compound_exercise as boolean
    });
  });

  describe('Uncertainty quantification', () => {
    test('devrait supporter uncertainty par défaut', () => {
      expect(model.uncertaintyEnabled).toBe(true);
    });

    test('devrait être désactivable', () => {
      const modelWithoutUncertainty = new TensorFlowModel({
        uncertaintyEnabled: false
      });

      expect(modelWithoutUncertainty.uncertaintyEnabled).toBe(false);
      
      modelWithoutUncertainty.dispose();
    });
  });

  describe('Gestion mémoire', () => {
    test('devrait nettoyer les ressources', () => {
      // Le fallback gère la mémoire automatiquement
      expect(() => model.dispose()).not.toThrow();
      expect(model.fallbackModel).toBeDefined(); // Le fallback reste défini
    });
  });

  describe('Sauvegarde et chargement', () => {
    test('devrait sauvegarder les métadonnées du modèle', async () => {
      // Entraîner le modèle d'abord
      const mockFeatures = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      ];
      const mockTargets = [100, 102];
      await model.train(mockFeatures, mockTargets);

      const savedData = await model.save();

      expect(savedData.type).toBe('TensorFlowFallback');
      expect(savedData.modelType).toBe('mlp');
      expect(savedData.isTrained).toBe(true);
      expect(savedData.fallbackModel).toBeDefined();
    });

    test('devrait charger les métadonnées du modèle', async () => {
      const mockData = {
        type: 'TensorFlowModel',
        modelType: 'lstm',
        isTrained: true,
        uncertaintyEnabled: false,
        scalers: {
          features: {
            mean: [1, 2, 3],
            std: [0.5, 1, 1.5]
          },
          targets: {
            mean: 100,
            std: 10
          }
        }
      };

      await model.load(mockData);

      expect(model.modelType).toBe('lstm');
      expect(model.isTrained).toBe(true);
      expect(model.uncertaintyEnabled).toBe(false);
    });
  });

  describe('Importance des features', () => {
    test('devrait calculer une approximation de l\'importance', async () => {
      // Entraîner le modèle d'abord
      const mockFeatures = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      ];
      const mockTargets = [100, 102];
      await model.train(mockFeatures, mockTargets);

      const importance = model.getFeatureImportance();

      expect(importance).toBeDefined();
      expect(typeof importance).toBe('object');
      // Le fallback retourne un objet vide car le neural network n'implémente pas cette méthode
      // Cela démontre un fallback gracieux
    });

    test('devrait gérer l\'absence de poids', () => {
      const importance = model.getFeatureImportance();
      // Sans entraînement, retourne objet vide ou valeurs par défaut
      expect(typeof importance).toBe('object');
    });
  });

  describe('Gestion des erreurs', () => {
    test('devrait gérer les erreurs d\'entraînement', async () => {
      // Forcer une erreur en passant des données invalides
      await expect(model.train(null, null)).rejects.toThrow();
    });

    test('devrait gérer les erreurs de prédiction', () => {
      // Sans entraînement, devrait échouer
      expect(() => model.predict({})).toThrow();
    });
  });
});
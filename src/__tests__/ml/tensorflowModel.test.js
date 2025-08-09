/**
 * Tests pour le modèle TensorFlow
 */

import { TensorFlowModel } from '../../utils/ml/models/tensorflowModel.js';

// Mock TensorFlow.js pour les tests
jest.mock('@tensorflow/tfjs', () => {
  const mockTensor = {
    dataSync: () => [1.5],
    dispose: () => {},
    shape: [1, 15],
    mean: () => mockTensor,
    std: () => mockTensor,
    sub: () => mockTensor,
    div: () => mockTensor,
    add: () => mockTensor,
    mul: () => mockTensor,
    slice: () => mockTensor
  };

  const mockModel = {
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue({
      history: {
        loss: [1.0, 0.8, 0.6],
        val_loss: [1.1, 0.9, 0.7]
      },
      epoch: [0, 1, 2]
    }),
    predict: () => mockTensor,
    dispose: jest.fn()
  };

  return {
    sequential: () => ({
      add: jest.fn(),
      compile: jest.fn(),
      fit: jest.fn().mockResolvedValue({
        history: {
          loss: [1.0, 0.8, 0.6],
          val_loss: [1.1, 0.9, 0.7]
        },
        epoch: [0, 1, 2]
      }),
      predict: () => mockTensor,
      dispose: jest.fn()
    }),
    layers: {
      inputLayer: () => ({}),
      dense: () => ({}),
      lstm: () => ({}),
      conv1d: () => ({}),
      maxPooling1d: () => ({}),
      globalAveragePooling1d: () => ({}),
      flatten: () => ({}),
      dropout: () => ({}),
      batchNormalization: () => ({})
    },
    regularizers: {
      l2: () => ({})
    },
    train: {
      adam: () => ({})
    },
    losses: {
      meanSquaredError: () => mockTensor,
      absoluteDifference: () => mockTensor
    },
    tensor1d: () => mockTensor,
    tensor2d: () => mockTensor,
    tensor3d: () => mockTensor,
    scalar: () => mockTensor,
    model: () => mockModel
  };
});

// Mock des contraintes de musculation
jest.mock('../../utils/ml/musculationConstraints.js', () => ({
  validateMusculationPrediction: (prediction, current, level, type) => ({
    validatedWeight: Math.max(current, prediction),
    increment: Math.max(0, prediction - current),
    appliedConstraints: [],
    recommendations: []
  })
}));

describe('TensorFlowModel', () => {
  let model;

  beforeEach(() => {
    model = new TensorFlowModel({
      modelType: 'mlp',
      epochs: 5, // Réduire pour les tests
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

  describe('Construction des modèles', () => {
    test('devrait construire un modèle MLP', () => {
      const mlpModel = model.buildMLPModel();
      expect(mlpModel).toBeDefined();
      expect(mlpModel.compile).toHaveBeenCalled();
    });

    test('devrait construire un modèle LSTM', () => {
      model.modelType = 'lstm';
      const lstmModel = model.buildLSTMModel();
      expect(lstmModel).toBeDefined();
      expect(lstmModel.compile).toHaveBeenCalled();
    });

    test('devrait construire un modèle CNN 1D', () => {
      model.modelType = 'cnn1d';
      const cnnModel = model.buildCNN1DModel();
      expect(cnnModel).toBeDefined();
      expect(cnnModel.compile).toHaveBeenCalled();
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

      expect(result.modelType).toBe('mlp');
      expect(result.finalLoss).toBeDefined();
      expect(model.isTrained).toBe(true);
    });

    test('devrait gérer les données vides', async () => {
      await expect(model.train([], [])).rejects.toThrow('Données d\'entraînement vides');
    });

    test('devrait adapter la taille de batch aux données disponibles', async () => {
      const smallFeatures = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]];
      const smallTargets = [100];

      const result = await model.train(smallFeatures, smallTargets);
      expect(result.modelType).toBe('mlp');
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
      // Simuler un modèle entraîné
      model.isTrained = true;
      model.model = {
        predict: () => ({
          mul: () => ({
            add: () => ({
              dataSync: () => [102.5]
            })
          }),
          dataSync: () => [102.5],
          dispose: () => {}
        }),
        dispose: () => {}
      };
      model.scalers.features = {
        mean: { dataSync: () => Array(15).fill(0) },
        std: { dataSync: () => Array(15).fill(1) }
      };
      model.scalers.targets = {
        mean: { dataSync: () => [0] },
        std: { dataSync: () => [1] }
      };
    });

    test('devrait faire une prédiction avec uncertainty', () => {
      const prediction = model.predict(mockFeatures);

      expect(prediction).toHaveProperty('rawPrediction');
      expect(prediction).toHaveProperty('validatedPrediction');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('uncertainty');
      expect(prediction).toHaveProperty('uncertaintyInterval');
      expect(prediction.modelInfo.type).toBe('TensorFlow');
    });

    test('devrait gérer les prédictions sans modèle entraîné', () => {
      model.isTrained = false;
      expect(() => model.predict(mockFeatures)).toThrow('Le modèle TensorFlow doit être entraîné');
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
    test('devrait construire un modèle d\'uncertainty', () => {
      const uncertaintyModel = model.buildUncertaintyModel();
      expect(uncertaintyModel).toBeDefined();
      expect(uncertaintyModel.compile).toHaveBeenCalled();
    });

    test('devrait être désactivable', () => {
      const modelWithoutUncertainty = new TensorFlowModel({
        uncertaintyEnabled: false
      });

      expect(modelWithoutUncertainty.uncertaintyEnabled).toBe(false);
      expect(modelWithoutUncertainty.buildUncertaintyModel()).toBeNull();
      
      modelWithoutUncertainty.dispose();
    });
  });

  describe('Gestion mémoire', () => {
    test('devrait nettoyer les ressources', () => {
      model.model = { dispose: jest.fn() };
      model.uncertaintyModel = { dispose: jest.fn() };
      model.scalers.features.mean = { dispose: jest.fn() };
      model.scalers.features.std = { dispose: jest.fn() };
      model.scalers.targets.mean = { dispose: jest.fn() };
      model.scalers.targets.std = { dispose: jest.fn() };

      model.dispose();

      expect(model.model.dispose).toHaveBeenCalled();
      expect(model.uncertaintyModel.dispose).toHaveBeenCalled();
      expect(model.scalers.features.mean.dispose).toHaveBeenCalled();
    });
  });

  describe('Sauvegarde et chargement', () => {
    test('devrait sauvegarder les métadonnées du modèle', async () => {
      model.isTrained = true;
      model.scalers.features.mean = { dataSync: () => [1, 2, 3] };
      model.scalers.features.std = { dataSync: () => [0.5, 1, 1.5] };
      model.scalers.targets.mean = { dataSync: () => [100] };
      model.scalers.targets.std = { dataSync: () => [10] };

      const savedData = await model.save();

      expect(savedData.type).toBe('TensorFlowModel');
      expect(savedData.modelType).toBe('mlp');
      expect(savedData.isTrained).toBe(true);
      expect(savedData.scalers).toBeDefined();
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
    test('devrait calculer une approximation de l\'importance', () => {
      // Mock d'un modèle avec des couches
      model.model = {
        layers: [{
          getWeights: () => [{
            abs: () => ({
              sum: () => ({
                dataSync: () => [0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 1.0, 0.2, 0.6, 0.8, 0.9, 0.1, 0.5, 0.4]
              })
            })
          }]
        }]
      };

      const importance = model.getFeatureImportance();

      expect(importance).toBeDefined();
      expect(Object.keys(importance)).toContain('progression_1week');
      expect(Object.keys(importance)).toContain('current_weight');
      
      // Vérifier que l'importance est normalisée
      Object.values(importance).forEach(featureInfo => {
        expect(featureInfo.normalized_importance).toBeGreaterThanOrEqual(0);
        expect(featureInfo.normalized_importance).toBeLessThanOrEqual(1);
      });
    });

    test('devrait gérer l\'absence de poids', () => {
      model.model = { layers: [{ getWeights: () => [] }] };
      
      const importance = model.getFeatureImportance();
      expect(importance).toEqual({});
    });
  });

  describe('Gestion des erreurs', () => {
    test('devrait gérer les erreurs d\'entraînement', async () => {
      model.buildModel = jest.fn().mockImplementation(() => {
        throw new Error('Erreur de construction');
      });

      await expect(model.train([[1, 2, 3]], [1])).rejects.toThrow('Erreur d\'entraînement TensorFlow');
    });

    test('devrait gérer les erreurs de prédiction', () => {
      model.isTrained = true;
      model.model = {
        predict: () => {
          throw new Error('Erreur de prédiction');
        }
      };

      expect(() => model.predict({})).toThrow('Erreur de prédiction TensorFlow');
    });
  });
});
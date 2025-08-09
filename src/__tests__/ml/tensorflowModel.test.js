/**
 * Tests pour le modèle TensorFlow
 */

// Mock global require for TensorFlow BEFORE importing the module
const mockTensorFlowAPI = {
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue({
      history: {
        loss: [1.0, 0.8, 0.6],
        val_loss: [1.1, 0.9, 0.7]
      },
      epoch: [0, 1, 2]
    }),
    predict: jest.fn(() => ({
      dataSync: jest.fn(() => [1.5]),
      dispose: jest.fn(),
      shape: [1, 1],
      mul: jest.fn(() => ({ 
        dataSync: jest.fn(() => [1.5]),
        dispose: jest.fn(),
        add: jest.fn(() => ({
          dataSync: jest.fn(() => [1.5]),
          dispose: jest.fn()
        }))
      }))
    })),
    dispose: jest.fn(),
    layers: [
      {
        getWeights: jest.fn(() => [{
          abs: jest.fn().mockReturnValue({
            sum: jest.fn().mockReturnValue({
              dataSync: jest.fn().mockReturnValue([0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 1.0, 0.2, 0.6, 0.8, 0.9, 0.1, 0.5, 0.4])
            })
          })
        }])
      }
    ]
  })),
  layers: {
    inputLayer: jest.fn(() => ({})),
    dense: jest.fn(() => ({})),
    lstm: jest.fn(() => ({})),
    conv1d: jest.fn(() => ({})),
    maxPooling1d: jest.fn(() => ({})),
    globalAveragePooling1d: jest.fn(() => ({})),
    flatten: jest.fn(() => ({})),
    dropout: jest.fn(() => ({})),
    batchNormalization: jest.fn(() => ({}))
  },
  regularizers: {
    l2: jest.fn(() => ({}))
  },
  train: {
    adam: jest.fn(() => ({}))
  },
  losses: {
    meanSquaredError: jest.fn(() => ({
      dataSync: jest.fn(() => [1.5]),
      dispose: jest.fn()
    })),
    absoluteDifference: jest.fn(() => ({
      dataSync: jest.fn(() => [1.5]),
      dispose: jest.fn()
    }))
  },
  tensor1d: jest.fn(() => ({
    dataSync: jest.fn(() => [1.5]),
    dispose: jest.fn(),
    shape: [1, 15],
    mean: jest.fn((axis) => ({
      dataSync: jest.fn(() => axis ? [0, 0, 0] : [0]),
      dispose: jest.fn()
    })),
    std: jest.fn((axis) => ({
      dataSync: jest.fn(() => axis ? [1, 1, 1] : [1]),
      dispose: jest.fn()
    })),
    sub: jest.fn(() => ({
      dataSync: jest.fn(() => [1.5]),
      dispose: jest.fn(),
      div: jest.fn(() => ({
        dataSync: jest.fn(() => [1.5]),
        dispose: jest.fn(),
        square: jest.fn(() => ({
          dataSync: jest.fn(() => [1.5]),
          dispose: jest.fn(),
          mean: jest.fn(() => ({
            dataSync: jest.fn(() => [1.5]),
            dispose: jest.fn(),
            sqrt: jest.fn(() => ({
              dataSync: jest.fn(() => [1.5]),
              dispose: jest.fn(),
              add: jest.fn(() => ({
                dataSync: jest.fn(() => [1.5]),
                dispose: jest.fn()
              }))
            }))
          }))
        }))
      }))
    }))
  })),
  tensor2d: jest.fn(() => ({
    dataSync: jest.fn(() => [1.5]),
    dispose: jest.fn(),
    shape: [1, 15],
    mean: jest.fn((axis) => ({
      dataSync: jest.fn(() => axis ? [0, 0, 0] : [0]),
      dispose: jest.fn()
    })),
    sub: jest.fn(() => ({
      dataSync: jest.fn(() => [1.5]),
      dispose: jest.fn(),
      div: jest.fn(() => ({
        dataSync: jest.fn(() => [1.5]),
        dispose: jest.fn()
      }))
    }))
  })),
  tensor3d: jest.fn(() => ({
    dataSync: jest.fn(() => [1.5]),
    dispose: jest.fn(),
    shape: [1, 10, 15]
  })),
  scalar: jest.fn(() => ({
    dataSync: jest.fn(() => [1.5]),
    dispose: jest.fn()
  }))
};

// Mock require globally
const originalRequire = global.require;
global.require = jest.fn().mockImplementation((module) => {
  if (module === '@tensorflow/tfjs') {
    return mockTensorFlowAPI;
  }
  return originalRequire ? originalRequire(module) : require(module);
});

// Now import the TensorFlowModel
import { TensorFlowModel } from '../../utils/ml/models/tensorflowModel.js';

// Mock complet TensorFlow.js pour éviter les conflits
const createMockTensor = (value = [1.5]) => ({
  dataSync: jest.fn(() => Array.isArray(value) ? value : [value]),
  dispose: jest.fn(),
  shape: [1, 15],
  mean: jest.fn((axis) => createMockTensor(axis ? [0, 0, 0] : 0)),
  std: jest.fn((axis) => createMockTensor(axis ? [1, 1, 1] : 1)),
  sub: jest.fn(() => createMockTensor()),
  div: jest.fn(() => createMockTensor()),
  add: jest.fn(() => createMockTensor()),
  mul: jest.fn(() => createMockTensor()),
  slice: jest.fn(() => createMockTensor()),
  square: jest.fn(() => createMockTensor()),
  sqrt: jest.fn(() => createMockTensor()),
  sum: jest.fn(() => createMockTensor()),
  exp: jest.fn(() => createMockTensor()),
  abs: jest.fn(() => createMockTensor()),
  arraySync: jest.fn(() => [[1, 2, 3], [4, 5, 6]])
});

const createMockModel = () => ({
  add: jest.fn(),
  compile: jest.fn(),
  fit: jest.fn().mockResolvedValue({
    history: {
      loss: [1.0, 0.8, 0.6],
      val_loss: [1.1, 0.9, 0.7]
    },
    epoch: [0, 1, 2]
  }),
  predict: jest.fn(() => createMockTensor()),
  dispose: jest.fn(),
  layers: [
    {
      getWeights: jest.fn(() => [{
        abs: jest.fn().mockReturnValue({
          sum: jest.fn().mockReturnValue({
            dataSync: jest.fn().mockReturnValue([0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 1.0, 0.2, 0.6, 0.8, 0.9, 0.1, 0.5, 0.4])
          })
        })
      }])
    }
  ]
});

jest.mock('@tensorflow/tfjs', () => ({
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue({
      history: {
        loss: [1.0, 0.8, 0.6],
        val_loss: [1.1, 0.9, 0.7]
      },
      epoch: [0, 1, 2]
    }),
    predict: jest.fn(() => ({
      dataSync: jest.fn(() => [1.5]),
      dispose: jest.fn(),
      shape: [1, 1],
      mul: jest.fn(() => ({ 
        dataSync: jest.fn(() => [1.5]),
        dispose: jest.fn(),
        add: jest.fn(() => ({
          dataSync: jest.fn(() => [1.5]),
          dispose: jest.fn()
        }))
      }))
    })),
    dispose: jest.fn(),
    layers: [
      {
        getWeights: jest.fn(() => [{
          abs: jest.fn().mockReturnValue({
            sum: jest.fn().mockReturnValue({
              dataSync: jest.fn().mockReturnValue([0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 1.0, 0.2, 0.6, 0.8, 0.9, 0.1, 0.5, 0.4])
            })
          })
        }])
      }
    ]
  })),
  layers: {
    inputLayer: jest.fn(() => ({})),
    dense: jest.fn(() => ({})),
    lstm: jest.fn(() => ({})),
    conv1d: jest.fn(() => ({})),
    maxPooling1d: jest.fn(() => ({})),
    globalAveragePooling1d: jest.fn(() => ({})),
    flatten: jest.fn(() => ({})),
    dropout: jest.fn(() => ({})),
    batchNormalization: jest.fn(() => ({}))
  },
  regularizers: {
    l2: jest.fn(() => ({}))
  },
  train: {
    adam: jest.fn(() => ({}))
  },
  losses: {
    meanSquaredError: jest.fn(() => createMockTensor()),
    absoluteDifference: jest.fn(() => createMockTensor())
  },
  tensor1d: jest.fn(() => createMockTensor()),
  tensor2d: jest.fn(() => ({
    dataSync: jest.fn(() => [1.5]),
    dispose: jest.fn(),
    shape: [1, 15],
    sub: jest.fn(() => ({
      dataSync: jest.fn(() => [1.5]),
      dispose: jest.fn(),
      div: jest.fn(() => ({
        dataSync: jest.fn(() => [1.5]),
        dispose: jest.fn()
      }))
    }))
  })),
  tensor3d: jest.fn(() => createMockTensor()),
  scalar: jest.fn(() => createMockTensor()),
  model: jest.fn(() => createMockModel()),
  ready: jest.fn().mockResolvedValue(true)
}));

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
      model.model = createMockModel();
      model.scalers.features = {
        mean: createMockTensor(Array(15).fill(0)),
        std: createMockTensor(Array(15).fill(1))
      };
      model.scalers.targets = {
        mean: createMockTensor([0]),
        std: createMockTensor([1])
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
      const mockModel = createMockModel();
      const mockUncertaintyModel = createMockModel();
      const mockMean = createMockTensor();
      const mockStd = createMockTensor();
      const mockTargetMean = createMockTensor();
      const mockTargetStd = createMockTensor();

      model.model = mockModel;
      model.uncertaintyModel = mockUncertaintyModel;
      model.scalers.features.mean = mockMean;
      model.scalers.features.std = mockStd;
      model.scalers.targets.mean = mockTargetMean;
      model.scalers.targets.std = mockTargetStd;

      model.dispose();

      expect(mockModel.dispose).toHaveBeenCalled();
      expect(mockUncertaintyModel.dispose).toHaveBeenCalled();
      expect(mockMean.dispose).toHaveBeenCalled();
    });
  });

  describe('Sauvegarde et chargement', () => {
    test('devrait sauvegarder les métadonnées du modèle', async () => {
      model.model = createMockModel();
      model.isTrained = true;
      model.scalers.features.mean = createMockTensor([1, 2, 3]);
      model.scalers.features.std = createMockTensor([0.5, 1, 1.5]);
      model.scalers.targets.mean = createMockTensor([100]);
      model.scalers.targets.std = createMockTensor([10]);

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
      model.model = createMockModel();

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
      model.model = { 
        layers: [{ 
          getWeights: jest.fn(() => []) 
        }] 
      };
      
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
      model.model = createMockModel();
      model.model.predict.mockImplementation(() => {
        throw new Error('Erreur de prédiction');
      });

      expect(() => model.predict({})).toThrow('Erreur de prédiction TensorFlow');
    });
  });
});
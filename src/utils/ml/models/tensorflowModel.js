/**
 * Modèle TensorFlow.js avancé avec LSTM et uncertainty quantification
 * Remplace le neural network custom avec des architectures modernes
 */

import { validateMusculationPrediction } from '../musculationConstraints.js';

// Import conditionnel de TensorFlow pour éviter les conflits
let tf = null;

const loadTensorFlow = async () => {
  if (tf) return tf;
  
  try {
    tf = await import('@tensorflow/tfjs');
    return tf;
  } catch (error) {
    console.warn('TensorFlow.js non disponible:', error.message);
    return null;
  }
};

/**
 * Configuration des modèles TensorFlow
 */
const MODEL_CONFIGS = {
  lstm: {
    sequenceLength: 10,
    features: 15,
    lstmUnits: 32,
    denseUnits: [16, 8],
    dropout: 0.3,
    learningRate: 0.001,
    epochs: 100,
    batchSize: 16
  },
  cnn1d: {
    sequenceLength: 10,
    features: 15,
    filters: [16, 32],
    kernelSize: 3,
    denseUnits: [16, 8],
    dropout: 0.3,
    learningRate: 0.001,
    epochs: 100,
    batchSize: 16
  },
  mlp: {
    features: 15,
    hiddenUnits: [64, 32, 16],
    dropout: 0.3,
    learningRate: 0.001,
    epochs: 150,
    batchSize: 32
  }
};

/**
 * Classe principale pour les modèles TensorFlow
 */
export class TensorFlowModel {
  constructor(options = {}) {
    this.modelType = options.modelType || 'mlp'; // 'lstm', 'cnn1d', 'mlp'
    this.config = { ...MODEL_CONFIGS[this.modelType], ...options };
    this.uncertaintyEnabled = options.uncertaintyEnabled !== false;
    
    // Modèles
    this.model = null;
    this.uncertaintyModel = null;
    
    // État d'entraînement
    this.isTrained = false;
    this.trainingHistory = null;
    this.scalers = {
      features: { mean: null, std: null },
      targets: { mean: null, std: null }
    };
    
    // Métriques
    this.trainingMetrics = {
      loss: [],
      valLoss: [],
      accuracy: [],
      uncertaintyCalibration: null,
      modelType: this.modelType
    };
  }

  /**
   * Construit l'architecture du modèle selon le type
   */
  buildModel() {
    const { features, sequenceLength } = this.config;
    
    if (this.modelType === 'lstm') {
      return this.buildLSTMModel();
    } else if (this.modelType === 'cnn1d') {
      return this.buildCNN1DModel();
    } else {
      return this.buildMLPModel();
    }
  }

  /**
   * Construit un modèle LSTM pour séquences temporelles
   */
  buildLSTMModel() {
    const { sequenceLength, features, lstmUnits, denseUnits = [16, 8], dropout, learningRate } = this.config;
    
    const model = tf.sequential({
      layers: [
        // Couche d'entrée pour séquences
        tf.layers.inputLayer({ inputShape: [sequenceLength, features] }),
        
        // LSTM avec return_sequences=false pour la dernière sortie
        tf.layers.lstm({
          units: lstmUnits,
          returnSequences: false,
          dropout: dropout,
          recurrentDropout: dropout
        }),
        
        // Couches denses
        ...denseUnits.map((units, index) => [
          tf.layers.dense({ 
            units, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.dropout({ rate: dropout })
        ]).flat(),
        
        // Sortie finale
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  /**
   * Construit un modèle CNN 1D pour patterns temporels
   */
  buildCNN1DModel() {
    const { sequenceLength, features, filters = [16, 32], kernelSize, denseUnits = [16, 8], dropout, learningRate } = this.config;
    
    const model = tf.sequential({
      layers: [
        // Couche d'entrée
        tf.layers.inputLayer({ inputShape: [sequenceLength, features] }),
        
        // Couches convolutionnelles 1D
        ...filters.map((numFilters, index) => [
          tf.layers.conv1d({
            filters: numFilters,
            kernelSize: kernelSize,
            activation: 'relu',
            padding: 'same'
          }),
          tf.layers.maxPooling1d({ poolSize: 2 }),
          tf.layers.dropout({ rate: dropout })
        ]).flat(),
        
        // Aplatissement
        tf.layers.flatten(),
        
        // Couches denses
        ...denseUnits.map(units => [
          tf.layers.dense({ 
            units, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.dropout({ rate: dropout })
        ]).flat(),
        
        // Sortie
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  /**
   * Construit un MLP classique amélioré
   */
  buildMLPModel() {
    const { features, hiddenUnits, dropout, learningRate } = this.config;
    
    const model = tf.sequential({
      layers: [
        // Couche d'entrée
        tf.layers.inputLayer({ inputShape: [features] }),
        
        // Couches cachées avec batch normalization
        ...hiddenUnits.map((units, index) => [
          tf.layers.dense({ 
            units, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.batchNormalization(),
          tf.layers.dropout({ rate: dropout })
        ]).flat(),
        
        // Sortie
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  /**
   * Construit le modèle d'uncertainty quantification
   */
  buildUncertaintyModel() {
    if (!this.uncertaintyEnabled) return null;
    
    const { features } = this.config;
    const inputShape = this.modelType === 'mlp' ? [features] : [this.config.sequenceLength, features];
    
    // Modèle pour prédire la variance (uncertainty)
    const uncertaintyModel = tf.sequential({
      layers: [
        tf.layers.inputLayer({ inputShape }),
        
        // Architecture similaire mais plus simple
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        
        // Sortie: log variance pour stabilité numérique
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    uncertaintyModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return uncertaintyModel;
  }

  /**
   * Prépare les données pour l'entraînement
   */
  prepareTrainingData(features, targets) {
    // Normalisation des features
    const featureTensor = tf.tensor2d(features);
    const targetTensor = tf.tensor1d(targets);
    
    // Calcul des statistiques de normalisation
    this.scalers.features.mean = featureTensor.mean(0);
    this.scalers.features.std = featureTensor.sub(this.scalers.features.mean).square().mean(0).sqrt().add(1e-8);
    
    this.scalers.targets.mean = targetTensor.mean();
    this.scalers.targets.std = targetTensor.sub(this.scalers.targets.mean).square().mean().sqrt().add(1e-8);
    
    // Normalisation
    const normalizedFeatures = featureTensor.sub(this.scalers.features.mean).div(this.scalers.features.std);
    const normalizedTargets = targetTensor.sub(this.scalers.targets.mean).div(this.scalers.targets.std);
    
    // Reshape pour LSTM/CNN si nécessaire
    let finalFeatures = normalizedFeatures;
    if (this.modelType === 'lstm' || this.modelType === 'cnn1d') {
      finalFeatures = this.createSequences(normalizedFeatures, this.config.sequenceLength);
    }
    
    return {
      features: finalFeatures,
      targets: normalizedTargets,
      originalFeatures: featureTensor,
      originalTargets: targetTensor
    };
  }

  /**
   * Crée des séquences pour LSTM/CNN
   */
  createSequences(data, sequenceLength) {
    const sequences = [];
    const dataArray = data.arraySync();
    
    for (let i = sequenceLength; i < dataArray.length; i++) {
      const sequence = dataArray.slice(i - sequenceLength, i);
      sequences.push(sequence);
    }
    
    if (sequences.length === 0) {
      // Fallback: répéter les données disponibles
      const firstSequence = Array(sequenceLength).fill(dataArray[0] || Array(this.config.features).fill(0));
      sequences.push(firstSequence);
    }
    
    return tf.tensor3d(sequences);
  }

  /**
   * Entraîne le modèle principal
   */
  async train(features, targets, options = {}) {
    try {
      if (!features || !targets || features.length === 0) {
        throw new Error('Données d\'entraînement vides');
      }

      // Construire le modèle
      this.model = this.buildModel();
      if (this.uncertaintyEnabled) {
        this.uncertaintyModel = this.buildUncertaintyModel();
      }
      
      // Préparer les données
      const preparedData = this.prepareTrainingData(features, targets);
      
      // Split train/validation
      const trainSize = Math.floor(preparedData.features.shape[0] * 0.8);
      const trainFeatures = preparedData.features.slice([0, 0], [trainSize, -1]);
      const trainTargets = preparedData.targets.slice([0], [trainSize]);
      const valFeatures = preparedData.features.slice([trainSize, 0], [-1, -1]);
      const valTargets = preparedData.targets.slice([trainSize], [-1]);
      
      // Configuration d'entraînement
      const trainConfig = {
        epochs: this.config.epochs,
        batchSize: Math.min(this.config.batchSize, trainSize),
        validationData: valFeatures.shape[0] > 0 ? [valFeatures, valTargets] : undefined,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.trainingMetrics.loss.push(logs.loss);
            if (logs.val_loss) this.trainingMetrics.valLoss.push(logs.val_loss);
          }
        }
      };
      
      // Entraînement principal
      const history = await this.model.fit(trainFeatures, trainTargets, trainConfig);
      
      // Entraînement du modèle d'uncertainty
      if (this.uncertaintyModel && trainFeatures.shape[0] > 5) {
        await this.trainUncertaintyModel(trainFeatures, trainTargets, valFeatures, valTargets);
      }
      
      this.isTrained = true;
      this.trainingHistory = history;
      
      // Évaluation finale
      const finalMetrics = await this.evaluateModel(valFeatures, valTargets);
      
      // Nettoyage mémoire
      trainFeatures.dispose();
      trainTargets.dispose();
      valFeatures.dispose();
      valTargets.dispose();
      preparedData.features.dispose();
      preparedData.targets.dispose();
      
      return {
        modelType: this.modelType,
        finalLoss: history.history.loss[history.history.loss.length - 1],
        finalValLoss: history.history.val_loss ? history.history.val_loss[history.history.val_loss.length - 1] : null,
        epochs: history.epoch.length,
        ...finalMetrics
      };
      
    } catch (error) {
      throw new Error(`Erreur d'entraînement TensorFlow: ${error.message}`);
    }
  }

  /**
   * Entraîne le modèle d'uncertainty quantification
   */
  async trainUncertaintyModel(trainFeatures, trainTargets, valFeatures, valTargets) {
    // Faire des prédictions avec le modèle principal pour calculer les erreurs
    const predictions = this.model.predict(trainFeatures);
    const errors = trainTargets.sub(predictions).square();
    
    // Entraîner le modèle d'uncertainty à prédire les erreurs
    await this.uncertaintyModel.fit(trainFeatures, errors, {
      epochs: Math.floor(this.config.epochs * 0.5),
      batchSize: this.config.batchSize,
      validationData: valFeatures.shape[0] > 0 ? [valFeatures, valTargets] : undefined,
      shuffle: true,
      verbose: 0
    });
    
    predictions.dispose();
    errors.dispose();
  }

  /**
   * Évalue le modèle
   */
  async evaluateModel(valFeatures, valTargets) {
    if (!this.model || valFeatures.shape[0] === 0) {
      return { mse: 0, mae: 0, r2: 0 };
    }
    
    const predictions = this.model.predict(valFeatures);
    const mse = tf.losses.meanSquaredError(valTargets, predictions).dataSync()[0];
    const mae = tf.losses.absoluteDifference(valTargets, predictions).dataSync()[0];
    
    // R²
    const targetMean = valTargets.mean();
    const ssRes = valTargets.sub(predictions).square().sum();
    const ssTot = valTargets.sub(targetMean).square().sum();
    const r2 = tf.scalar(1).sub(ssRes.div(ssTot)).dataSync()[0];
    
    predictions.dispose();
    targetMean.dispose();
    ssRes.dispose();
    ssTot.dispose();
    
    return { mse, mae, r2 };
  }

  /**
   * Fait une prédiction avec uncertainty quantification
   */
  predict(features) {
    if (!this.isTrained || !this.model) {
      throw new Error('Le modèle TensorFlow doit être entraîné avant de faire des prédictions');
    }

    try {
      // Normalisation des features
      const featureArray = this.convertFeaturesToArray(features);
      let inputTensor = tf.tensor2d([featureArray]);
      
      // Normalisation
      inputTensor = inputTensor.sub(this.scalers.features.mean).div(this.scalers.features.std);
      
      // Reshape pour séquences si nécessaire
      if (this.modelType === 'lstm' || this.modelType === 'cnn1d') {
        // Pour une prédiction unique, répéter la feature pour créer une séquence
        const sequence = Array(this.config.sequenceLength).fill(featureArray);
        inputTensor.dispose();
        inputTensor = tf.tensor3d([sequence]);
        inputTensor = inputTensor.sub(this.scalers.features.mean).div(this.scalers.features.std);
      }
      
      // Prédiction principale
      const normalizedPrediction = this.model.predict(inputTensor);
      const rawPrediction = normalizedPrediction.mul(this.scalers.targets.std).add(this.scalers.targets.mean);
      const predictionValue = rawPrediction.dataSync()[0];
      
      // Uncertainty quantification
      let uncertainty = 0.5; // Défaut
      let confidence = 75;
      
      if (this.uncertaintyModel) {
        const logVariance = this.uncertaintyModel.predict(inputTensor);
        const variance = logVariance.exp();
        uncertainty = Math.sqrt(variance.dataSync()[0]);
        
        // Convertir uncertainty en confidence (inverse relationship)
        confidence = Math.max(40, Math.min(95, 90 - uncertainty * 20));
      }
      
      // Validation avec contraintes de musculation
      const currentWeight = features.currentWeight || features.current_weight || 0;
      const validatedPrediction = validateMusculationPrediction(
        predictionValue,
        currentWeight,
        features.userLevel || 'intermediate',
        features.exerciseType || features.exercise_type || 'compound'
      );
      
      // Nettoyage mémoire
      inputTensor.dispose();
      normalizedPrediction.dispose();
      rawPrediction.dispose();
      
      return {
        rawPrediction: predictionValue,
        validatedPrediction: validatedPrediction.validatedWeight,
        increment: validatedPrediction.increment,
        confidence: confidence,
        uncertainty: uncertainty,
        uncertaintyInterval: [
          Math.max(0, predictionValue - uncertainty * 1.96),
          predictionValue + uncertainty * 1.96
        ],
        modelInfo: {
          type: 'TensorFlow',
          architecture: this.modelType.toUpperCase(),
          uncertaintyEnabled: this.uncertaintyEnabled
        },
        constraints: validatedPrediction.appliedConstraints,
        recommendations: validatedPrediction.recommendations
      };
      
    } catch (error) {
      throw new Error(`Erreur de prédiction TensorFlow: ${error.message}`);
    }
  }

  /**
   * Convertit les features en array
   */
  convertFeaturesToArray(features) {
    return [
      features.progression_1week || 0,
      features.progression_2weeks || 0,
      features.progression_4weeks || 0,
      features.frequency_1week || 0,
      features.frequency_2weeks || 0,
      features.consistency_score || 0,
      features.momentum_score || 0,
      features.current_weight || 0,
      features.max_weight || 0,
      features.avg_weight || 0,
      features.total_volume || 0,
      features.intensity_score || 0,
      features.is_compound_exercise ? 1 : 0,
      features.realistic_progression_rate || 0,
      features.exercise_experience || 0
    ];
  }

  /**
   * Retourne l'importance des features (approximation)
   */
  getFeatureImportance() {
    if (!this.model) return {};
    
    const featureNames = [
      'progression_1week', 'progression_2weeks', 'progression_4weeks',
      'frequency_1week', 'frequency_2weeks', 'consistency_score',
      'momentum_score', 'current_weight', 'max_weight', 'avg_weight',
      'total_volume', 'intensity_score', 'is_compound_exercise',
      'realistic_progression_rate', 'exercise_experience'
    ];
    
    // Approximation basée sur les poids de la première couche
    const weights = this.model.layers[0].getWeights()[0];
    if (!weights) return {};
    
    const weightValues = weights.abs().sum(1).dataSync();
    const importance = {};
    
    featureNames.forEach((name, index) => {
      if (index < weightValues.length) {
        importance[name] = {
          normalized_importance: weightValues[index] / Math.max(...weightValues),
          absolute_weight: weightValues[index]
        };
      }
    });
    
    return importance;
  }

  /**
   * Sauvegarde le modèle
   */
  async save() {
    if (!this.model) return null;
    
    // Pour l'instant, on sauvegarde juste les métadonnées
    // TensorFlow.js peut sauvegarder vers IndexedDB ou localStorage
    return {
      type: 'TensorFlowModel',
      modelType: this.modelType,
      config: this.config,
      scalers: {
        features: {
          mean: this.scalers.features.mean?.dataSync(),
          std: this.scalers.features.std?.dataSync()
        },
        targets: {
          mean: this.scalers.targets.mean?.dataSync()?.[0],
          std: this.scalers.targets.std?.dataSync()?.[0]
        }
      },
      trainingMetrics: this.trainingMetrics,
      isTrained: this.isTrained,
      uncertaintyEnabled: this.uncertaintyEnabled
    };
  }

  /**
   * Charge un modèle sauvegardé
   */
  async load(modelData) {
    this.modelType = modelData.modelType || 'mlp';
    this.config = modelData.config || MODEL_CONFIGS[this.modelType];
    this.trainingMetrics = modelData.trainingMetrics || this.trainingMetrics;
    this.isTrained = modelData.isTrained || false;
    this.uncertaintyEnabled = modelData.uncertaintyEnabled !== false;
    
    // Restaurer les scalers
    if (modelData.scalers) {
      if (modelData.scalers.features.mean) {
        this.scalers.features.mean = tf.tensor1d(modelData.scalers.features.mean);
        this.scalers.features.std = tf.tensor1d(modelData.scalers.features.std);
      }
      if (modelData.scalers.targets.mean !== undefined) {
        this.scalers.targets.mean = tf.scalar(modelData.scalers.targets.mean);
        this.scalers.targets.std = tf.scalar(modelData.scalers.targets.std);
      }
    }
  }

  /**
   * Nettoie les ressources TensorFlow
   */
  dispose() {
    if (this.model && typeof this.model.dispose === 'function') {
      this.model.dispose();
      this.model = null;
    }
    if (this.uncertaintyModel && typeof this.uncertaintyModel.dispose === 'function') {
      this.uncertaintyModel.dispose();
      this.uncertaintyModel = null;
    }
    
    // Nettoyer les scalers
    if (this.scalers.features.mean && typeof this.scalers.features.mean.dispose === 'function') {
      this.scalers.features.mean.dispose();
    }
    if (this.scalers.features.std && typeof this.scalers.features.std.dispose === 'function') {
      this.scalers.features.std.dispose();
    }
    if (this.scalers.targets.mean && typeof this.scalers.targets.mean.dispose === 'function') {
      this.scalers.targets.mean.dispose();
    }
    if (this.scalers.targets.std && typeof this.scalers.targets.std.dispose === 'function') {
      this.scalers.targets.std.dispose();
    }
  }
}

export default TensorFlowModel;
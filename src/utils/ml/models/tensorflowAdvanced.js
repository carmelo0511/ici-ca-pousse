/**
 * Modèles TensorFlow avancés - Phase 2
 * CNN 1D et autoencodeurs pour détection d'anomalies
 */

import * as tf from '@tensorflow/tfjs';
// import { validateMusculationPrediction } from '../musculationConstraints.js';

/**
 * Modèle CNN 1D pour détection de patterns dans les séries temporelles
 */
export class CNN1DPatternDetector {
  constructor(options = {}) {
    this.config = {
      sequenceLength: options.sequenceLength || 12,
      features: options.features || 15,
      filters: options.filters || [32, 64, 32],
      kernelSizes: options.kernelSizes || [3, 3, 3],
      poolSize: options.poolSize || 2,
      dropout: options.dropout || 0.3,
      learningRate: options.learningRate || 0.001,
      epochs: options.epochs || 150,
      batchSize: options.batchSize || 16
    };
    
    this.model = null;
    this.isTrained = false;
    this.scalers = { mean: null, std: null };
    this.patternTypes = ['plateau', 'growth', 'decline', 'volatile', 'stable'];
  }

  /**
   * Construit le modèle CNN 1D
   */
  buildModel() {
    const { sequenceLength, features, filters, kernelSizes, poolSize, dropout, learningRate } = this.config;
    
    const model = tf.sequential();
    
    // Couche d'entrée
    model.add(tf.layers.inputLayer({ inputShape: [sequenceLength, features] }));
    
    // Stack de couches convolutionnelles
    filters.forEach((numFilters, index) => {
      model.add(tf.layers.conv1d({
        filters: numFilters,
        kernelSize: kernelSizes[index] || 3,
        activation: 'relu',
        padding: 'same',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
      }));
      
      model.add(tf.layers.batchNormalization());
      
      if (index < filters.length - 1) {
        model.add(tf.layers.maxPooling1d({ poolSize }));
      }
      
      model.add(tf.layers.dropout({ rate: dropout }));
    });
    
    // Global pooling pour réduire la dimension
    model.add(tf.layers.globalAveragePooling1d());
    
    // Couches denses pour classification
    model.add(tf.layers.dense({ 
      units: 64, 
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));
    model.add(tf.layers.dropout({ rate: dropout }));
    
    model.add(tf.layers.dense({ 
      units: 32, 
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));
    model.add(tf.layers.dropout({ rate: dropout }));
    
    // Sortie multi-classe pour types de patterns
    model.add(tf.layers.dense({ 
      units: this.patternTypes.length, 
      activation: 'softmax' 
    }));
    
    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  /**
   * Analyse les patterns dans l'historique d'exercices
   */
  async analyzePatterns(exerciseHistory) {
    if (!this.isTrained || !this.model) {
      // Mode d'inférence basé sur des règles
      return this.analyzePatternsFallback(exerciseHistory);
    }
    
    try {
      // Préparer la séquence
      const sequence = this.prepareSequence(exerciseHistory);
      if (!sequence) {
        return this.analyzePatternsFallback(exerciseHistory);
      }
      
      // Prédiction
      const prediction = this.model.predict(sequence);
      const probabilities = prediction.dataSync();
      
      // Interpréter les résultats
      const patterns = this.patternTypes.map((type, index) => ({
        type,
        probability: probabilities[index],
        confidence: probabilities[index] > 0.6 ? 'high' : probabilities[index] > 0.4 ? 'medium' : 'low'
      })).sort((a, b) => b.probability - a.probability);
      
      sequence.dispose();
      prediction.dispose();
      
      return {
        dominantPattern: patterns[0],
        allPatterns: patterns,
        interpretation: this.interpretPattern(patterns[0]),
        recommendations: this.generatePatternRecommendations(patterns[0])
      };
      
    } catch (error) {
      return this.analyzePatternsFallback(exerciseHistory);
    }
  }

  /**
   * Analyse de fallback basée sur des règles
   */
  analyzePatternsFallback(exerciseHistory) {
    if (!exerciseHistory || exerciseHistory.length < 3) {
      return {
        dominantPattern: { type: 'insufficient_data', probability: 1.0, confidence: 'high' },
        interpretation: 'Pas assez de données pour analyser les patterns',
        recommendations: ['Continuez à enregistrer vos séances']
      };
    }
    
    // Analyser les tendances
    const weights = exerciseHistory.map(h => h.weight).slice(-6); // 6 dernières séances
    const trend = this.calculateTrend(weights);
    const volatility = this.calculateVolatility(weights);
    
    let patternType = 'stable';
    if (Math.abs(trend) < 0.1 && volatility < 0.5) {
      patternType = 'stable';
    } else if (trend > 0.2) {
      patternType = 'growth';
    } else if (trend < -0.2) {
      patternType = 'decline';
    } else if (volatility > 1.0) {
      patternType = 'volatile';
    } else {
      patternType = 'plateau';
    }
    
    return {
      dominantPattern: { type: patternType, probability: 0.8, confidence: 'medium' },
      interpretation: this.interpretPattern({ type: patternType }),
      recommendations: this.generatePatternRecommendations({ type: patternType })
    };
  }

  calculateTrend(weights) {
    if (weights.length < 2) return 0;
    
    const n = weights.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = weights;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  calculateVolatility(weights) {
    if (weights.length < 2) return 0;
    
    const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
    const variance = weights.reduce((acc, w) => acc + (w - mean) ** 2, 0) / weights.length;
    return Math.sqrt(variance);
  }

  interpretPattern(pattern) {
    const interpretations = {
      plateau: 'Pattern de plateau détecté - Progression stagnante',
      growth: 'Pattern de croissance - Progression régulière',
      decline: 'Pattern de déclin - Performance en baisse',
      volatile: 'Pattern volatile - Fluctuations importantes',
      stable: 'Pattern stable - Performance consistante',
      insufficient_data: 'Données insuffisantes pour l\'analyse'
    };
    
    return interpretations[pattern.type] || 'Pattern non reconnu';
  }

  generatePatternRecommendations(pattern) {
    const recommendations = {
      plateau: [
        '🔄 Changez de programme d\'entraînement',
        '📈 Augmentez l\'intensité ou le volume',
        '⏸️ Considérez une semaine de décharge'
      ],
      growth: [
        '✅ Continuez sur cette voie',
        '🎯 Maintenez la progression actuelle',
        '📊 Surveillez les signes de fatigue'
      ],
      decline: [
        '⚠️ Vérifiez votre récupération',
        '💤 Assurez-vous de dormir suffisamment',
        '🍽️ Contrôlez votre nutrition'
      ],
      volatile: [
        '📈 Recherchez plus de consistance',
        '⚖️ Standardisez vos conditions d\'entraînement',
        '📝 Tenez un journal détaillé'
      ],
      stable: [
        '🎯 Performance stable - Bon travail',
        '📊 Prêt pour une progression challenge'
      ],
      insufficient_data: [
        '📊 Continuez à enregistrer vos séances',
        '⏱️ Patientez pour l\'analyse des patterns'
      ]
    };
    
    return recommendations[pattern.type] || ['Continuez vos efforts'];
  }

  prepareSequence(exerciseHistory) {
    if (exerciseHistory.length < this.config.sequenceLength) {
      return null;
    }
    
    // Extraire les features pertinentes
    const sequence = exerciseHistory.slice(-this.config.sequenceLength).map(entry => [
      entry.weight || 0,
      entry.reps || 0,
      entry.sets || 0,
      entry.volume || (entry.weight * entry.reps * entry.sets) || 0,
      entry.difficulty || 0,
      // Features temporelles calculées
      ...Array(10).fill(0) // Placeholder pour autres features
    ]);
    
    return tf.tensor3d([sequence]);
  }
}

/**
 * Autoencodeur pour détection d'anomalies dans les performances
 */
export class PerformanceAnomalyDetector {
  constructor(options = {}) {
    this.config = {
      inputDim: options.inputDim || 15,
      encodingDim: options.encodingDim || 8,
      hiddenDims: options.hiddenDims || [12, 10],
      learningRate: options.learningRate || 0.001,
      epochs: options.epochs || 200,
      batchSize: options.batchSize || 16,
      anomalyThreshold: options.anomalyThreshold || 2.0
    };
    
    this.encoder = null;
    this.decoder = null;
    this.autoencoder = null;
    this.isTrained = false;
    this.reconstructionErrors = [];
    this.anomalyThreshold = this.config.anomalyThreshold;
  }

  /**
   * Construit l'autoencodeur
   */
  buildAutoencoder() {
    const { inputDim, encodingDim, hiddenDims, learningRate } = this.config;
    
    // Encodeur
    const encoderInput = tf.input({ shape: [inputDim] });
    let encoded = encoderInput;
    
    // Couches cachées de l'encodeur
    hiddenDims.forEach((dim, index) => {
      encoded = tf.layers.dense({
        units: dim,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
        name: `encoder_hidden_${index}`
      }).apply(encoded);
      
      encoded = tf.layers.dropout({ rate: 0.2 }).apply(encoded);
    });
    
    // Couche d'encodage
    encoded = tf.layers.dense({
      units: encodingDim,
      activation: 'relu',
      name: 'encoded'
    }).apply(encoded);
    
    // Décodeur
    let decoded = encoded;
    
    // Couches cachées du décodeur (ordre inverse)
    [...hiddenDims].reverse().forEach((dim, index) => {
      decoded = tf.layers.dense({
        units: dim,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
        name: `decoder_hidden_${index}`
      }).apply(decoded);
      
      decoded = tf.layers.dropout({ rate: 0.2 }).apply(decoded);
    });
    
    // Sortie du décodeur
    const decoderOutput = tf.layers.dense({
      units: inputDim,
      activation: 'linear',
      name: 'decoded'
    }).apply(decoded);
    
    // Modèle complet
    this.autoencoder = tf.model({
      inputs: encoderInput,
      outputs: decoderOutput,
      name: 'autoencoder'
    });
    
    this.autoencoder.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    // Modèles séparés pour encodage
    this.encoder = tf.model({
      inputs: encoderInput,
      outputs: encoded,
      name: 'encoder'
    });
    
    return this.autoencoder;
  }

  /**
   * Entraîne l'autoencodeur sur des données normales
   */
  async train(normalData, options = {}) {
    if (!normalData || normalData.length === 0) {
      throw new Error('Données d\'entraînement vides');
    }
    
    // Construire le modèle
    this.autoencoder = this.buildAutoencoder();
    
    // Préparer les données
    const dataTensor = tf.tensor2d(normalData);
    
    // Normalisation
    const mean = dataTensor.mean(0);
    const std = dataTensor.sub(mean).square().mean(0).sqrt().add(1e-8);
    const normalizedData = dataTensor.sub(mean).div(std);
    
    // Split train/validation
    const trainSize = Math.floor(normalData.length * 0.8);
    const trainData = normalizedData.slice([0, 0], [trainSize, -1]);
    const valData = normalizedData.slice([trainSize, 0], [-1, -1]);
    
    // Entraînement (autoencoder apprend à reconstruire l'entrée)
    const history = await this.autoencoder.fit(trainData, trainData, {
      epochs: this.config.epochs,
      batchSize: this.config.batchSize,
      validationData: valData.shape[0] > 0 ? [valData, valData] : undefined,
      shuffle: true,
      verbose: 0
    });
    
    // Calculer le seuil d'anomalie basé sur les erreurs de reconstruction
    const reconstructed = this.autoencoder.predict(trainData);
    const errors = trainData.sub(reconstructed).square().mean(1);
    const errorArray = errors.dataSync();
    
    // Seuil = moyenne + 2 * écart-type
    const meanError = errorArray.reduce((a, b) => a + b, 0) / errorArray.length;
    const stdError = Math.sqrt(errorArray.reduce((acc, err) => acc + (err - meanError) ** 2, 0) / errorArray.length);
    
    this.anomalyThreshold = meanError + 2 * stdError;
    this.reconstructionErrors = errorArray;
    
    // Nettoyage
    dataTensor.dispose();
    normalizedData.dispose();
    trainData.dispose();
    valData.dispose();
    reconstructed.dispose();
    errors.dispose();
    
    this.isTrained = true;
    
    return {
      modelType: 'Autoencoder',
      finalLoss: history.history.loss[history.history.loss.length - 1],
      anomalyThreshold: this.anomalyThreshold,
      trainingSamples: normalData.length
    };
  }

  /**
   * Détecte les anomalies dans de nouvelles données
   */
  async detectAnomalies(newData) {
    if (!this.isTrained || !this.autoencoder) {
      throw new Error('L\'autoencodeur doit être entraîné avant de détecter des anomalies');
    }
    
    try {
      const dataTensor = tf.tensor2d([newData]);
      
      // Reconstruction
      const reconstructed = this.autoencoder.predict(dataTensor);
      
      // Erreur de reconstruction
      const error = dataTensor.sub(reconstructed).square().mean(1).dataSync()[0];
      
      // Détection d'anomalie
      const isAnomaly = error > this.anomalyThreshold;
      const anomalyScore = error / this.anomalyThreshold;
      
      let severity = 'normal';
      if (anomalyScore > 2.0) {
        severity = 'critical';
      } else if (anomalyScore > 1.5) {
        severity = 'high';
      } else if (anomalyScore > 1.0) {
        severity = 'moderate';
      }
      
      dataTensor.dispose();
      reconstructed.dispose();
      
      return {
        isAnomaly,
        anomalyScore,
        severity,
        reconstructionError: error,
        threshold: this.anomalyThreshold,
        interpretation: this.interpretAnomaly(isAnomaly, severity, anomalyScore),
        recommendations: this.generateAnomalyRecommendations(isAnomaly, severity)
      };
      
    } catch (error) {
      throw new Error(`Erreur de détection d'anomalie: ${error.message}`);
    }
  }

  interpretAnomaly(isAnomaly, severity, score) {
    if (!isAnomaly) {
      return 'Performance normale - Aucune anomalie détectée';
    }
    
    const interpretations = {
      moderate: `Anomalie modérée détectée (score: ${score.toFixed(2)})`,
      high: `Anomalie importante détectée (score: ${score.toFixed(2)})`,
      critical: `Anomalie critique détectée (score: ${score.toFixed(2)}) - Investigation recommandée`
    };
    
    return interpretations[severity] || 'Anomalie détectée';
  }

  generateAnomalyRecommendations(isAnomaly, severity) {
    if (!isAnomaly) {
      return ['✅ Performance dans la normale'];
    }
    
    const recommendations = {
      moderate: [
        '🔍 Vérifiez vos conditions d\'entraînement',
        '📊 Surveillez cette tendance'
      ],
      high: [
        '⚠️ Performance inhabituelle détectée',
        '💤 Vérifiez votre récupération',
        '🍽️ Contrôlez votre nutrition'
      ],
      critical: [
        '🚨 Anomalie majeure - Arrêtez l\'entraînement',
        '🏥 Consultez un professionnel si nécessaire',
        '📝 Analysez en détail cette séance'
      ]
    };
    
    return recommendations[severity] || ['🔍 Surveillez cette performance'];
  }

  /**
   * Obtient l'encodage latent d'une donnée
   */
  encode(data) {
    if (!this.encoder) {
      throw new Error('Encodeur non disponible');
    }
    
    const dataTensor = tf.tensor2d([data]);
    const encoded = this.encoder.predict(dataTensor);
    const result = encoded.dataSync();
    
    dataTensor.dispose();
    encoded.dispose();
    
    return result;
  }

  /**
   * Nettoie les ressources
   */
  dispose() {
    if (this.autoencoder) {
      this.autoencoder.dispose();
    }
    if (this.encoder) {
      this.encoder.dispose();
    }
    if (this.decoder) {
      this.decoder.dispose();
    }
  }
}

const tensorflowAdvanced = {
  CNN1DPatternDetector,
  PerformanceAnomalyDetector
};

export default tensorflowAdvanced;
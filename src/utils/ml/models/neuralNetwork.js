/**
 * Modèle de réseau de neurones simple pour prédiction de poids
 * Implémentation d'un perceptron multicouche avec backpropagation
 */

import { validateMusculationPrediction } from '../musculationConstraints.js';

/**
 * Fonctions d'activation
 */
const ActivationFunctions = {
  relu: {
    forward: (x) => Math.max(0, x),
    backward: (x) => x > 0 ? 1 : 0
  },
  
  sigmoid: {
    forward: (x) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))), // Clip pour éviter overflow
    backward: (x) => {
      const s = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
      return s * (1 - s);
    }
  },
  
  tanh: {
    forward: (x) => Math.tanh(x),
    backward: (x) => 1 - Math.pow(Math.tanh(x), 2)
  },
  
  linear: {
    forward: (x) => x,
    backward: (x) => 1
  }
};

/**
 * Classe pour une couche dense du réseau
 */
class DenseLayer {
  constructor(inputSize, outputSize, activation = 'relu') {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.activation = ActivationFunctions[activation];
    
    // Initialisation Xavier/Glorot
    const limit = Math.sqrt(6.0 / (inputSize + outputSize));
    this.weights = Array(outputSize).fill().map(() => 
      Array(inputSize).fill().map(() => (Math.random() * 2 - 1) * limit)
    );
    this.biases = Array(outputSize).fill(0);
    
    // Pour la backpropagation
    this.lastInput = null;
    this.lastPreActivation = null;
    this.lastOutput = null;
    
    // Gradients
    this.weightGradients = null;
    this.biasGradients = null;
  }

  /**
   * Forward pass
   */
  forward(input) {
    this.lastInput = [...input];
    this.lastPreActivation = [];
    this.lastOutput = [];
    
    for (let i = 0; i < this.outputSize; i++) {
      let sum = this.biases[i];
      for (let j = 0; j < this.inputSize; j++) {
        sum += this.weights[i][j] * input[j];
      }
      
      this.lastPreActivation[i] = sum;
      this.lastOutput[i] = this.activation.forward(sum);
    }
    
    return [...this.lastOutput];
  }

  /**
   * Backward pass
   */
  backward(gradOutput) {
    const gradInput = Array(this.inputSize).fill(0);
    this.weightGradients = Array(this.outputSize).fill().map(() => Array(this.inputSize).fill(0));
    this.biasGradients = Array(this.outputSize).fill(0);
    
    for (let i = 0; i < this.outputSize; i++) {
      const gradActivation = gradOutput[i] * this.activation.backward(this.lastPreActivation[i]);
      
      // Gradient des biais
      this.biasGradients[i] = gradActivation;
      
      // Gradients des poids et propagation vers l'entrée
      for (let j = 0; j < this.inputSize; j++) {
        this.weightGradients[i][j] = gradActivation * this.lastInput[j];
        gradInput[j] += gradActivation * this.weights[i][j];
      }
    }
    
    return gradInput;
  }

  /**
   * Met à jour les paramètres
   */
  updateParameters(learningRate, regularization = 0) {
    for (let i = 0; i < this.outputSize; i++) {
      // Mise à jour des biais
      this.biases[i] -= learningRate * this.biasGradients[i];
      
      // Mise à jour des poids avec régularisation L2
      for (let j = 0; j < this.inputSize; j++) {
        const regularizationTerm = regularization * this.weights[i][j];
        this.weights[i][j] -= learningRate * (this.weightGradients[i][j] + regularizationTerm);
      }
    }
  }

  /**
   * Applique le dropout pendant l'entraînement
   */
  applyDropout(output, dropoutRate) {
    if (dropoutRate <= 0) return output;
    
    return output.map(val => {
      if (Math.random() < dropoutRate) {
        return 0;
      } else {
        return val / (1 - dropoutRate); // Scaling pour compenser
      }
    });
  }
}

/**
 * Classe principale du réseau de neurones
 */
export class NeuralNetworkModel {
  constructor(options = {}) {
    this.layers = options.layers || [15, 10, 5, 1]; // Architecture par défaut
    this.learningRate = options.learningRate || 0.001;
    this.epochs = options.epochs || 500;
    this.batchSize = options.batchSize || 32;
    this.regularization = options.regularization || 0.01;
    this.dropoutRate = options.dropoutRate || 0.2;
    this.earlyStoppingPatience = options.earlyStoppingPatience || 50;
    
    this.network = [];
    this.isTrained = false;
    
    // Historique d'entraînement
    this.trainingHistory = {
      loss: [],
      validationLoss: [],
      epochs: 0,
      bestValidationLoss: Infinity,
      bestWeights: null
    };
    
    // Normalisation
    this.featureMeans = [];
    this.featureStds = [];
    this.targetMean = 0;
    this.targetStd = 1;
  }

  /**
   * Construit l'architecture du réseau
   */
  buildNetwork() {
    this.network = [];
    
    for (let i = 0; i < this.layers.length - 1; i++) {
      const inputSize = this.layers[i];
      const outputSize = this.layers[i + 1];
      
      // Dernière couche utilise l'activation linéaire pour la régression
      const activation = (i === this.layers.length - 2) ? 'linear' : 'relu';
      
      this.network.push(new DenseLayer(inputSize, outputSize, activation));
    }
  }

  /**
   * Entraîne le réseau de neurones
   */
  async train(features, targets, options = {}) {
    if (!features || !targets || features.length === 0) {
      throw new Error('Features et targets ne peuvent pas être vides');
    }

    // Split temporel pour validation
    const { trainFeatures, trainTargets, valFeatures, valTargets } = 
      this.temporalSplit(features, targets, options.validationSplit || 0.2);

    // Normalisation
    this.normalizeData(trainFeatures, trainTargets);
    const normalizedTrainFeatures = this.normalizeFeatures(trainFeatures);
    const normalizedTrainTargets = this.normalizeTargets(trainTargets);
    
    let normalizedValFeatures = [];
    let normalizedValTargets = [];
    if (valFeatures.length > 0) {
      normalizedValFeatures = this.normalizeFeatures(valFeatures);
      normalizedValTargets = this.normalizeTargets(valTargets);
    }

    // Construire le réseau
    this.buildNetwork();
    
    // Variables pour early stopping
    let patienceCounter = 0;
    let bestValidationLoss = Infinity;

    // Boucle d'entraînement
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      // Mélanger les données d'entraînement
      const shuffledData = this.shuffleData(normalizedTrainFeatures, normalizedTrainTargets);
      
      let epochLoss = 0;
      let batchCount = 0;
      
      // Entraînement par mini-batch
      for (let i = 0; i < shuffledData.features.length; i += this.batchSize) {
        const batchFeatures = shuffledData.features.slice(i, i + this.batchSize);
        const batchTargets = shuffledData.targets.slice(i, i + this.batchSize);
        
        const batchLoss = this.trainBatch(batchFeatures, batchTargets);
        epochLoss += batchLoss;
        batchCount++;
      }
      
      epochLoss /= batchCount;
      this.trainingHistory.loss.push(epochLoss);
      
      // Validation
      let validationLoss = 0;
      if (normalizedValFeatures.length > 0) {
        validationLoss = this.calculateValidationLoss(normalizedValFeatures, normalizedValTargets);
        this.trainingHistory.validationLoss.push(validationLoss);
        
        // Early stopping
        if (validationLoss < bestValidationLoss) {
          bestValidationLoss = validationLoss;
          this.trainingHistory.bestValidationLoss = validationLoss;
          this.saveWeights();
          patienceCounter = 0;
        } else {
          patienceCounter++;
          
          if (patienceCounter >= this.earlyStoppingPatience) {
            console.log(`Early stopping à l'époque ${epoch + 1}`);
            break;
          }
        }
      }
      
      this.trainingHistory.epochs = epoch + 1;
      
      // Logging périodique
      if ((epoch + 1) % 50 === 0) {
        console.log(`Époque ${epoch + 1}/${this.epochs}, Loss: ${epochLoss.toFixed(4)}, Val Loss: ${validationLoss.toFixed(4)}`);
      }
    }
    
    // Restaurer les meilleurs poids si early stopping
    if (this.trainingHistory.bestWeights) {
      this.loadWeights();
    }
    
    this.isTrained = true;
    
    return {
      finalLoss: this.trainingHistory.loss[this.trainingHistory.loss.length - 1],
      bestValidationLoss: this.trainingHistory.bestValidationLoss,
      epochs: this.trainingHistory.epochs,
      earlyStopped: patienceCounter >= this.earlyStoppingPatience
    };
  }

  /**
   * Entraîne un mini-batch
   */
  trainBatch(batchFeatures, batchTargets) {
    const batchSize = batchFeatures.length;
    let batchLoss = 0;
    
    // Accumuler les gradients pour le batch
    const accumulatedGradients = this.network.map(layer => ({
      weightGradients: Array(layer.outputSize).fill().map(() => Array(layer.inputSize).fill(0)),
      biasGradients: Array(layer.outputSize).fill(0)
    }));
    
    // Forward et backward pass pour chaque échantillon du batch
    for (let i = 0; i < batchSize; i++) {
      const features = batchFeatures[i];
      const target = batchTargets[i];
      
      // Forward pass
      const prediction = this.forward(features, true); // true = training mode (dropout)
      
      // Calculer la loss
      const loss = Math.pow(prediction[0] - target, 2) / 2;
      batchLoss += loss;
      
      // Backward pass
      const gradOutput = [prediction[0] - target]; // Gradient de MSE
      this.backward(gradOutput);
      
      // Accumuler les gradients
      for (let layerIdx = 0; layerIdx < this.network.length; layerIdx++) {
        const layer = this.network[layerIdx];
        for (let j = 0; j < layer.outputSize; j++) {
          accumulatedGradients[layerIdx].biasGradients[j] += layer.biasGradients[j];
          for (let k = 0; k < layer.inputSize; k++) {
            accumulatedGradients[layerIdx].weightGradients[j][k] += layer.weightGradients[j][k];
          }
        }
      }
    }
    
    // Moyenner les gradients et mettre à jour les paramètres
    for (let layerIdx = 0; layerIdx < this.network.length; layerIdx++) {
      const layer = this.network[layerIdx];
      for (let j = 0; j < layer.outputSize; j++) {
        layer.biasGradients[j] = accumulatedGradients[layerIdx].biasGradients[j] / batchSize;
        for (let k = 0; k < layer.inputSize; k++) {
          layer.weightGradients[j][k] = accumulatedGradients[layerIdx].weightGradients[j][k] / batchSize;
        }
      }
      
      layer.updateParameters(this.learningRate, this.regularization);
    }
    
    return batchLoss / batchSize;
  }

  /**
   * Forward pass à travers le réseau
   */
  forward(input, training = false) {
    let output = [...input];
    
    for (let i = 0; i < this.network.length; i++) {
      output = this.network[i].forward(output);
      
      // Appliquer dropout sauf sur la dernière couche et seulement en training
      if (training && i < this.network.length - 1) {
        output = this.network[i].applyDropout(output, this.dropoutRate);
      }
    }
    
    return output;
  }

  /**
   * Backward pass à travers le réseau
   */
  backward(gradOutput) {
    let currentGrad = [...gradOutput];
    
    for (let i = this.network.length - 1; i >= 0; i--) {
      currentGrad = this.network[i].backward(currentGrad);
    }
  }

  /**
   * Fait une prédiction avec contraintes de musculation
   */
  predict(features) {
    if (!this.isTrained) {
      throw new Error('Le modèle doit être entraîné avant de faire des prédictions');
    }

    // Convertir l'objet features en array si nécessaire
    const featureArray = Array.isArray(features) ? features : this.convertFeatureObjectToArray(features);
    
    // Normaliser les features
    const normalizedFeatures = this.normalizeSingleFeature(featureArray);
    
    // Forward pass (mode inférence, pas de dropout)
    const normalizedPrediction = this.forward(normalizedFeatures, false);
    
    // Dénormaliser la prédiction
    const rawPrediction = normalizedPrediction[0] * this.targetStd + this.targetMean;
    
    // Appliquer les contraintes de musculation
    const validatedPrediction = validateMusculationPrediction(
      rawPrediction,
      features.currentWeight || features.current_weight || 0,
      features.userLevel || 'intermediate',
      features.exerciseType || features.exercise_type || 'compound'
    );
    
    // Calculer la confiance (basée sur la complexité du réseau et la loss finale)
    const confidence = this.calculatePredictionConfidence(validatedPrediction);
    
    return {
      rawPrediction: rawPrediction,
      validatedPrediction: validatedPrediction.validatedWeight,
      confidence: confidence,
      increment: validatedPrediction.increment,
      constraints: validatedPrediction.appliedConstraints,
      recommendations: validatedPrediction.recommendations,
      modelInfo: {
        type: 'NeuralNetwork',
        architecture: this.layers,
        epochs: this.trainingHistory.epochs,
        finalLoss: this.trainingHistory.loss[this.trainingHistory.loss.length - 1],
        bestValidationLoss: this.trainingHistory.bestValidationLoss
      }
    };
  }

  /**
   * Calcule la loss de validation
   */
  calculateValidationLoss(valFeatures, valTargets) {
    let totalLoss = 0;
    
    for (let i = 0; i < valFeatures.length; i++) {
      const prediction = this.forward(valFeatures[i], false);
      const loss = Math.pow(prediction[0] - valTargets[i], 2) / 2;
      totalLoss += loss;
    }
    
    return totalLoss / valFeatures.length;
  }

  /**
   * Calcule la confiance de prédiction
   */
  calculatePredictionConfidence(validatedPrediction) {
    let confidence = 75; // Base confidence pour les réseaux de neurones
    
    // Ajuster selon la loss finale
    const finalLoss = this.trainingHistory.loss[this.trainingHistory.loss.length - 1];
    if (finalLoss < 0.5) {
      confidence += 15;
    } else if (finalLoss < 1.0) {
      confidence += 10;
    } else if (finalLoss > 2.0) {
      confidence -= 15;
    }
    
    // Ajuster selon la validation loss
    if (this.trainingHistory.bestValidationLoss < 0.5) {
      confidence += 10;
    } else if (this.trainingHistory.bestValidationLoss > 1.0) {
      confidence -= 10;
    }
    
    // Ajuster selon les contraintes appliquées
    if (validatedPrediction.appliedConstraints.length === 0) {
      confidence += 5;
    } else {
      confidence -= validatedPrediction.appliedConstraints.length * 3;
    }
    
    return Math.max(25, Math.min(90, confidence));
  }

  // Méthodes utilitaires pour la normalisation et la préparation des données
  
  temporalSplit(features, targets, validationSplit = 0.2) {
    const splitIndex = Math.floor(features.length * (1 - validationSplit));
    
    return {
      trainFeatures: features.slice(0, splitIndex),
      trainTargets: targets.slice(0, splitIndex),
      valFeatures: features.slice(splitIndex),
      valTargets: targets.slice(splitIndex)
    };
  }

  normalizeData(features, targets) {
    // Normaliser les features
    const numFeatures = features[0].length;
    this.featureMeans = Array(numFeatures).fill(0);
    this.featureStds = Array(numFeatures).fill(1);
    
    // Calculer moyennes et écarts-types
    for (let j = 0; j < numFeatures; j++) {
      let sum = 0;
      for (let i = 0; i < features.length; i++) {
        sum += features[i][j] || 0;
      }
      this.featureMeans[j] = sum / features.length;
      
      let sumSquares = 0;
      for (let i = 0; i < features.length; i++) {
        const diff = (features[i][j] || 0) - this.featureMeans[j];
        sumSquares += diff * diff;
      }
      this.featureStds[j] = Math.sqrt(sumSquares / features.length) || 1;
    }
    
    // Normaliser les targets
    this.targetMean = targets.reduce((sum, t) => sum + t, 0) / targets.length;
    const targetVariance = targets.reduce((sum, t) => sum + Math.pow(t - this.targetMean, 2), 0) / targets.length;
    this.targetStd = Math.sqrt(targetVariance) || 1;
  }

  normalizeFeatures(features) {
    return features.map(sample => 
      sample.map((value, j) => 
        (value - this.featureMeans[j]) / this.featureStds[j]
      )
    );
  }

  normalizeSingleFeature(features) {
    return features.map((value, j) => 
      (value - (this.featureMeans[j] || 0)) / (this.featureStds[j] || 1)
    );
  }

  normalizeTargets(targets) {
    return targets.map(t => (t - this.targetMean) / this.targetStd);
  }

  shuffleData(features, targets) {
    const indices = Array.from({ length: features.length }, (_, i) => i);
    
    // Shuffle Fisher-Yates
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    return {
      features: indices.map(i => features[i]),
      targets: indices.map(i => targets[i])
    };
  }

  convertFeatureObjectToArray(features) {
    const featureKeys = [
      'progression_1week', 'progression_2weeks', 'progression_4weeks',
      'frequency_1week', 'frequency_2weeks', 'consistency_score',
      'momentum_score', 'current_weight', 'max_weight', 'avg_weight',
      'total_volume', 'intensity_score', 'is_compound_exercise',
      'realistic_progression_rate', 'exercise_experience'
    ];
    
    return featureKeys.map(key => features[key] || 0);
  }

  saveWeights() {
    this.trainingHistory.bestWeights = this.network.map(layer => ({
      weights: layer.weights.map(row => [...row]),
      biases: [...layer.biases]
    }));
  }

  loadWeights() {
    if (!this.trainingHistory.bestWeights) return;
    
    for (let i = 0; i < this.network.length; i++) {
      this.network[i].weights = this.trainingHistory.bestWeights[i].weights.map(row => [...row]);
      this.network[i].biases = [...this.trainingHistory.bestWeights[i].biases];
    }
  }

  /**
   * Sauvegarde le modèle
   */
  save() {
    return {
      type: 'NeuralNetwork',
      layers: this.layers,
      network: this.network.map(layer => ({
        weights: layer.weights,
        biases: layer.biases,
        inputSize: layer.inputSize,
        outputSize: layer.outputSize
      })),
      hyperparameters: {
        learningRate: this.learningRate,
        epochs: this.epochs,
        batchSize: this.batchSize,
        regularization: this.regularization,
        dropoutRate: this.dropoutRate
      },
      normalization: {
        featureMeans: this.featureMeans,
        featureStds: this.featureStds,
        targetMean: this.targetMean,
        targetStd: this.targetStd
      },
      trainingHistory: this.trainingHistory,
      isTrained: this.isTrained
    };
  }

  /**
   * Charge un modèle sauvegardé
   */
  load(modelData) {
    this.layers = modelData.layers || [15, 10, 5, 1];
    
    if (modelData.hyperparameters) {
      this.learningRate = modelData.hyperparameters.learningRate;
      this.epochs = modelData.hyperparameters.epochs;
      this.batchSize = modelData.hyperparameters.batchSize;
      this.regularization = modelData.hyperparameters.regularization;
      this.dropoutRate = modelData.hyperparameters.dropoutRate;
    }
    
    if (modelData.normalization) {
      this.featureMeans = modelData.normalization.featureMeans;
      this.featureStds = modelData.normalization.featureStds;
      this.targetMean = modelData.normalization.targetMean;
      this.targetStd = modelData.normalization.targetStd;
    }
    
    this.trainingHistory = modelData.trainingHistory || { loss: [], validationLoss: [], epochs: 0 };
    this.isTrained = modelData.isTrained || false;
    
    // Reconstruire le réseau si des données sont disponibles
    if (modelData.network && modelData.network.length > 0) {
      this.buildNetwork();
      
      for (let i = 0; i < this.network.length && i < modelData.network.length; i++) {
        this.network[i].weights = modelData.network[i].weights;
        this.network[i].biases = modelData.network[i].biases;
      }
    }
  }
}

export default NeuralNetworkModel;
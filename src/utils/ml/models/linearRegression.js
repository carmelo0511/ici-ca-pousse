/**
 * Modèle de régression linéaire avancée avec régularisation et contraintes de musculation
 * Intègre L1/L2 regularization, feature selection automatique, et validation croisée
 */

import { validateMusculationPrediction, MUSCULATION_CONSTRAINTS } from '../musculationConstraints.js';

/**
 * Classe de régression linéaire avancée pour prédiction de poids
 */
export class AdvancedLinearRegression {
  constructor(options = {}) {
    // Hyperparamètres
    this.learningRate = options.learningRate || 0.01;
    this.regularization = options.regularization || 0.01;
    this.regularizationType = options.regularizationType || 'l2'; // 'l1', 'l2', 'elastic'
    this.maxIterations = options.maxIterations || 1000;
    this.tolerance = options.tolerance || 1e-6;
    
    // Paramètres du modèle
    this.weights = [];
    this.bias = 0;
    this.featureNames = [];
    this.isTrained = false;
    
    // Métriques d'entraînement
    this.trainingHistory = {
      loss: [],
      validationLoss: [],
      iterations: 0
    };
    
    // Contraintes de musculation
    this.constraints = MUSCULATION_CONSTRAINTS;
    
    // Normalization parameters
    this.featureMeans = [];
    this.featureStds = [];
    this.targetMean = 0;
    this.targetStd = 1;
  }

  /**
   * Entraîne le modèle avec validation croisée temporelle
   * @param {Array} features - Matrice des features [n_samples, n_features]
   * @param {Array} targets - Vecteur des targets [n_samples]
   * @param {Object} options - Options d'entraînement
   */
  async train(features, targets, options = {}) {
    if (!features || !targets || features.length === 0) {
      throw new Error('Features et targets ne peuvent pas être vides');
    }

    // Validation temporelle split
    const { trainFeatures, trainTargets, valFeatures, valTargets } = 
      this.temporalSplit(features, targets, options.validationSplit || 0.2);

    // Normalisation des données
    this.normalizeFeatures(trainFeatures, trainTargets);
    const normalizedTrainFeatures = this.applyNormalization(trainFeatures);
    const normalizedTrainTargets = this.normalizeTargets(trainTargets);

    // Initialisation des poids
    this.initializeWeights(normalizedTrainFeatures[0].length);
    
    // Feature selection automatique
    if (options.featureSelection) {
      await this.performFeatureSelection(normalizedTrainFeatures, normalizedTrainTargets);
    }

    // Entraînement avec gradient descent
    await this.gradientDescent(
      normalizedTrainFeatures, 
      normalizedTrainTargets,
      valFeatures,
      valTargets,
      options
    );

    this.isTrained = true;
    
    return {
      finalLoss: this.trainingHistory.loss[this.trainingHistory.loss.length - 1],
      finalValidationLoss: this.trainingHistory.validationLoss[this.trainingHistory.validationLoss.length - 1],
      iterations: this.trainingHistory.iterations,
      featureImportance: this.getFeatureImportance()
    };
  }

  /**
   * Fait une prédiction avec contraintes de musculation
   * @param {Array} features - Features pour la prédiction
   * @returns {Object} Prédiction avec métadonnées
   */
  predict(features) {
    if (!this.isTrained) {
      throw new Error('Le modèle doit être entraîné avant de faire des prédictions');
    }

    // Normaliser les features
    const normalizedFeatures = this.applySingleNormalization(features);
    
    // Prédiction brute
    const rawPrediction = this.linearPredict(normalizedFeatures);
    
    // Dénormaliser la prédiction
    const denormalizedPrediction = rawPrediction * this.targetStd + this.targetMean;
    
    // Appliquer les contraintes de musculation
    const validatedPrediction = validateMusculationPrediction(
      denormalizedPrediction,
      features.currentWeight || features.current_weight || 0,
      features.userLevel || 'intermediate',
      features.exerciseType || features.exercise_type || 'compound'
    );

    // Calculer l'intervalle de confiance
    const confidence = this.calculatePredictionConfidence(features, validatedPrediction);

    return {
      rawPrediction: denormalizedPrediction,
      validatedPrediction: validatedPrediction.validatedWeight,
      confidence: confidence,
      increment: validatedPrediction.increment,
      constraints: validatedPrediction.appliedConstraints,
      recommendations: validatedPrediction.recommendations,
      featureContributions: this.getFeatureContributions(normalizedFeatures),
      modelInfo: {
        type: 'LinearRegression',
        regularization: this.regularization,
        featureCount: this.weights.length
      }
    };
  }

  /**
   * Prédiction linéaire brute
   * @param {Array} features - Features normalisées
   * @returns {number} Prédiction brute
   */
  linearPredict(features) {
    let prediction = this.bias;
    
    for (let i = 0; i < this.weights.length; i++) {
      prediction += this.weights[i] * (features[i] || 0);
    }
    
    return prediction;
  }

  /**
   * Gradient descent avec régularisation
   */
  async gradientDescent(trainFeatures, trainTargets, valFeatures, valTargets, options) {
    let prevLoss = Infinity;
    
    for (let iter = 0; iter < this.maxIterations; iter++) {
      // Forward pass
      const predictions = trainFeatures.map(features => this.linearPredict(features));
      
      // Calculer la loss avec régularisation
      const loss = this.calculateLossWithRegularization(predictions, trainTargets);
      
      // Validation loss
      let validationLoss = 0;
      if (valFeatures && valFeatures.length > 0) {
        const valNormalizedFeatures = valFeatures.map(f => this.applySingleNormalization(f));
        const valPredictions = valNormalizedFeatures.map(f => this.linearPredict(f));
        const valNormalizedTargets = this.normalizeTargets(valTargets);
        validationLoss = this.calculateMSE(valPredictions, valNormalizedTargets);
      }
      
      // Stocker l'historique
      this.trainingHistory.loss.push(loss);
      this.trainingHistory.validationLoss.push(validationLoss);
      
      // Vérifier la convergence
      if (Math.abs(prevLoss - loss) < this.tolerance) {
        this.trainingHistory.iterations = iter + 1;
        break;
      }
      
      // Backward pass - calculer les gradients
      const { weightGradients, biasGradient } = this.calculateGradients(
        trainFeatures, trainTargets, predictions
      );
      
      // Mise à jour des paramètres
      this.updateWeights(weightGradients, biasGradient);
      
      prevLoss = loss;
    }
    
    if (this.trainingHistory.iterations === 0) {
      this.trainingHistory.iterations = this.maxIterations;
    }
  }

  /**
   * Calcule les gradients avec régularisation
   */
  calculateGradients(features, targets, predictions) {
    const n = features.length;
    const weightGradients = new Array(this.weights.length).fill(0);
    let biasGradient = 0;

    // Gradients de la MSE
    for (let i = 0; i < n; i++) {
      const error = predictions[i] - targets[i];
      
      // Gradient du biais
      biasGradient += error;
      
      // Gradients des poids
      for (let j = 0; j < this.weights.length; j++) {
        weightGradients[j] += error * (features[i][j] || 0);
      }
    }

    // Normaliser par le nombre d'échantillons
    biasGradient /= n;
    for (let j = 0; j < weightGradients.length; j++) {
      weightGradients[j] /= n;
      
      // Ajouter la régularisation
      if (this.regularizationType === 'l1') {
        weightGradients[j] += this.regularization * Math.sign(this.weights[j]);
      } else if (this.regularizationType === 'l2') {
        weightGradients[j] += this.regularization * this.weights[j];
      }
    }

    return { weightGradients, biasGradient };
  }

  /**
   * Met à jour les poids avec le learning rate
   */
  updateWeights(weightGradients, biasGradient) {
    // Mise à jour des poids
    for (let j = 0; j < this.weights.length; j++) {
      this.weights[j] -= this.learningRate * weightGradients[j];
    }
    
    // Mise à jour du biais
    this.bias -= this.learningRate * biasGradient;
  }

  /**
   * Calcule la loss avec régularisation
   */
  calculateLossWithRegularization(predictions, targets) {
    const mse = this.calculateMSE(predictions, targets);
    
    let regularizationTerm = 0;
    if (this.regularizationType === 'l1') {
      regularizationTerm = this.weights.reduce((sum, w) => sum + Math.abs(w), 0);
    } else if (this.regularizationType === 'l2') {
      regularizationTerm = this.weights.reduce((sum, w) => sum + w * w, 0);
    }
    
    return mse + this.regularization * regularizationTerm;
  }

  /**
   * Calcule le Mean Squared Error
   */
  calculateMSE(predictions, targets) {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      const error = predictions[i] - targets[i];
      sum += error * error;
    }
    return sum / predictions.length;
  }

  /**
   * Split temporel pour la validation
   */
  temporalSplit(features, targets, validationSplit = 0.2) {
    const splitIndex = Math.floor(features.length * (1 - validationSplit));
    
    return {
      trainFeatures: features.slice(0, splitIndex),
      trainTargets: targets.slice(0, splitIndex),
      valFeatures: features.slice(splitIndex),
      valTargets: targets.slice(splitIndex)
    };
  }

  /**
   * Initialise les poids de manière aléatoire
   */
  initializeWeights(numFeatures) {
    this.weights = [];
    for (let i = 0; i < numFeatures; i++) {
      // Xavier initialization
      const limit = Math.sqrt(6.0 / (numFeatures + 1));
      this.weights.push((Math.random() * 2 - 1) * limit);
    }
    this.bias = 0;
  }

  /**
   * Normalise les features pour l'entraînement
   */
  normalizeFeatures(features, targets) {
    if (features.length === 0) return;
    
    const numFeatures = features[0].length;
    this.featureMeans = new Array(numFeatures).fill(0);
    this.featureStds = new Array(numFeatures).fill(1);
    
    // Calculer les moyennes
    for (let j = 0; j < numFeatures; j++) {
      let sum = 0;
      for (let i = 0; i < features.length; i++) {
        sum += features[i][j] || 0;
      }
      this.featureMeans[j] = sum / features.length;
    }
    
    // Calculer les écarts-types
    for (let j = 0; j < numFeatures; j++) {
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

  /**
   * Applique la normalisation aux features
   */
  applyNormalization(features) {
    return features.map(sample => 
      sample.map((value, j) => 
        (value - this.featureMeans[j]) / this.featureStds[j]
      )
    );
  }

  /**
   * Applique la normalisation à un seul échantillon
   */
  applySingleNormalization(features) {
    if (Array.isArray(features)) {
      return features.map((value, j) => 
        (value - (this.featureMeans[j] || 0)) / (this.featureStds[j] || 1)
      );
    }
    
    // Si features est un objet, convertir en array
    const featureArray = this.convertFeatureObjectToArray(features);
    return featureArray.map((value, j) => 
      (value - (this.featureMeans[j] || 0)) / (this.featureStds[j] || 1)
    );
  }

  /**
   * Normalise les targets
   */
  normalizeTargets(targets) {
    return targets.map(t => (t - this.targetMean) / this.targetStd);
  }

  /**
   * Convertit un objet de features en array
   */
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

  /**
   * Calcule l'importance des features
   */
  getFeatureImportance() {
    if (!this.isTrained) return {};
    
    const featureKeys = [
      'progression_1week', 'progression_2weeks', 'progression_4weeks',
      'frequency_1week', 'frequency_2weeks', 'consistency_score',
      'momentum_score', 'current_weight', 'max_weight', 'avg_weight',
      'total_volume', 'intensity_score', 'is_compound_exercise',
      'realistic_progression_rate', 'exercise_experience'
    ];
    
    const importance = {};
    const totalAbsWeight = this.weights.reduce((sum, w) => sum + Math.abs(w), 0) || 1;
    
    featureKeys.forEach((key, index) => {
      if (index < this.weights.length) {
        importance[key] = {
          weight: this.weights[index],
          importance: Math.abs(this.weights[index]) / totalAbsWeight,
          normalized_importance: (Math.abs(this.weights[index]) / totalAbsWeight) * 100
        };
      }
    });
    
    return importance;
  }

  /**
   * Calcule les contributions de chaque feature pour une prédiction
   */
  getFeatureContributions(normalizedFeatures) {
    const contributions = {};
    const featureKeys = [
      'progression_1week', 'progression_2weeks', 'progression_4weeks',
      'frequency_1week', 'frequency_2weeks', 'consistency_score',
      'momentum_score', 'current_weight', 'max_weight', 'avg_weight',
      'total_volume', 'intensity_score', 'is_compound_exercise',
      'realistic_progression_rate', 'exercise_experience'
    ];
    
    featureKeys.forEach((key, index) => {
      if (index < this.weights.length && index < normalizedFeatures.length) {
        const contribution = this.weights[index] * normalizedFeatures[index];
        contributions[key] = {
          value: normalizedFeatures[index],
          weight: this.weights[index],
          contribution: contribution,
          contribution_percentage: (contribution / Math.abs(this.linearPredict(normalizedFeatures))) * 100
        };
      }
    });
    
    return contributions;
  }

  /**
   * Calcule la confiance de la prédiction
   */
  calculatePredictionConfidence(features, validatedPrediction) {
    // Base confidence sur la qualité des données
    let confidence = 80;
    
    // Réduire la confiance si peu de données
    if (features.totalDataPoints < 5) {
      confidence -= 30;
    } else if (features.totalDataPoints < 10) {
      confidence -= 15;
    }
    
    // Augmenter la confiance si les données sont consistantes
    if (features.consistency_score > 70) {
      confidence += 10;
    }
    
    // Ajuster selon la contrainte appliquée
    if (validatedPrediction.appliedConstraints.length === 0) {
      confidence += 5;
    } else {
      confidence -= validatedPrediction.appliedConstraints.length * 5;
    }
    
    return Math.max(20, Math.min(95, confidence));
  }

  /**
   * Feature selection automatique basée sur l'importance
   */
  async performFeatureSelection(features, targets, threshold = 0.01) {
    // Pour la simplicité, nous gardons toutes les features
    // Dans une implémentation complète, on pourrait utiliser des techniques comme
    // - Recursive Feature Elimination
    // - L1 regularization pour feature sparsity
    // - Statistical tests
    return true;
  }

  /**
   * Sauvegarde le modèle
   */
  save() {
    return {
      type: 'AdvancedLinearRegression',
      weights: this.weights,
      bias: this.bias,
      featureMeans: this.featureMeans,
      featureStds: this.featureStds,
      targetMean: this.targetMean,
      targetStd: this.targetStd,
      hyperparameters: {
        learningRate: this.learningRate,
        regularization: this.regularization,
        regularizationType: this.regularizationType
      },
      trainingHistory: this.trainingHistory,
      isTrained: this.isTrained
    };
  }

  /**
   * Charge un modèle sauvegardé
   */
  load(modelData) {
    this.weights = modelData.weights || [];
    this.bias = modelData.bias || 0;
    this.featureMeans = modelData.featureMeans || [];
    this.featureStds = modelData.featureStds || [];
    this.targetMean = modelData.targetMean || 0;
    this.targetStd = modelData.targetStd || 1;
    
    if (modelData.hyperparameters) {
      this.learningRate = modelData.hyperparameters.learningRate;
      this.regularization = modelData.hyperparameters.regularization;
      this.regularizationType = modelData.hyperparameters.regularizationType;
    }
    
    this.trainingHistory = modelData.trainingHistory || { loss: [], validationLoss: [], iterations: 0 };
    this.isTrained = modelData.isTrained || false;
  }
}

export default AdvancedLinearRegression;
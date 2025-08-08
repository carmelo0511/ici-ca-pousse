/**
 * Modèle Random Forest pour prédiction de poids
 * Implémentation d'un ensemble d'arbres de décision avec bootstrap sampling
 */

import { validateMusculationPrediction } from '../musculationConstraints.js';

/**
 * Classe pour un arbre de décision simple
 */
class DecisionTree {
  constructor(maxDepth = 5, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.tree = null;
  }

  /**
   * Entraîne l'arbre de décision
   */
  fit(features, targets, featureNames = []) {
    this.featureNames = featureNames;
    this.tree = this.buildTree(features, targets, 0);
  }

  /**
   * Construit récursivement l'arbre
   */
  buildTree(features, targets, depth) {
    const n = features.length;
    
    // Conditions d'arrêt
    if (depth >= this.maxDepth || n < this.minSamplesSplit || this.isPure(targets)) {
      return {
        type: 'leaf',
        value: this.calculateMean(targets),
        samples: n
      };
    }

    // Trouver le meilleur split
    const bestSplit = this.findBestSplit(features, targets);
    
    if (!bestSplit) {
      return {
        type: 'leaf',
        value: this.calculateMean(targets),
        samples: n
      };
    }

    // Diviser les données
    const { leftIndices, rightIndices } = this.splitData(features, bestSplit);
    
    // Construire les sous-arbres
    const leftChild = this.buildTree(
      leftIndices.map(i => features[i]),
      leftIndices.map(i => targets[i]),
      depth + 1
    );
    
    const rightChild = this.buildTree(
      rightIndices.map(i => features[i]),
      rightIndices.map(i => targets[i]),
      depth + 1
    );

    return {
      type: 'node',
      feature: bestSplit.feature,
      threshold: bestSplit.threshold,
      left: leftChild,
      right: rightChild,
      samples: n
    };
  }

  /**
   * Trouve le meilleur split pour un nœud
   */
  findBestSplit(features, targets) {
    let bestSplit = null;
    let bestScore = Infinity;
    
    const numFeatures = features[0].length;
    
    // Essayer chaque feature
    for (let featureIndex = 0; featureIndex < numFeatures; featureIndex++) {
      const featureValues = features.map(f => f[featureIndex] || 0);
      const uniqueValues = [...new Set(featureValues)].sort((a, b) => a - b);
      
      // Essayer chaque threshold possible
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const score = this.calculateSplitScore(features, targets, featureIndex, threshold);
        
        if (score < bestScore) {
          bestScore = score;
          bestSplit = {
            feature: featureIndex,
            threshold: threshold,
            score: score
          };
        }
      }
    }
    
    return bestScore < Infinity ? bestSplit : null;
  }

  /**
   * Calcule le score d'un split (MSE pondéré)
   */
  calculateSplitScore(features, targets, featureIndex, threshold) {
    const leftTargets = [];
    const rightTargets = [];
    
    for (let i = 0; i < features.length; i++) {
      const featureValue = features[i][featureIndex] || 0;
      if (featureValue <= threshold) {
        leftTargets.push(targets[i]);
      } else {
        rightTargets.push(targets[i]);
      }
    }
    
    if (leftTargets.length === 0 || rightTargets.length === 0) {
      return Infinity;
    }
    
    const totalSamples = targets.length;
    const leftWeight = leftTargets.length / totalSamples;
    const rightWeight = rightTargets.length / totalSamples;
    
    const leftMSE = this.calculateMSE(leftTargets);
    const rightMSE = this.calculateMSE(rightTargets);
    
    return leftWeight * leftMSE + rightWeight * rightMSE;
  }

  /**
   * Divise les données selon un split
   */
  splitData(features, split) {
    const leftIndices = [];
    const rightIndices = [];
    
    for (let i = 0; i < features.length; i++) {
      const featureValue = features[i][split.feature] || 0;
      if (featureValue <= split.threshold) {
        leftIndices.push(i);
      } else {
        rightIndices.push(i);
      }
    }
    
    return { leftIndices, rightIndices };
  }

  /**
   * Fait une prédiction avec l'arbre
   */
  predict(features) {
    return this.traverseTree(this.tree, features);
  }

  /**
   * Traverse l'arbre pour faire une prédiction
   */
  traverseTree(node, features) {
    if (node.type === 'leaf') {
      return node.value;
    }
    
    const featureValue = features[node.feature] || 0;
    if (featureValue <= node.threshold) {
      return this.traverseTree(node.left, features);
    } else {
      return this.traverseTree(node.right, features);
    }
  }

  /**
   * Calcule l'importance des features
   */
  getFeatureImportance() {
    const importance = new Array(this.featureNames.length).fill(0);
    this.calculateNodeImportance(this.tree, importance);
    
    // Normaliser
    const total = importance.reduce((sum, imp) => sum + imp, 0) || 1;
    return importance.map(imp => imp / total);
  }

  /**
   * Calcule récursivement l'importance des features
   */
  calculateNodeImportance(node, importance) {
    if (node.type === 'leaf') {
      return;
    }
    
    const totalSamples = node.samples;
    const leftSamples = node.left.samples;
    const rightSamples = node.right.samples;
    
    // Importance basée sur la réduction d'impureté
    const impurityReduction = totalSamples - (leftSamples + rightSamples);
    importance[node.feature] += impurityReduction;
    
    this.calculateNodeImportance(node.left, importance);
    this.calculateNodeImportance(node.right, importance);
  }

  // Méthodes utilitaires
  isPure(targets) {
    return new Set(targets).size === 1;
  }

  calculateMean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateMSE(targets) {
    const mean = this.calculateMean(targets);
    return targets.reduce((sum, target) => sum + Math.pow(target - mean, 2), 0) / targets.length;
  }
}

/**
 * Classe principale Random Forest
 */
export class RandomForestModel {
  constructor(options = {}) {
    this.nTrees = options.nTrees || 10;
    this.maxDepth = options.maxDepth || 5;
    this.minSamplesSplit = options.minSamplesSplit || 2;
    this.maxFeatures = options.maxFeatures || 'sqrt'; // 'sqrt', 'log2', number, or null
    this.bootstrap = options.bootstrap !== false; // true par défaut
    this.randomState = options.randomState || null;
    
    this.trees = [];
    this.featureNames = [];
    this.isTrained = false;
    
    // Métriques d'entraînement
    this.trainingMetrics = {
      oobScore: 0,
      featureImportances: [],
      treesPerformance: []
    };
  }

  /**
   * Entraîne le modèle Random Forest
   */
  async train(features, targets, featureNames = []) {
    if (!features || !targets || features.length === 0) {
      throw new Error('Features et targets ne peuvent pas être vides');
    }

    this.featureNames = featureNames.length > 0 ? featureNames : this.getDefaultFeatureNames(features[0].length);
    this.trees = [];
    
    const n = features.length;
    const numFeatures = this.getNumFeatures(features[0].length);
    
    // Out-of-bag predictions pour calculer l'OOB score
    const oobPredictions = new Array(n).fill(null).map(() => []);
    
    // Entraîner chaque arbre
    for (let treeIndex = 0; treeIndex < this.nTrees; treeIndex++) {
      // Bootstrap sampling
      const { bootstrapFeatures, bootstrapTargets, oobIndices } = 
        this.bootstrap ? this.createBootstrapSample(features, targets) : 
        { bootstrapFeatures: features, bootstrapTargets: targets, oobIndices: [] };
      
      // Feature bagging
      const selectedFeatures = this.selectRandomFeatures(numFeatures);
      const reducedFeatures = bootstrapFeatures.map(sample => 
        selectedFeatures.map(idx => sample[idx] || 0)
      );
      
      // Créer et entraîner l'arbre
      const tree = new DecisionTree(this.maxDepth, this.minSamplesSplit);
      tree.fit(reducedFeatures, bootstrapTargets, selectedFeatures.map(idx => this.featureNames[idx]));
      
      // Stocker l'arbre avec ses features sélectionnées
      this.trees.push({
        tree: tree,
        selectedFeatures: selectedFeatures,
        oobIndices: oobIndices
      });
      
      // Calculer les prédictions OOB
      if (this.bootstrap && oobIndices.length > 0) {
        oobIndices.forEach(idx => {
          const oobFeature = selectedFeatures.map(fIdx => features[idx][fIdx] || 0);
          const prediction = tree.predict(oobFeature);
          oobPredictions[idx].push(prediction);
        });
      }
    }
    
    // Calculer l'OOB score
    if (this.bootstrap) {
      this.calculateOOBScore(oobPredictions, targets);
    }
    
    // Calculer l'importance globale des features
    this.calculateFeatureImportances();
    
    this.isTrained = true;
    
    return {
      oobScore: this.trainingMetrics.oobScore,
      featureImportances: this.trainingMetrics.featureImportances,
      nTrees: this.nTrees
    };
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
    
    // Collecter les prédictions de tous les arbres
    const treePredictions = this.trees.map(treeData => {
      const selectedFeatureValues = treeData.selectedFeatures.map(idx => featureArray[idx] || 0);
      return treeData.tree.predict(selectedFeatureValues);
    });
    
    // Vote majoritaire (moyenne pour la régression)
    const rawPrediction = treePredictions.reduce((sum, pred) => sum + pred, 0) / treePredictions.length;
    
    // Calculer la variance des prédictions (mesure d'incertitude)
    const predictionVariance = this.calculateVariance(treePredictions);
    const predictionStd = Math.sqrt(predictionVariance);
    
    // Appliquer les contraintes de musculation
    const validatedPrediction = validateMusculationPrediction(
      rawPrediction,
      features.currentWeight || features.current_weight || 0,
      features.userLevel || 'intermediate',
      features.exerciseType || features.exercise_type || 'compound'
    );
    
    // Calculer la confiance basée sur la variance des arbres
    const confidence = this.calculatePredictionConfidence(predictionStd, validatedPrediction);
    
    return {
      rawPrediction: rawPrediction,
      validatedPrediction: validatedPrediction.validatedWeight,
      confidence: confidence,
      increment: validatedPrediction.increment,
      constraints: validatedPrediction.appliedConstraints,
      recommendations: validatedPrediction.recommendations,
      predictionVariance: predictionVariance,
      predictionStd: predictionStd,
      treePredictions: treePredictions,
      modelInfo: {
        type: 'RandomForest',
        nTrees: this.nTrees,
        maxDepth: this.maxDepth,
        oobScore: this.trainingMetrics.oobScore
      }
    };
  }

  /**
   * Crée un échantillon bootstrap
   */
  createBootstrapSample(features, targets) {
    const n = features.length;
    const bootstrapFeatures = [];
    const bootstrapTargets = [];
    const usedIndices = new Set();
    
    // Échantillonnage avec remise
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      bootstrapFeatures.push(features[randomIndex]);
      bootstrapTargets.push(targets[randomIndex]);
      usedIndices.add(randomIndex);
    }
    
    // Indices out-of-bag (non utilisés)
    const oobIndices = [];
    for (let i = 0; i < n; i++) {
      if (!usedIndices.has(i)) {
        oobIndices.push(i);
      }
    }
    
    return { bootstrapFeatures, bootstrapTargets, oobIndices };
  }

  /**
   * Sélectionne aléatoirement un sous-ensemble de features
   */
  selectRandomFeatures(numFeatures) {
    const allFeatures = Array.from({ length: this.featureNames.length }, (_, i) => i);
    
    // Mélanger et prendre les premiers numFeatures
    for (let i = allFeatures.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allFeatures[i], allFeatures[j]] = [allFeatures[j], allFeatures[i]];
    }
    
    return allFeatures.slice(0, numFeatures);
  }

  /**
   * Détermine le nombre de features à utiliser
   */
  getNumFeatures(totalFeatures) {
    if (this.maxFeatures === 'sqrt') {
      return Math.floor(Math.sqrt(totalFeatures));
    } else if (this.maxFeatures === 'log2') {
      return Math.floor(Math.log2(totalFeatures));
    } else if (typeof this.maxFeatures === 'number') {
      return Math.min(this.maxFeatures, totalFeatures);
    } else {
      return totalFeatures;
    }
  }

  /**
   * Calcule le score OOB (Out-of-Bag)
   */
  calculateOOBScore(oobPredictions, targets) {
    let validPredictions = 0;
    let totalSquaredError = 0;
    
    for (let i = 0; i < oobPredictions.length; i++) {
      if (oobPredictions[i].length > 0) {
        const avgPrediction = oobPredictions[i].reduce((sum, pred) => sum + pred, 0) / oobPredictions[i].length;
        const error = targets[i] - avgPrediction;
        totalSquaredError += error * error;
        validPredictions++;
      }
    }
    
    if (validPredictions > 0) {
      const mse = totalSquaredError / validPredictions;
      const targetVariance = this.calculateVariance(targets);
      this.trainingMetrics.oobScore = 1 - (mse / targetVariance);
    } else {
      this.trainingMetrics.oobScore = 0;
    }
  }

  /**
   * Calcule l'importance globale des features
   */
  calculateFeatureImportances() {
    const numFeatures = this.featureNames.length;
    const totalImportance = new Array(numFeatures).fill(0);
    
    this.trees.forEach(treeData => {
      const treeImportances = treeData.tree.getFeatureImportance();
      treeData.selectedFeatures.forEach((featureIdx, localIdx) => {
        if (localIdx < treeImportances.length) {
          totalImportance[featureIdx] += treeImportances[localIdx];
        }
      });
    });
    
    // Normaliser
    const sum = totalImportance.reduce((acc, imp) => acc + imp, 0) || 1;
    this.trainingMetrics.featureImportances = totalImportance.map(imp => imp / sum);
  }

  /**
   * Retourne l'importance des features
   */
  getFeatureImportance() {
    const importance = {};
    this.featureNames.forEach((name, idx) => {
      importance[name] = {
        importance: this.trainingMetrics.featureImportances[idx] || 0,
        normalized_importance: (this.trainingMetrics.featureImportances[idx] || 0) * 100
      };
    });
    return importance;
  }

  /**
   * Calcule la confiance de prédiction basée sur la variance des arbres
   */
  calculatePredictionConfidence(predictionStd, validatedPrediction) {
    // Base confidence
    let confidence = 85;
    
    // Réduire la confiance si grande variance entre les arbres
    if (predictionStd > 2.0) {
      confidence -= 20;
    } else if (predictionStd > 1.0) {
      confidence -= 10;
    }
    
    // Augmenter la confiance si OOB score est bon
    if (this.trainingMetrics.oobScore > 0.8) {
      confidence += 10;
    } else if (this.trainingMetrics.oobScore > 0.6) {
      confidence += 5;
    }
    
    // Ajuster selon les contraintes appliquées
    if (validatedPrediction.appliedConstraints.length === 0) {
      confidence += 5;
    } else {
      confidence -= validatedPrediction.appliedConstraints.length * 3;
    }
    
    return Math.max(30, Math.min(95, confidence));
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
   * Génère des noms de features par défaut
   */
  getDefaultFeatureNames(numFeatures) {
    const defaultNames = [
      'progression_1week', 'progression_2weeks', 'progression_4weeks',
      'frequency_1week', 'frequency_2weeks', 'consistency_score',
      'momentum_score', 'current_weight', 'max_weight', 'avg_weight',
      'total_volume', 'intensity_score', 'is_compound_exercise',
      'realistic_progression_rate', 'exercise_experience'
    ];
    
    return defaultNames.slice(0, numFeatures);
  }

  /**
   * Calcule la variance d'un array de valeurs
   */
  calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  /**
   * Sauvegarde le modèle
   */
  save() {
    return {
      type: 'RandomForest',
      trees: this.trees.map(treeData => ({
        tree: treeData.tree,
        selectedFeatures: treeData.selectedFeatures
      })),
      featureNames: this.featureNames,
      hyperparameters: {
        nTrees: this.nTrees,
        maxDepth: this.maxDepth,
        minSamplesSplit: this.minSamplesSplit,
        maxFeatures: this.maxFeatures
      },
      trainingMetrics: this.trainingMetrics,
      isTrained: this.isTrained
    };
  }

  /**
   * Charge un modèle sauvegardé
   */
  load(modelData) {
    this.trees = modelData.trees || [];
    this.featureNames = modelData.featureNames || [];
    
    if (modelData.hyperparameters) {
      this.nTrees = modelData.hyperparameters.nTrees;
      this.maxDepth = modelData.hyperparameters.maxDepth;
      this.minSamplesSplit = modelData.hyperparameters.minSamplesSplit;
      this.maxFeatures = modelData.hyperparameters.maxFeatures;
    }
    
    this.trainingMetrics = modelData.trainingMetrics || { oobScore: 0, featureImportances: [] };
    this.isTrained = modelData.isTrained || false;
  }
}

export default RandomForestModel;
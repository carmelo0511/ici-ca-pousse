/**
 * Fallback TensorFlow - Utilise le neural network custom si TensorFlow pose problème
 */

import { NeuralNetworkModel } from './neuralNetwork.js';
import { validateMusculationPrediction } from '../musculationConstraints.js';

/**
 * Modèle TensorFlow avec fallback automatique
 */
export class TensorFlowModel {
  constructor(options = {}) {
    this.modelType = options.modelType || 'mlp';
    this.config = options;
    this.uncertaintyEnabled = options.uncertaintyEnabled !== false;
    
    // Utiliser le modèle neural custom comme fallback
    this.fallbackModel = new NeuralNetworkModel({
      layers: [15, 32, 16, 8, 1],
      learningRate: 0.001,
      epochs: options.epochs || 150,
      batchSize: options.batchSize || 16,
      dropoutRate: 0.3,
      regularization: 0.01
    });
    
    this.isTrained = false;
    this.trainingMetrics = {
      modelType: 'TensorFlowFallback',
      fallbackUsed: true
    };
  }

  /**
   * Entraîne le modèle (utilise le fallback)
   */
  async train(features, targets, options = {}) {
    console.info('TensorFlow indisponible - Utilisation du modèle neural custom');
    
    const result = await this.fallbackModel.train(features, targets, options);
    this.isTrained = true;
    
    return {
      ...result,
      modelType: 'TensorFlowFallback',
      fallbackUsed: true,
      uncertaintyEnabled: this.uncertaintyEnabled
    };
  }

  /**
   * Fait une prédiction avec simulation d'uncertainty
   */
  predict(features) {
    if (!this.isTrained) {
      throw new Error('Le modèle doit être entraîné avant de faire des prédictions');
    }

    // Prédiction avec le modèle fallback
    const fallbackPrediction = this.fallbackModel.predict(features);
    
    // Simuler l'uncertainty quantification
    const baseConfidence = fallbackPrediction.confidence || 75;
    const simulatedUncertainty = (100 - baseConfidence) / 50; // Convertir en échelle d'incertitude
    
    const currentWeight = features.currentWeight || features.current_weight || 0;
    const rawPrediction = fallbackPrediction.rawPrediction || fallbackPrediction.validatedPrediction;
    
    // Validation avec contraintes de musculation
    const validatedPrediction = validateMusculationPrediction(
      rawPrediction,
      currentWeight,
      features.userLevel || 'intermediate',
      features.exerciseType || features.exercise_type || 'compound'
    );
    
    return {
      rawPrediction: rawPrediction,
      validatedPrediction: validatedPrediction.validatedWeight,
      increment: validatedPrediction.increment,
      confidence: baseConfidence,
      uncertainty: simulatedUncertainty,
      uncertaintyInterval: [
        Math.max(0, rawPrediction - simulatedUncertainty * 1.96),
        rawPrediction + simulatedUncertainty * 1.96
      ],
      modelInfo: {
        type: 'TensorFlowFallback',
        architecture: 'Neural_Network_Custom',
        fallbackUsed: true,
        uncertaintyEnabled: this.uncertaintyEnabled
      },
      constraints: validatedPrediction.appliedConstraints,
      recommendations: [
        ...validatedPrediction.recommendations,
        '📊 Mode fallback - TensorFlow indisponible'
      ]
    };
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
   * Retourne l'importance des features
   */
  getFeatureImportance() {
    return this.fallbackModel.getFeatureImportance ? 
      this.fallbackModel.getFeatureImportance() : {};
  }

  /**
   * Sauvegarde le modèle
   */
  async save() {
    const fallbackData = this.fallbackModel.save ? await this.fallbackModel.save() : null;
    
    return {
      type: 'TensorFlowFallback',
      modelType: this.modelType,
      config: this.config,
      trainingMetrics: this.trainingMetrics,
      isTrained: this.isTrained,
      uncertaintyEnabled: this.uncertaintyEnabled,
      fallbackModel: fallbackData
    };
  }

  /**
   * Charge un modèle sauvegardé
   */
  async load(modelData) {
    this.modelType = modelData.modelType || 'mlp';
    this.config = modelData.config || this.config;
    this.trainingMetrics = modelData.trainingMetrics || this.trainingMetrics;
    this.isTrained = modelData.isTrained || false;
    this.uncertaintyEnabled = modelData.uncertaintyEnabled !== false;
    
    if (modelData.fallbackModel && this.fallbackModel.load) {
      await this.fallbackModel.load(modelData.fallbackModel);
    }
  }

  /**
   * Nettoie les ressources
   */
  dispose() {
    if (this.fallbackModel && this.fallbackModel.dispose) {
      this.fallbackModel.dispose();
    }
  }
}

export default TensorFlowModel;
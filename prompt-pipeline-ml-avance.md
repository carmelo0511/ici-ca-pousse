# Prompt pour Claude Code : Pipeline ML Avancé pour Madame Irma

## 🎯 Objectif Principal
Transformer le système de prédiction de poids actuel en un pipeline ML professionnel avec plusieurs modèles, feature engineering avancé, validation croisée et interface utilisateur moderne.

## 📊 Analyse du Modèle Actuel vs Nouveau Pipeline

### 🔍 **Modèle Actuel (weightPrediction.js)**
**Limitations identifiées :**
- ❌ Prédictions basées sur des règles simples (moyenne + ajustements fixes)
- ❌ Pas de machine learning réel
- ❌ Features limitées (progression moyenne, tendance basique, fréquence)
- ❌ Pas de validation croisée
- ❌ Pas d'adaptation aux patterns individuels
- ❌ Confiance calculée de manière arbitraire
- ❌ Pas d'explicabilité des prédictions
- ❌ Pas d'apprentissage continu
- ❌ **Prédictions irréalistes** : Peut suggérer +0.3kg (impossible en musculation)
- ❌ **Pas de contraintes métier** : Ignore les paliers de poids disponibles
- ❌ **Pas de détection de plateau** : Ne détecte pas les blocages
- ❌ **Recommandations génériques** : Pas adaptées au niveau utilisateur

**Code actuel problématique :**
```javascript
// Prédiction simpliste
let predictedWeight = lastWeight + avgProgression;
if (frequency >= 3) predictedWeight += 0.5; // Ajustement fixe
if (trend === 'increasing') predictedWeight += 0.25; // Ajustement fixe
```

### 🚀 **Nouveau Pipeline ML Professionnel**
**Avantages :**
- ✅ Vraie machine learning avec plusieurs algorithmes
- ✅ Feature engineering avancé (20+ features)
- ✅ Validation croisée temporelle
- ✅ Modèles d'ensemble pour robustesse
- ✅ Apprentissage continu et adaptation
- ✅ Explicabilité des prédictions
- ✅ Métriques de performance réelles
- ✅ Interface utilisateur moderne
- ✅ **Prédictions réalistes** : Respecte les contraintes de musculation (min 0.5kg)
- ✅ **Contraintes métier intégrées** : Ajuste aux paliers de poids disponibles
- ✅ **Détection de plateau** : Identifie et propose des solutions aux blocages
- ✅ **Recommandations personnalisées** : Adaptées au niveau et type d'exercice
- ✅ **Validation automatique** : Vérifie la faisabilité des prédictions

## 🏗️ Architecture du Nouveau Pipeline

### **0. Contraintes Spécifiques à la Musculation**

#### **A. Règles Métier Réalistes**
```javascript
// Contraintes de progression réalistes
const MUSCULATION_CONSTRAINTS = {
  // Progression minimale par session (pas de 0.3kg impossible)
  MIN_INCREMENT: 0.5, // kg minimum
  
  // Progression maximale réaliste par session
  MAX_INCREMENT: 2.5, // kg maximum
  
  // Paliers de poids standards (disques disponibles)
  PLATE_INCREMENTS: [0.5, 1, 1.25, 2.5, 5, 10, 15, 20], // kg
  
  // Progression selon le niveau
  PROGRESSION_RATES: {
    beginner: { min: 0.5, max: 2.5, frequency: 'weekly' },
    intermediate: { min: 0.5, max: 1.5, frequency: 'biweekly' },
    advanced: { min: 0.5, max: 1.0, frequency: 'monthly' }
  },
  
  // Types d'exercices et progression spécifique
  EXERCISE_TYPES: {
    compound: { progression_rate: 1.0, recovery_time: 48 }, // heures
    isolation: { progression_rate: 0.5, recovery_time: 24 }
  },
  
  // Détection de plateau
  PLATEAU_THRESHOLD: 4, // semaines sans progression
  PLATEAU_DETECTION_WINDOW: 6 // semaines d'analyse
};

// Validation des prédictions selon les contraintes
const validateMusculationPrediction = (prediction, currentWeight, userLevel) => {
  const constraints = MUSCULATION_CONSTRAINTS.PROGRESSION_RATES[userLevel];
  const increment = prediction - currentWeight;
  
  // Vérifier les limites réalistes
  if (increment < constraints.min) {
    return currentWeight + constraints.min;
  }
  if (increment > constraints.max) {
    return currentWeight + constraints.max;
  }
  
  // Arrondir au palier de poids le plus proche
  return roundToNearestPlate(prediction, currentWeight);
};

// Arrondir au palier de poids disponible
const roundToNearestPlate = (prediction, currentWeight) => {
  const increment = prediction - currentWeight;
  const plates = MUSCULATION_CONSTRAINTS.PLATE_INCREMENTS;
  
  // Trouver le palier le plus proche
  const nearestPlate = plates.reduce((prev, curr) => 
    Math.abs(curr - increment) < Math.abs(prev - increment) ? curr : prev
  );
  
  return currentWeight + nearestPlate;
};
```

#### **B. Détection de Plateau et Recommandations**
```javascript
// Détection de plateau de force
const detectStrengthPlateau = (exerciseHistory, weeks = 6) => {
  const recentData = exerciseHistory.slice(-weeks);
  const maxWeight = Math.max(...recentData.map(d => d.weight));
  const plateauThreshold = MUSCULATION_CONSTRAINTS.PLATEAU_THRESHOLD;
  
  // Vérifier si le poids max n'a pas augmenté depuis X semaines
  const weeksWithoutProgress = recentData.filter(d => d.weight < maxWeight).length;
  
  if (weeksWithoutProgress >= plateauThreshold) {
    return {
      isPlateau: true,
      weeksStuck: weeksWithoutProgress,
      recommendations: [
        'Réduire le poids de 10% et augmenter les reps',
        'Changer la variante d\'exercice',
        'Augmenter le volume d\'entraînement',
        'Améliorer la récupération'
      ]
    };
  }
  
  return { isPlateau: false };
};
```

### **1. Structure des fichiers à créer :**

```
src/utils/ml/
├── advancedPredictionPipeline.js    # Pipeline principal orchestrateur
├── featureEngineering.js            # Extraction de 20+ features avancées
├── dataPreprocessing.js             # Nettoyage, normalisation, gestion outliers
├── models/
│   ├── linearRegression.js         # Régression linéaire avec régularisation
│   ├── randomForest.js             # Random Forest (simulation avec arbres)
│   ├── neuralNetwork.js            # Réseau de neurones simple
│   └── ensembleModel.js            # Modèle d'ensemble intelligent
├── modelEvaluation.js              # Métriques, validation croisée, comparaison
├── modelPersistence.js             # Sauvegarde/chargement des modèles
└── mlDashboard.js                  # Interface utilisateur ML
```

### **2. Feature Engineering Avancé (20+ features)**

```javascript
// Features temporelles
- progression_1week, progression_2weeks, progression_4weeks
- frequency_1week, frequency_2weeks, frequency_4weeks
- consistency_score (écart-type des poids)
- momentum_score (accélération de progression)
- recovery_time (temps entre sessions)

// Features de performance
- max_weight, min_weight, avg_weight
- volume_total, volume_per_session
- intensity_score (poids/reps ratio)
- fatigue_score (déclin dans session)
- peak_performance (meilleure performance)

// Features comportementales
- session_duration, exercises_per_session
- time_of_day, day_of_week
- seasonal_patterns
- user_level (débutant/intermédiaire/avancé)
- exercise_specialization

// Features contextuelles
- other_exercises_performance
- overall_workout_volume
- rest_days_pattern
- progression_rate_vs_peers

// Features spécifiques à la musculation
- plate_increments (progression par paliers de poids)
- exercise_type (compound/isolation)
- muscle_group_progression
- strength_plateau_detection
- realistic_progression_rate
```

### **3. Modèles ML Multiples**

#### **A. Linear Regression Avancée**
```javascript
class AdvancedLinearRegression {
  constructor() {
    this.features = [];
    this.weights = [];
    this.bias = 0;
    this.regularization = 0.01; // L2 regularization
    this.musculationConstraints = MUSCULATION_CONSTRAINTS;
  }
  
  train(features, targets, learningRate = 0.01, epochs = 1000) {
    // Gradient descent avec régularisation
    // Validation croisée intégrée
    // Feature selection automatique
    // Contraintes de musculation intégrées
  }
  
  predict(features) {
    // Prédiction brute
    let rawPrediction = this.linearPredict(features);
    
    // Application des contraintes de musculation
    const validatedPrediction = validateMusculationPrediction(
      rawPrediction, 
      features.currentWeight, 
      features.userLevel
    );
    
    return {
      rawPrediction,
      validatedPrediction,
      constraints: this.getAppliedConstraints(features)
    };
  }
  
  getFeatureImportance() {
    // Importance des features basée sur les coefficients
  }
  
  getAppliedConstraints(features) {
    // Retourner les contraintes appliquées
    return {
      minIncrement: this.musculationConstraints.MIN_INCREMENT,
      maxIncrement: this.musculationConstraints.MAX_INCREMENT,
      plateIncrements: this.musculationConstraints.PLATE_INCREMENTS,
      userLevel: features.userLevel
    };
  }
}
```

#### **B. Random Forest (Simulation)**
```javascript
class RandomForestModel {
  constructor(nTrees = 10, maxDepth = 5) {
    this.trees = [];
    this.nTrees = nTrees;
    this.maxDepth = maxDepth;
  }
  
  train(features, targets) {
    // Création de plusieurs arbres de décision
    // Bootstrap sampling pour chaque arbre
    // Feature bagging pour diversité
  }
  
  predict(features) {
    // Vote majoritaire des arbres
    // Probabilité de prédiction
  }
  
  getFeatureImportance() {
    // Importance basée sur la réduction d'impureté
  }
}
```

#### **C. Neural Network Simple**
```javascript
class NeuralNetworkModel {
  constructor(layers = [20, 10, 5, 1]) {
    this.layers = layers;
    this.weights = [];
    this.biases = [];
  }
  
  train(features, targets, epochs = 500, batchSize = 32) {
    // Backpropagation avec mini-batch
    // Dropout pour éviter l'overfitting
    // Early stopping basé sur validation
  }
  
  predict(features) {
    // Forward propagation
    // Activation functions: ReLU, Sigmoid
  }
}
```

#### **D. Modèle d'Ensemble Intelligent**
```javascript
class EnsembleModel {
  constructor(models = []) {
    this.models = models;
    this.weights = []; // Poids dynamiques basés sur performance
  }
  
  train(features, targets) {
    // Entraînement de tous les modèles
    // Optimisation des poids d'ensemble
    // Validation croisée pour chaque modèle
  }
  
  predict(features) {
    // Combinaison pondérée des prédictions
    // Intervalle de confiance
  }
  
  updateWeights(realPerformance) {
    // Mise à jour des poids basée sur performance réelle
    // Apprentissage continu
  }
}
```

### **4. Pipeline Principal**

```javascript
class AdvancedPredictionPipeline {
  constructor() {
    this.featureEngineer = new FeatureEngineer();
    this.dataPreprocessor = new DataPreprocessor();
    this.models = {
      linear: new AdvancedLinearRegression(),
      forest: new RandomForestModel(),
      neural: new NeuralNetworkModel(),
      ensemble: new EnsembleModel()
    };
    this.evaluator = new ModelEvaluator();
    this.persistence = new ModelPersistence();
  }
  
  async train(workouts) {
    // 1. Feature engineering
    const features = this.featureEngineer.extractAllFeatures(workouts);
    
    // 2. Data preprocessing
    const processedData = this.dataPreprocessor.process(features);
    
    // 3. Split temporel (train/test)
    const { trainData, testData } = this.temporalSplit(processedData);
    
    // 4. Entraînement des modèles
    await Promise.all([
      this.models.linear.train(trainData.features, trainData.targets),
      this.models.forest.train(trainData.features, trainData.targets),
      this.models.neural.train(trainData.features, trainData.targets)
    ]);
    
    // 5. Entraînement de l'ensemble
    this.models.ensemble.train(trainData.features, trainData.targets);
    
    // 6. Évaluation
    const performance = this.evaluator.evaluateAll(testData);
    
    // 7. Sauvegarde
    await this.persistence.saveModels(this.models, performance);
    
    return performance;
  }
  
  async predict(exerciseName, workouts) {
    // 1. Feature extraction
    const features = this.featureEngineer.extractExerciseFeatures(exerciseName, workouts);
    
    // 2. Détection de plateau
    const plateauAnalysis = detectStrengthPlateau(features.exerciseHistory);
    
    // 3. Prédictions de tous les modèles
    const predictions = {
      linear: this.models.linear.predict(features),
      forest: this.models.forest.predict(features),
      neural: this.models.neural.predict(features),
      ensemble: this.models.ensemble.predict(features)
    };
    
    // 4. Validation selon les contraintes de musculation
    const validatedPredictions = this.validateAllPredictions(predictions, features);
    
    // 5. Explication des prédictions
    const explanations = this.generateExplanations(validatedPredictions, features);
    
    // 6. Recommandations personnalisées
    const recommendations = this.generateRecommendations(validatedPredictions, explanations, plateauAnalysis);
    
    return {
      predictions: validatedPredictions,
      explanations,
      recommendations,
      plateauAnalysis,
      constraints: this.getMusculationConstraints(features),
      confidence: this.calculateConfidence(validatedPredictions),
      modelPerformance: this.getModelPerformance()
    };
  }
  
  validateAllPredictions(predictions, features) {
    const validated = {};
    Object.keys(predictions).forEach(modelName => {
      const prediction = predictions[modelName];
      validated[modelName] = validateMusculationPrediction(
        prediction.validatedPrediction || prediction,
        features.currentWeight,
        features.userLevel
      );
    });
    return validated;
  }
  
  generateRecommendations(predictions, explanations, plateauAnalysis) {
    const recommendations = [];
    
    // Recommandations basées sur les prédictions
    const ensemblePrediction = predictions.ensemble;
    const increment = ensemblePrediction - explanations.currentWeight;
    
    if (increment >= 1.0) {
      recommendations.push(`🎯 Progression forte détectée : +${increment.toFixed(1)}kg recommandé`);
    } else if (increment >= 0.5) {
      recommendations.push(`📈 Progression modérée : +${increment.toFixed(1)}kg recommandé`);
    } else {
      recommendations.push(`⏸️ Maintenez le poids actuel ou augmentez de 0.5kg`);
    }
    
    // Recommandations spécifiques aux plateaux
    if (plateauAnalysis.isPlateau) {
      recommendations.push(`⚠️ Plateau détecté depuis ${plateauAnalysis.weeksStuck} semaines`);
      recommendations.push(...plateauAnalysis.recommendations);
    }
    
    // Recommandations selon le niveau
    const userLevel = explanations.userLevel;
    if (userLevel === 'beginner') {
      recommendations.push(`🚀 Débutant : Progression rapide possible, restez cohérent`);
    } else if (userLevel === 'intermediate') {
      recommendations.push(`💪 Intermédiaire : Progression plus lente, focus sur la technique`);
    } else {
      recommendations.push(`🏆 Avancé : Progression lente, optimisez la récupération`);
    }
    
    return recommendations;
  }
  
  getMusculationConstraints(features) {
    return {
      minIncrement: MUSCULATION_CONSTRAINTS.MIN_INCREMENT,
      maxIncrement: MUSCULATION_CONSTRAINTS.MAX_INCREMENT,
      plateIncrements: MUSCULATION_CONSTRAINTS.PLATE_INCREMENTS,
      userLevel: features.userLevel,
      exerciseType: features.exerciseType
    };
  }
}
```

### **5. Interface Utilisateur ML**

```javascript
// Dans StatsView.jsx, ajouter :
const MLDashboard = ({ predictions, modelPerformance, plateauAnalysis, constraints }) => {
  return (
    <div className="ml-dashboard">
      <h3>🤖 Dashboard ML - Performance des Modèles</h3>
      
      {/* Contraintes de musculation */}
      <MusculationConstraints constraints={constraints} />
      
      {/* Comparaison des modèles */}
      <ModelComparisonChart predictions={predictions} />
      
      {/* Métriques de performance */}
      <PerformanceMetrics performance={modelPerformance} />
      
      {/* Explication des prédictions */}
      <PredictionExplanation explanations={predictions.explanations} />
      
      {/* Détection de plateau */}
      {plateauAnalysis.isPlateau && (
        <PlateauDetection analysis={plateauAnalysis} />
      )}
      
      {/* Recommandations personnalisées */}
      <PersonalizedRecommendations recommendations={predictions.recommendations} />
      
      {/* Historique des prédictions vs réalité */}
      <PredictionHistory />
      
      {/* Paliers de poids disponibles */}
      <PlateIncrementsInfo constraints={constraints} />
    </div>
  );
};

// Composant pour afficher les contraintes de musculation
const MusculationConstraints = ({ constraints }) => (
  <div className="musculation-constraints">
    <h4>🏋️ Contraintes de Musculation</h4>
    <div className="constraints-grid">
      <div className="constraint-item">
        <span>Progression min :</span>
        <span className="value">{constraints.minIncrement}kg</span>
      </div>
      <div className="constraint-item">
        <span>Progression max :</span>
        <span className="value">{constraints.maxIncrement}kg</span>
      </div>
      <div className="constraint-item">
        <span>Niveau :</span>
        <span className="value">{constraints.userLevel}</span>
      </div>
      <div className="constraint-item">
        <span>Type d'exercice :</span>
        <span className="value">{constraints.exerciseType}</span>
      </div>
    </div>
  </div>
);

// Composant pour la détection de plateau
const PlateauDetection = ({ analysis }) => (
  <div className="plateau-detection warning">
    <h4>⚠️ Plateau de Force Détecté</h4>
    <p>Vous êtes bloqué depuis {analysis.weeksStuck} semaines</p>
    <div className="recommendations">
      <h5>Recommandations :</h5>
      <ul>
        {analysis.recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  </div>
);

// Composant pour les paliers de poids
const PlateIncrementsInfo = ({ constraints }) => (
  <div className="plate-increments">
    <h4>⚖️ Paliers de Poids Disponibles</h4>
    <div className="plates-grid">
      {constraints.plateIncrements.map(plate => (
        <span key={plate} className="plate-item">{plate}kg</span>
      ))}
    </div>
    <p className="info-text">
      Les prédictions sont automatiquement ajustées aux paliers disponibles
    </p>
  </div>
);
```

## 📈 Métriques de Performance

### **Métriques à implémenter :**
```javascript
// Précision des prédictions
- MAE (Mean Absolute Error)
- RMSE (Root Mean Square Error)
- R² (Coefficient de détermination)
- Précision dans différentes plages (±0.5kg, ±1kg, ±2kg)

// Métriques de confiance
- Calibration des probabilités
- Reliability diagram
- Brier score

// Métriques métier
- Taux de progression correctement prédit
- Satisfaction utilisateur
- Taux d'adoption des recommandations
```

## 🔄 Apprentissage Continu

```javascript
class ContinuousLearning {
  constructor() {
    this.feedbackQueue = [];
    this.updateFrequency = 'weekly';
  }
  
  addFeedback(prediction, actualResult) {
    // Collecte du feedback utilisateur
    this.feedbackQueue.push({ prediction, actualResult, timestamp: Date.now() });
  }
  
  async updateModels() {
    // Mise à jour périodique des modèles
    // Réentraînement avec nouvelles données
    // Ajustement des hyperparamètres
  }
}
```

## 🧪 Tests et Validation

### **Tests à créer :**
```javascript
// Tests unitaires
- testFeatureEngineering()
- testModelTraining()
- testPredictionAccuracy()
- testDataPreprocessing()

// Tests d'intégration
- testFullPipeline()
- testModelPersistence()
- testContinuousLearning()

// Tests de performance
- testPredictionSpeed()
- testMemoryUsage()
- testScalability()
```

## 🎯 Instructions Détaillées pour Claude Code

### **Étape 1 : Créer l'infrastructure**
1. Créer tous les fichiers dans `src/utils/ml/`
2. Implémenter les classes de base
3. Créer les tests unitaires

### **Étape 2 : Feature Engineering**
1. Implémenter `featureEngineering.js` avec 20+ features
2. Tests pour chaque feature
3. Validation des features

### **Étape 3 : Modèles ML**
1. Implémenter chaque modèle individuellement
2. Tests de performance de chaque modèle
3. Optimisation des hyperparamètres

### **Étape 4 : Pipeline Principal**
1. Orchestration de tous les composants
2. Validation croisée temporelle
3. Gestion des erreurs

### **Étape 5 : Interface Utilisateur**
1. Dashboard ML dans StatsView
2. Visualisations interactives
3. Explications des prédictions

### **Étape 6 : Tests et Optimisation**
1. Tests d'intégration complets
2. Optimisation des performances
3. Documentation

## 🚀 Résultat Attendu

Un système ML professionnel qui :
- ✅ **Précision** : 30-50% plus précis que le système actuel
- ✅ **Adaptabilité** : S'adapte aux patterns individuels
- ✅ **Explicabilité** : Explique chaque prédiction
- ✅ **Robustesse** : Gère les données manquantes et outliers
- ✅ **Performance** : Prédictions en < 100ms
- ✅ **Interface** : Dashboard moderne et informatif
- ✅ **Réalisme** : Respecte les contraintes de la musculation
- ✅ **Détection de plateau** : Identifie et propose des solutions
- ✅ **Paliers de poids** : Ajuste automatiquement aux disques disponibles
- ✅ **Niveaux utilisateur** : Adapte les recommandations selon l'expérience

## 🔧 Technologies Recommandées

- **TensorFlow.js** : Pour les réseaux de neurones
- **Chart.js** : Pour les visualisations
- **Lodash** : Pour les calculs statistiques
- **LocalStorage** : Pour la persistance des modèles
- **Web Workers** : Pour les calculs lourds en arrière-plan

Cette architecture transformera complètement votre système de prédiction en un véritable pipeline ML professionnel ! 🎉 
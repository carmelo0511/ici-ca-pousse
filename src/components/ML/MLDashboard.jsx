/**
 * Dashboard ML pour afficher les performances des modèles et analyses avancées
 * Interface moderne avec visualisations interactives
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  Clock,
  Weight
} from 'lucide-react';
import PlateauAnalysisView from './PlateauAnalysisView.jsx';

/**
 * Composant principal du dashboard ML
 */
const MLDashboard = ({ 
  predictions, 
  modelPerformance, 
  plateauAnalysis, 
  constraints,
  pipelineMetrics,
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calcul des métriques globales
  const globalMetrics = useMemo(() => {
    if (!predictions) return null;

    const predictionValues = Object.values(predictions);
    const totalExercises = predictionValues.length;
    const avgConfidence = predictionValues.reduce((sum, pred) => sum + (pred.confidence || 0), 0) / totalExercises;
    const highConfidencePredictions = predictionValues.filter(pred => pred.confidence >= 80).length;
    const plateauCount = predictionValues.filter(pred => pred.plateauAnalysis?.isPlateau).length;
    
    return {
      totalExercises,
      avgConfidence: Math.round(avgConfidence),
      highConfidencePredictions,
      plateauCount,
      healthScore: Math.round((avgConfidence + (highConfidencePredictions / totalExercises) * 50) / 1.5)
    };
  }, [predictions]);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'models', label: 'Modèles ML', icon: Brain },
    { id: 'plateaus', label: 'Plateaux', icon: AlertTriangle },
    { id: 'insights', label: 'Insights', icon: Activity },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="ml-dashboard space-y-6">
      {/* En-tête du dashboard */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">Dashboard ML - Madame IrmIA v2.0</h3>
            <p className="text-sm text-secondary">Pipeline d'intelligence artificielle avancé</p>
          </div>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        )}
      </div>

      {/* Métriques globales */}
      {globalMetrics && (
        <GlobalMetricsOverview metrics={globalMetrics} pipelineMetrics={pipelineMetrics} />
      )}

      {/* Navigation par onglets */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <OverviewTab 
            predictions={predictions}
            constraints={constraints}
            plateauAnalysis={plateauAnalysis}
          />
        )}
        
        {activeTab === 'models' && (
          <ModelsTab 
            predictions={predictions}
            modelPerformance={modelPerformance}
            pipelineMetrics={pipelineMetrics}
          />
        )}
        
        {activeTab === 'plateaus' && (
          <PlateausTab 
            predictions={predictions}
            plateauAnalysis={plateauAnalysis}
            onRefresh={onRefresh}
          />
        )}
        
        {activeTab === 'insights' && (
          <InsightsTab 
            predictions={predictions}
            showAdvanced={showAdvanced}
            onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTab 
            constraints={constraints}
            pipelineMetrics={pipelineMetrics}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Vue d'ensemble des métriques globales
 */
const GlobalMetricsOverview = ({ metrics, pipelineMetrics }) => {
  const metricsCards = [
    {
      label: 'Exercices Analysés',
      value: metrics.totalExercises,
      icon: Target,
      color: 'blue',
      suffix: ''
    },
    {
      label: 'Confiance Moyenne',
      value: metrics.avgConfidence,
      icon: TrendingUp,
      color: metrics.avgConfidence >= 80 ? 'green' : metrics.avgConfidence >= 60 ? 'yellow' : 'red',
      suffix: '%'
    },
    {
      label: 'Haute Confiance',
      value: metrics.highConfidencePredictions,
      icon: CheckCircle,
      color: 'green',
      suffix: ` / ${metrics.totalExercises}`
    },
    {
      label: 'Plateaux Détectés',
      value: metrics.plateauCount,
      icon: AlertTriangle,
      color: metrics.plateauCount > 0 ? 'orange' : 'green',
      suffix: ''
    },
    {
      label: 'Score Santé ML',
      value: metrics.healthScore,
      icon: Activity,
      color: metrics.healthScore >= 80 ? 'green' : metrics.healthScore >= 60 ? 'yellow' : 'red',
      suffix: '/100'
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metricsCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="card">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 bg-gradient-to-r ${colorClasses[metric.color]} rounded-lg`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {metric.value}{metric.suffix}
            </div>
            <div className="text-sm text-secondary">{metric.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Onglet Vue d'ensemble
 */
const OverviewTab = ({ predictions, constraints, plateauAnalysis }) => {
  if (!predictions) {
    return (
      <div className="card text-center py-8">
        <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg text-secondary mb-2">Aucune donnée de prédiction disponible</p>
        <p className="text-sm text-tertiary">Entraînez-vous davantage pour obtenir des prédictions ML</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contraintes de musculation */}
      <MusculationConstraints constraints={constraints} />
      
      {/* Liste des prédictions avec détails */}
      <PredictionsList predictions={predictions} />
      
      {/* Analyse des plateaux */}
      {plateauAnalysis && <PlateauAnalysis plateauAnalysis={plateauAnalysis} />}
    </div>
  );
};

/**
 * Onglet Plateaux avancé
 */
const PlateausTab = ({ predictions, plateauAnalysis, onRefresh }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const exercisesWithPlateaus = useMemo(() => {
    if (!predictions) return [];
    return Object.entries(predictions).filter(([_, prediction]) => 
      prediction.plateauAnalysis?.hasPlateaus
    );
  }, [predictions]);

  const plateauStats = useMemo(() => {
    const total = Object.keys(predictions || {}).length;
    const withPlateaus = exercisesWithPlateaus.length;
    const severityCount = {
      mild: 0,
      moderate: 0,
      severe: 0,
      critical: 0
    };

    exercisesWithPlateaus.forEach(([_, prediction]) => {
      const severity = prediction.plateauAnalysis?.overallSeverity || 'mild';
      severityCount[severity]++;
    });

    return {
      total,
      withPlateaus,
      percentage: total > 0 ? Math.round((withPlateaus / total) * 100) : 0,
      severityCount
    };
  }, [predictions, exercisesWithPlateaus]);

  if (!predictions) {
    return (
      <div className="card text-center py-8">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg text-secondary">Aucune donnée de plateau disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales des plateaux */}
      <div className="card">
        <h4 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Analyse Globale des Plateaux</span>
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{plateauStats.total}</div>
            <div className="text-sm text-secondary">Exercices analysés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{plateauStats.withPlateaus}</div>
            <div className="text-sm text-secondary">Avec plateaux</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{plateauStats.percentage}%</div>
            <div className="text-sm text-secondary">Taux de plateau</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{plateauStats.severityCount.severe + plateauStats.severityCount.critical}</div>
            <div className="text-sm text-secondary">Plateaux sévères</div>
          </div>
        </div>

        {/* Répartition par sévérité */}
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(plateauStats.severityCount).map(([severity, count]) => {
            const colors = {
              mild: 'yellow',
              moderate: 'orange',
              severe: 'red',
              critical: 'red'
            };
            return (
              <div key={severity} className={`p-2 bg-${colors[severity]}-900/20 border border-${colors[severity]}-500/30 rounded text-center`}>
                <div className={`text-lg font-bold text-${colors[severity]}-400`}>{count}</div>
                <div className="text-xs text-secondary capitalize">{severity}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des exercices avec plateaux */}
      {exercisesWithPlateaus.length > 0 ? (
        <div className="card">
          <h4 className="text-lg font-semibold text-primary mb-4">Exercices avec Plateaux Détectés</h4>
          <div className="space-y-3">
            {exercisesWithPlateaus.map(([exerciseName, prediction]) => (
              <div 
                key={exerciseName}
                className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors cursor-pointer"
                onClick={() => setSelectedExercise(selectedExercise === exerciseName ? null : exerciseName)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    <span className="font-medium text-primary">{exerciseName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge-${prediction.plateauAnalysis.overallSeverity === 'critical' || prediction.plateauAnalysis.overallSeverity === 'severe' ? 'danger' : 'warning'} text-xs`}>
                      {prediction.plateauAnalysis.overallSeverity}
                    </span>
                    <span className="text-sm text-secondary">
                      {prediction.plateauAnalysis.detectedPlateaus?.length || 0} plateau(x)
                    </span>
                  </div>
                </div>
                
                {selectedExercise === exerciseName && (
                  <div className="mt-4 border-t border-gray-600 pt-4">
                    <PlateauAnalysisView
                      plateauAnalysis={prediction.plateauAnalysis}
                      exerciseName={exerciseName}
                      userLevel="intermediate"
                      onRefresh={onRefresh}
                      showDetailedView={true}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-8">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
          <p className="text-lg text-secondary mb-2">🎉 Aucun Plateau Détecté !</p>
          <p className="text-sm text-tertiary">
            Excellente progression sur tous vos exercices. Continuez ainsi !
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Onglet Modèles ML
 */
const ModelsTab = ({ predictions, modelPerformance, pipelineMetrics }) => {
  const samplePrediction = predictions ? Object.values(predictions)[0] : null;
  const modelInfo = samplePrediction?.modelInfo;

  return (
    <div className="space-y-6">
      {/* Performance des modèles */}
      <div className="card">
        <h4 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Performance des Modèles</span>
        </h4>
        
        {modelPerformance ? (
          <ModelPerformanceChart performance={modelPerformance} />
        ) : (
          <p className="text-secondary">Aucune donnée de performance disponible</p>
        )}
      </div>

      {/* Architecture des modèles */}
      {modelInfo && (
        <div className="card">
          <h4 className="text-lg font-semibold text-primary mb-4">Architecture</h4>
          <ModelArchitecture modelInfo={modelInfo} />
        </div>
      )}

      {/* Métriques du pipeline */}
      {pipelineMetrics && (
        <div className="card">
          <h4 className="text-lg font-semibold text-primary mb-4">Métriques Pipeline</h4>
          <PipelineMetrics metrics={pipelineMetrics} />
        </div>
      )}
    </div>
  );
};

/**
 * Onglet Insights
 */
const InsightsTab = ({ predictions, showAdvanced, onToggleAdvanced }) => {
  if (!predictions) {
    return (
      <div className="card text-center py-8">
        <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg text-secondary">Aucun insight disponible</p>
      </div>
    );
  }

  const allInsights = Object.values(predictions).flatMap(pred => pred.insights || []);
  const insightsByType = allInsights.reduce((acc, insight) => {
    acc[insight.type] = acc[insight.type] || [];
    acc[insight.type].push(insight);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Toggle pour insights avancés */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-primary">Insights ML</h4>
        <button
          onClick={onToggleAdvanced}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showAdvanced 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {showAdvanced ? 'Mode Simple' : 'Mode Avancé'}
        </button>
      </div>

      {/* Insights par catégorie */}
      {Object.entries(insightsByType).map(([type, insights]) => (
        <InsightCategory 
          key={type} 
          type={type} 
          insights={insights} 
          showAdvanced={showAdvanced}
        />
      ))}

      {/* Recommandations globales */}
      <GlobalRecommendations predictions={predictions} />
    </div>
  );
};

/**
 * Onglet Paramètres
 */
const SettingsTab = ({ constraints, pipelineMetrics }) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h4 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configuration ML</span>
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-secondary">Mode de prédiction</span>
            <span className="badge">Ensemble (Linear + Forest + Neural)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-secondary">Contraintes musculation</span>
            <span className="badge-success">Activées</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-secondary">Détection de plateau</span>
            <span className="badge-success">Activée</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-secondary">Cache intelligent</span>
            <span className="text-primary">{pipelineMetrics?.cacheSize || 0} éléments</span>
          </div>
        </div>
      </div>

      {/* Informations système */}
      <div className="card">
        <h4 className="text-lg font-semibold text-primary mb-4">État du Système</h4>
        <SystemStatus pipelineMetrics={pipelineMetrics} />
      </div>
    </div>
  );
};

/**
 * Composants utilitaires
 */

const MusculationConstraints = ({ constraints }) => (
  <div className="card">
    <h4 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
      <Weight className="h-5 w-5" />
      <span>Contraintes de Musculation</span>
    </h4>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-xl font-bold text-green-400">0.5kg</div>
        <div className="text-sm text-secondary">Progression min</div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-red-400">2.5kg</div>
        <div className="text-sm text-secondary">Progression max</div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-blue-400">8</div>
        <div className="text-sm text-secondary">Paliers disponibles</div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-purple-400">4 sem</div>
        <div className="text-sm text-secondary">Seuil plateau</div>
      </div>
    </div>
  </div>
);

const PredictionsList = ({ predictions }) => {
  React.useEffect(() => {
    // Ajouter les styles de scrollbar personnalisés
    const style = document.createElement('style');
    style.textContent = `
      .scrollable-predictions::-webkit-scrollbar {
        width: 8px;
      }
      .scrollable-predictions::-webkit-scrollbar-track {
        background: #374151;
        border-radius: 4px;
      }
      .scrollable-predictions::-webkit-scrollbar-thumb {
        background: #8b5cf6;
        border-radius: 4px;
      }
      .scrollable-predictions::-webkit-scrollbar-thumb:hover {
        background: #7c3aed;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="card">
      <h4 className="text-lg font-semibold text-primary mb-4">Prédictions par Exercice</h4>
      <div 
        className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollable-predictions"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#8b5cf6 #374151'
        }}
      >
        {Object.entries(predictions).map(([exerciseName, prediction]) => (
          <PredictionCard key={exerciseName} exerciseName={exerciseName} prediction={prediction} />
        ))}
      </div>
    </div>
  );
};

const PredictionCard = ({ exerciseName, prediction }) => {
  const confidenceColor = prediction.confidence >= 80 ? 'success' : 
                          prediction.confidence >= 60 ? 'warning' : 'danger';
  
  const IncrementIcon = prediction.increment > 0 ? TrendingUp : 
                        prediction.increment < 0 ? TrendingDown : Target;

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-primary">{exerciseName}</div>
        <span className={`badge-${confidenceColor} text-xs`}>
          {prediction.confidence}% confiance
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <IncrementIcon className="h-4 w-4 text-gray-400" />
          <span className="text-secondary">
            {prediction.currentWeight || prediction.lastWeight}kg → {prediction.nextWeight || prediction.predictedWeight}kg
          </span>
        </div>
        
        {prediction.increment !== 0 && (
          <div className={`flex items-center space-x-1 ${
            prediction.increment > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            <span className="font-medium">
              {prediction.increment > 0 ? '+' : ''}{prediction.increment}kg
            </span>
          </div>
        )}
      </div>
      
      {prediction.plateauAnalysis?.isPlateau && (
        <div className="mt-2 flex items-center space-x-2 text-orange-400 text-xs">
          <AlertTriangle className="h-3 w-3" />
          <span>Plateau détecté ({prediction.plateauAnalysis.weeksStuck} sem)</span>
        </div>
      )}
    </div>
  );
};

const ModelPerformanceChart = ({ performance }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="text-center">
      <div className="text-2xl font-bold text-primary">{performance.mae?.toFixed(2) || 'N/A'}</div>
      <div className="text-sm text-secondary">MAE (Mean Absolute Error)</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-primary">{performance.rmse?.toFixed(2) || 'N/A'}</div>
      <div className="text-sm text-secondary">RMSE (Root Mean Square Error)</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-primary">{(performance.r2 * 100)?.toFixed(1) || 'N/A'}%</div>
      <div className="text-sm text-secondary">R² Score</div>
    </div>
  </div>
);

const ModelArchitecture = ({ modelInfo }) => {
  if (!modelInfo || modelInfo.type !== 'EnsembleModel') {
    return <p className="text-secondary">Architecture non disponible</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-secondary">Type de modèle</span>
        <span className="badge">Ensemble Learning</span>
      </div>
      
      {modelInfo.models && (
        <div className="flex items-center justify-between">
          <span className="text-secondary">Modèles composants</span>
          <div className="flex space-x-2">
            {modelInfo.models.map((model, index) => (
              <span key={index} className="badge-success text-xs">{model}</span>
            ))}
          </div>
        </div>
      )}
      
      {modelInfo.ensembleWeights && (
        <div className="space-y-2">
          <span className="text-secondary text-sm">Poids d'ensemble</span>
          {Object.entries(modelInfo.ensembleWeights).map(([model, weight]) => (
            <div key={model} className="flex items-center justify-between text-sm">
              <span className="text-tertiary capitalize">{model}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${weight * 100}%` }}
                  />
                </div>
                <span className="text-primary w-12 text-right">{(weight * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PipelineMetrics = ({ metrics }) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <div className="text-lg font-bold text-primary">{metrics.totalPredictions || 0}</div>
      <div className="text-sm text-secondary">Prédictions totales</div>
    </div>
    <div>
      <div className="text-lg font-bold text-primary">{metrics.averageAccuracy?.toFixed(1) || 0}%</div>
      <div className="text-sm text-secondary">Précision moyenne</div>
    </div>
    <div>
      <div className="text-lg font-bold text-primary">{metrics.cacheSize || 0}</div>
      <div className="text-sm text-secondary">Éléments en cache</div>
    </div>
    <div>
      <div className="text-lg font-bold text-primary">
        {metrics.lastUpdate ? new Date(metrics.lastUpdate).toLocaleDateString() : 'Jamais'}
      </div>
      <div className="text-sm text-secondary">Dernière mise à jour</div>
    </div>
  </div>
);

const InsightCategory = ({ type, insights, showAdvanced }) => {
  const typeIcons = {
    progression: TrendingUp,
    plateau: AlertTriangle,
    data: Info,
    model: Brain,
    error: AlertTriangle
  };
  
  const typeColors = {
    progression: 'green',
    plateau: 'orange',
    data: 'blue',
    model: 'purple',
    error: 'red'
  };

  const Icon = typeIcons[type] || Info;
  const color = typeColors[type] || 'gray';

  return (
    <div className="card">
      <h5 className={`font-semibold mb-3 flex items-center space-x-2 text-${color}-400`}>
        <Icon className="h-4 w-4" />
        <span className="capitalize">{type}</span>
        <span className="badge text-xs">{insights.length}</span>
      </h5>
      
      <div className="space-y-2">
        {insights.slice(0, showAdvanced ? insights.length : 3).map((insight, index) => (
          <div key={index} className="p-3 bg-gray-800 rounded border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary">{insight.message}</p>
              <span className={`badge-${insight.level === 'positive' ? 'success' : 
                                insight.level === 'warning' ? 'warning' : 
                                insight.level === 'critical' ? 'danger' : 'secondary'} text-xs`}>
                {insight.confidence}
              </span>
            </div>
          </div>
        ))}
        
        {!showAdvanced && insights.length > 3 && (
          <p className="text-xs text-tertiary text-center">
            +{insights.length - 3} autres insights...
          </p>
        )}
      </div>
    </div>
  );
};

const GlobalRecommendations = ({ predictions }) => {
  const allRecommendations = Object.values(predictions).flatMap(pred => pred.recommendations || []);
  const uniqueRecommendations = [...new Set(allRecommendations)];

  return (
    <div className="card">
      <h4 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
        <Target className="h-5 w-5" />
        <span>Recommandations Globales</span>
      </h4>
      
      <div className="space-y-2">
        {uniqueRecommendations.slice(0, 5).map((recommendation, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
            <CheckCircle className="h-4 w-4 mt-0.5 text-green-400 flex-shrink-0" />
            <p className="text-sm text-secondary">{recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SystemStatus = ({ pipelineMetrics }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-secondary">État du pipeline</span>
      <span className={`badge-${pipelineMetrics?.isInitialized ? 'success' : 'warning'}`}>
        {pipelineMetrics?.isInitialized ? 'Initialisé' : 'Non initialisé'}
      </span>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-secondary">Entraînement en cours</span>
      <span className={`badge-${pipelineMetrics?.isTraining ? 'warning' : 'success'}`}>
        {pipelineMetrics?.isTraining ? `${pipelineMetrics.trainingProgress}%` : 'Terminé'}
      </span>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-secondary">Cache prédictions</span>
      <span className="text-primary">{pipelineMetrics?.cacheSize || 0} éléments</span>
    </div>
    
    <div className="flex items-center justify-between">
      <span className="text-secondary">Dernière activité</span>
      <span className="text-primary flex items-center space-x-1">
        <Clock className="h-3 w-3" />
        <span>{pipelineMetrics?.lastUpdate ? 
          new Date(pipelineMetrics.lastUpdate).toLocaleTimeString() : 
          'Aucune'
        }</span>
      </span>
    </div>
  </div>
);

const PlateauAnalysis = ({ plateauAnalysis }) => {
  const plateauExercises = Object.entries(plateauAnalysis).filter(([_, analysis]) => analysis.isPlateau);
  
  if (plateauExercises.length === 0) {
    return (
      <div className="card">
        <h4 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span>Analyse des Plateaux</span>
        </h4>
        <p className="text-secondary">Aucun plateau détecté - Excellente progression !</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h4 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5 text-orange-400" />
        <span>Plateaux Détectés ({plateauExercises.length})</span>
      </h4>
      
      <div className="space-y-3">
        {plateauExercises.map(([exerciseName, analysis]) => (
          <div key={exerciseName} className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-primary">{exerciseName}</span>
              <span className={`badge-${analysis.severity === 'high' ? 'danger' : 'warning'} text-xs`}>
                {analysis.weeksStuck} semaines
              </span>
            </div>
            
            <div className="text-sm text-secondary mb-2">
              Bloqué à {analysis.maxWeight}kg depuis {analysis.weeksStuck} semaines
            </div>
            
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="space-y-1">
                {analysis.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="text-xs text-tertiary flex items-center space-x-2">
                    <Zap className="h-3 w-3 text-orange-400" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MLDashboard;
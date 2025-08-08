/**
 * Composant d'affichage avancé pour l'analyse des plateaux ML
 * Interface moderne avec visualisations et recommandations personnalisées
 */

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  Target,
  Zap,
  Clock,
  Brain,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  RefreshCw,
  Users,
  Lightbulb,
  Award
} from 'lucide-react';

/**
 * Composant principal pour l'analyse des plateaux
 */
const PlateauAnalysisView = ({ 
  plateauAnalysis, 
  exerciseName,
  userLevel = 'intermediate',
  onRefresh,
  showDetailedView = false 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  // Métriques calculées
  const metrics = useMemo(() => {
    if (!plateauAnalysis || !plateauAnalysis.hasPlateaus) {
      return {
        totalPlateaus: 0,
        severityScore: 0,
        confidenceScore: plateauAnalysis?.confidence || 0,
        status: 'healthy'
      };
    }

    const severityScores = {
      'mild': 1,
      'moderate': 2, 
      'severe': 3,
      'critical': 4
    };

    const totalPlateaus = plateauAnalysis.detectedPlateaus.length;
    const averageSeverity = plateauAnalysis.detectedPlateaus.reduce((sum, plateau) => 
      sum + (severityScores[plateau.severity] || 0), 0
    ) / Math.max(totalPlateaus, 1);

    return {
      totalPlateaus,
      severityScore: Math.round(averageSeverity * 25), // Sur 100
      confidenceScore: plateauAnalysis.confidence,
      status: averageSeverity >= 3 ? 'critical' : 
              averageSeverity >= 2 ? 'warning' : 'caution'
    };
  }, [plateauAnalysis]);

  if (!plateauAnalysis) {
    return (
      <div className="card text-center py-8">
        <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg text-secondary mb-2">Analyse de plateau en cours...</p>
        <p className="text-sm text-tertiary">
          Collecte des données pour détecter les patterns de stagnation
        </p>
      </div>
    );
  }

  if (!plateauAnalysis.hasPlateaus) {
    return (
      <div className="card text-center py-8">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
        <p className="text-lg text-secondary mb-2">🎯 Progression Normale Détectée</p>
        <p className="text-sm text-tertiary mb-4">
          Aucun plateau significatif identifié pour {exerciseName}
        </p>
        
        {plateauAnalysis.recommendations && plateauAnalysis.recommendations.length > 0 && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-green-400 mb-2">💪 Conseils pour maintenir la progression</h4>
            <div className="space-y-2">
              {plateauAnalysis.recommendations.slice(0, 2).map((rec, idx) => (
                <p key={idx} className="text-xs text-secondary">{rec}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'details', label: 'Détails', icon: Info },
    { id: 'recommendations', label: 'Solutions', icon: Lightbulb }
  ];

  return (
    <div className="plateau-analysis space-y-6">
      {/* En-tête avec métriques clés */}
      <PlateauHeader 
        exerciseName={exerciseName}
        metrics={metrics}
        analysisDetails={plateauAnalysis.analysisDetails}
        onRefresh={onRefresh}
      />

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
                  ? 'bg-red-600 text-white'
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
      <div className="min-h-64">
        {activeTab === 'overview' && (
          <PlateauOverview 
            plateauAnalysis={plateauAnalysis}
            metrics={metrics}
          />
        )}
        
        {activeTab === 'details' && (
          <PlateauDetails 
            plateauAnalysis={plateauAnalysis}
            exerciseName={exerciseName}
          />
        )}
        
        {activeTab === 'recommendations' && (
          <PlateauRecommendations 
            recommendations={plateauAnalysis.recommendations}
            plateauAnalysis={plateauAnalysis}
            showAllRecommendations={showAllRecommendations}
            onToggleAll={() => setShowAllRecommendations(!showAllRecommendations)}
          />
        )}
      </div>
    </div>
  );
};

/**
 * En-tête avec métriques importantes
 */
const PlateauHeader = ({ exerciseName, metrics, analysisDetails, onRefresh }) => {
  const statusConfig = {
    healthy: { color: 'green', icon: CheckCircle, label: 'Sain' },
    caution: { color: 'yellow', icon: AlertTriangle, label: 'Attention' },
    warning: { color: 'orange', icon: TrendingDown, label: 'Problème' },
    critical: { color: 'red', icon: XCircle, label: 'Critique' }
  };

  const config = statusConfig[metrics.status];
  const StatusIcon = config.icon;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 rounded-lg`}>
            <StatusIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">Analyse de Plateau - {exerciseName}</h3>
            <p className="text-sm text-secondary">
              État: <span className={`text-${config.color}-400 font-medium`}>{config.label}</span>
              {analysisDetails && (
                <span className="ml-2 text-tertiary">
                  • {analysisDetails.dataPoints} points de données sur {analysisDetails.timeSpan} semaines
                </span>
              )}
            </p>
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

      {/* Métriques en grille */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{metrics.totalPlateaus}</div>
          <div className="text-sm text-secondary">Plateaux détectés</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold text-${config.color}-400`}>{metrics.severityScore}/100</div>
          <div className="text-sm text-secondary">Score de sévérité</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{metrics.confidenceScore}%</div>
          <div className="text-sm text-secondary">Confiance IA</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Vue d'ensemble des plateaux
 */
const PlateauOverview = ({ plateauAnalysis, metrics }) => {
  const plateauTypeIcons = {
    weight: { icon: Target, label: 'Poids', color: 'red' },
    volume: { icon: BarChart3, label: 'Volume', color: 'orange' },
    intensity: { icon: Zap, label: 'Intensité', color: 'yellow' },
    frequency: { icon: Clock, label: 'Fréquence', color: 'blue' },
    motivational: { icon: Users, label: 'Motivation', color: 'purple' }
  };

  return (
    <div className="space-y-6">
      {/* Graphique de sévérité */}
      <div className="card">
        <h4 className="text-lg font-semibold text-primary mb-4">Répartition des Plateaux</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plateauAnalysis.detectedPlateaus.map((plateau, index) => {
            const typeConfig = plateauTypeIcons[plateau.type] || plateauTypeIcons.weight;
            const TypeIcon = typeConfig.icon;
            
            const severityColors = {
              mild: 'yellow',
              moderate: 'orange', 
              severe: 'red',
              critical: 'red'
            };

            return (
              <div key={index} className={`p-4 border-l-4 border-${severityColors[plateau.severity]}-500 bg-gray-800 rounded-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className={`h-5 w-5 text-${typeConfig.color}-400`} />
                    <span className="font-medium text-primary">{typeConfig.label}</span>
                  </div>
                  <span className={`badge-${severityColors[plateau.severity]} text-xs px-2 py-1 rounded-full`}>
                    {plateau.severity}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="text-secondary">{plateau.details?.message}</div>
                  {plateau.weeksStuck && (
                    <div className="text-tertiary">Durée: {plateau.weeksStuck} semaines</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tendances analysées */}
      {plateauAnalysis.analysisDetails?.trendAnalysis && (
        <div className="card">
          <h4 className="text-lg font-semibold text-primary mb-4">Analyse des Tendances</h4>
          <TrendAnalysisChart trendData={plateauAnalysis.analysisDetails.trendAnalysis} />
        </div>
      )}
    </div>
  );
};

/**
 * Détails approfondis des plateaux
 */
const PlateauDetails = ({ plateauAnalysis, exerciseName }) => {
  return (
    <div className="space-y-6">
      {plateauAnalysis.detectedPlateaus.map((plateau, index) => (
        <PlateauDetailCard key={index} plateau={plateau} exerciseName={exerciseName} />
      ))}
      
      {/* Informations de confiance */}
      <div className="card bg-blue-900/20 border border-blue-500/30">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-400 mt-1" />
          <div>
            <h4 className="font-medium text-blue-400 mb-2">Confiance de l'analyse</h4>
            <p className="text-sm text-secondary">
              Cette analyse a une confiance de {plateauAnalysis.confidence}% basée sur {plateauAnalysis.analysisDetails?.dataPoints || 'plusieurs'} points de données.
              {plateauAnalysis.analysisDetails?.timeSpan && (
                <span> Les données couvrent une période de {plateauAnalysis.analysisDetails.timeSpan} semaines.</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Carte détaillée pour un plateau spécifique
 */
const PlateauDetailCard = ({ plateau, exerciseName }) => {
  const severityConfig = {
    mild: { color: 'yellow', intensity: 'Faible', description: 'Ralentissement léger de la progression' },
    moderate: { color: 'orange', intensity: 'Modéré', description: 'Stagnation notable nécessitant des ajustements' },
    severe: { color: 'red', intensity: 'Sévère', description: 'Plateau prolongé nécessitant des changements importants' },
    critical: { color: 'red', intensity: 'Critique', description: 'Situation nécessitant une intervention immédiate' }
  };

  const config = severityConfig[plateau.severity] || severityConfig.moderate;

  return (
    <div className={`card border-l-4 border-${config.color}-500`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-primary capitalize">
          Plateau {plateau.type === 'weight' ? 'de Poids' : 
                   plateau.type === 'volume' ? 'de Volume' :
                   plateau.type === 'intensity' ? 'd\'Intensité' :
                   plateau.type === 'frequency' ? 'de Fréquence' : 'Motivationnel'}
        </h4>
        <div className="flex items-center space-x-2">
          <span className={`badge-${config.color} text-xs px-2 py-1 rounded-full`}>
            {config.intensity}
          </span>
          <AlertTriangle className={`h-4 w-4 text-${config.color}-400`} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-secondary">{config.description}</p>
        
        {/* Détails spécifiques du plateau */}
        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
          {plateau.weeksStuck && (
            <div className="flex justify-between">
              <span className="text-tertiary">Durée de stagnation:</span>
              <span className="text-primary">{plateau.weeksStuck} semaines</span>
            </div>
          )}
          
          {plateau.currentWeight && (
            <div className="flex justify-between">
              <span className="text-tertiary">Poids actuel:</span>
              <span className="text-primary">{plateau.currentWeight} kg</span>
            </div>
          )}
          
          {plateau.maxWeight && plateau.currentWeight !== plateau.maxWeight && (
            <div className="flex justify-between">
              <span className="text-tertiary">Poids maximum atteint:</span>
              <span className="text-primary">{plateau.maxWeight} kg</span>
            </div>
          )}
          
          {plateau.trend !== undefined && (
            <div className="flex justify-between">
              <span className="text-tertiary">Tendance:</span>
              <span className={`text-primary ${plateau.trend < 0 ? 'text-red-400' : plateau.trend > 0 ? 'text-green-400' : ''}`}>
                {plateau.trend > 0 ? '↗' : plateau.trend < 0 ? '↘' : '→'} {plateau.trend.toFixed(3)}
              </span>
            </div>
          )}
        </div>

        {/* Indicateurs motivationnels spécialisés */}
        {plateau.type === 'motivational' && plateau.indicators && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
            <h5 className="text-sm font-medium text-purple-400 mb-2">Indicateurs comportementaux</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(plateau.indicators).map(([key, value]) => (
                <div key={key} className={`flex items-center space-x-1 ${value ? 'text-red-400' : 'text-green-400'}`}>
                  <span>{value ? '❌' : '✅'}</span>
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Section des recommandations avec solutions IA
 */
const PlateauRecommendations = ({ 
  recommendations, 
  plateauAnalysis, 
  showAllRecommendations,
  onToggleAll 
}) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card text-center py-8">
        <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg text-secondary">Aucune recommandation disponible</p>
      </div>
    );
  }

  const priorityRecommendations = recommendations.slice(0, 2);
  const additionalRecommendations = recommendations.slice(2);

  return (
    <div className="space-y-6">
      {/* Recommandations prioritaires */}
      <div className="card bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="h-5 w-5 text-purple-400" />
          <h4 className="text-lg font-semibold text-primary">Solutions Prioritaires IA</h4>
        </div>
        <div className="space-y-3">
          {priorityRecommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                {index + 1}
              </div>
              <p className="text-sm text-secondary">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations supplémentaires */}
      {additionalRecommendations.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-primary">Recommandations Complémentaires</h4>
            <button
              onClick={onToggleAll}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              {showAllRecommendations ? 'Voir moins' : `Voir toutes (${additionalRecommendations.length})`}
            </button>
          </div>
          
          <div className="space-y-2">
            {(showAllRecommendations ? additionalRecommendations : additionalRecommendations.slice(0, 2)).map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                <Lightbulb className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-1" />
                <p className="text-sm text-secondary">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan d'action */}
      <ActionPlanSummary plateauAnalysis={plateauAnalysis} />
    </div>
  );
};

/**
 * Résumé du plan d'action basé sur l'analyse
 */
const ActionPlanSummary = ({ plateauAnalysis }) => {
  const severityActions = {
    mild: {
      timeframe: '1-2 semaines',
      approach: 'Ajustements légers',
      expectation: 'Reprise progressive'
    },
    moderate: {
      timeframe: '2-4 semaines',
      approach: 'Modifications du programme',
      expectation: 'Amélioration notable'
    },
    severe: {
      timeframe: '4-6 semaines',
      approach: 'Changement de stratégie',
      expectation: 'Restructuration complète'
    },
    critical: {
      timeframe: '6-8 semaines',
      approach: 'Intervention professionnelle',
      expectation: 'Évaluation médicale'
    }
  };

  const action = severityActions[plateauAnalysis.overallSeverity] || severityActions.moderate;

  return (
    <div className="card bg-green-900/20 border border-green-500/30">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="h-5 w-5 text-green-400" />
        <h4 className="text-lg font-semibold text-green-400">Plan d'Action Recommandé</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{action.timeframe}</div>
          <div className="text-sm text-secondary">Délai d'action</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">{action.approach}</div>
          <div className="text-sm text-secondary">Approche recommandée</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">{action.expectation}</div>
          <div className="text-sm text-secondary">Résultat attendu</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Graphique simple des tendances
 */
const TrendAnalysisChart = ({ trendData }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h5 className="text-sm font-medium text-secondary mb-2">Tendance Poids</h5>
        <div className="flex items-center space-x-2">
          <div className={`text-2xl ${trendData.weightTrend > 0 ? 'text-green-400' : trendData.weightTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {trendData.weightTrend > 0 ? '↗' : trendData.weightTrend < 0 ? '↘' : '→'}
          </div>
          <span className="text-primary">{trendData.weightTrend.toFixed(3)}</span>
        </div>
        <p className="text-xs text-tertiary mt-1">Variance: {trendData.weightVariance.toFixed(2)}</p>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <h5 className="text-sm font-medium text-secondary mb-2">Tendance Volume</h5>
        <div className="flex items-center space-x-2">
          <div className={`text-2xl ${trendData.volumeTrend > 0 ? 'text-green-400' : trendData.volumeTrend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {trendData.volumeTrend > 0 ? '↗' : trendData.volumeTrend < 0 ? '↘' : '→'}
          </div>
          <span className="text-primary">{trendData.volumeTrend.toFixed(0)}</span>
        </div>
        <p className="text-xs text-tertiary mt-1">Variance: {trendData.volumeVariance.toFixed(0)}</p>
      </div>
    </div>
  );
};

export default PlateauAnalysisView;
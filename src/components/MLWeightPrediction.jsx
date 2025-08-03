import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Brain, 
  Zap,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { getProgressionInsights } from '../utils/ml/weightPrediction';

const MLWeightPrediction = ({ exerciseName, workouts, currentWeight, onWeightSuggestion }) => {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (exerciseName && workouts && workouts.length > 0) {
      setIsLoading(true);
      
      // Simuler un petit délai pour l'effet ML
      setTimeout(() => {
        const result = getProgressionInsights(exerciseName, workouts);
        setPrediction(result);
        setIsLoading(false);
      }, 300);
    }
  }, [exerciseName, workouts]);

  if (!prediction && !isLoading) return null;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'text-green-400';
    if (confidence >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleApplyPrediction = () => {
    if (prediction && onWeightSuggestion) {
      onWeightSuggestion(prediction.predictedWeight);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full card p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">🤖 IA en train d'analyser...</p>
            <p className="text-xs text-gray-300">Calcul de la prédiction de poids</p>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction || prediction.confidence === 0) {
    return (
      <div className="w-full card p-4 mb-4">
        <div className="flex items-center space-x-3">
          <Brain className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Pas assez de données</p>
            <p className="text-xs text-gray-300">Continuez à vous entraîner pour obtenir des prédictions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full card p-4 mb-4">
      {/* Header avec titre et confiance */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <h4 className="font-semibold text-white text-sm">🤖 Prédiction IA</h4>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon(prediction.trend)}
          <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm ${getConfidenceColor(prediction.confidence)}`}>
            {prediction.confidence}% confiance
          </span>
        </div>
      </div>

      {/* Contenu principal en layout horizontal */}
      <div className="space-y-4">
        {/* Section prédiction et recommandation côte à côte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Prédiction principale */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-300 mb-1">Poids suggéré</p>
                <p className="text-xl font-bold text-white">
                  {prediction.predictedWeight}kg
                </p>
                {currentWeight && (
                  <p className="text-xs text-gray-400 mt-1">
                    Actuel: {currentWeight}kg
                  </p>
                )}
              </div>
              <button
                onClick={handleApplyPrediction}
                className="btn-primary px-4 py-2 text-sm font-medium flex items-center space-x-2"
              >
                <Target className="h-4 w-4" />
                <span>Appliquer</span>
              </button>
            </div>
          </div>

          {/* Recommandation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-white leading-relaxed">{prediction.recommendation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights et facteurs en layout horizontal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Insights */}
          {prediction.insights && prediction.insights.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <p className="text-sm font-medium text-white">Analyse IA</p>
              </div>
              <div className="space-y-2">
                {prediction.insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                    <Zap className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facteurs d'ajustement */}
          {prediction.factors && prediction.factors.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm font-medium text-white mb-3 flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Facteurs d'ajustement</span>
              </p>
              <div className="space-y-2">
                {prediction.factors.map((factor, index) => (
                  <div key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span className="leading-relaxed">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLWeightPrediction; 
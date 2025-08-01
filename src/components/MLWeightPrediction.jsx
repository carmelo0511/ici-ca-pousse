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
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleApplyPrediction = () => {
    if (prediction && onWeightSuggestion) {
      onWeightSuggestion(prediction.predictedWeight);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div>
            <p className="text-sm font-medium text-blue-800">🤖 IA en train d'analyser...</p>
            <p className="text-xs text-blue-600">Calcul de la prédiction de poids</p>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction || prediction.confidence === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
        <div className="flex items-center space-x-3">
          <Brain className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Pas assez de données</p>
            <p className="text-xs text-gray-500">Continuez à vous entraîner pour obtenir des prédictions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h4 className="font-semibold text-gray-800">🤖 Prédiction IA</h4>
        </div>
        <div className="flex items-center space-x-1">
          {getTrendIcon(prediction.trend)}
          <span className={`text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
            {prediction.confidence}% confiance
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Prédiction principale */}
        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Poids suggéré</p>
              <p className="text-lg font-bold text-purple-700">
                {prediction.predictedWeight}kg
              </p>
            </div>
            <button
              onClick={handleApplyPrediction}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-1"
            >
              <Target className="h-3 w-3" />
              <span>Appliquer</span>
            </button>
          </div>
        </div>

        {/* Recommandation */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-start space-x-2">
            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">{prediction.recommendation}</p>
          </div>
        </div>

        {/* Insights */}
        {prediction.insights && prediction.insights.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 flex items-center space-x-1">
              <BarChart3 className="h-3 w-3" />
              <span>Analyse IA</span>
            </p>
            <div className="space-y-1">
              {prediction.insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs text-gray-700">
                  <Zap className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facteurs d'ajustement */}
        {prediction.factors && prediction.factors.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
            <p className="text-xs font-medium text-yellow-800 mb-2">Facteurs d'ajustement :</p>
            <div className="space-y-1">
              {prediction.factors.map((factor, index) => (
                <div key={index} className="text-xs text-yellow-700 flex items-center space-x-1">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLWeightPrediction; 
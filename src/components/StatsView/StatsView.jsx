import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { Dumbbell, Target, TrendingUp, Clock, Zap, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/ml-dashboard.css';
import {
  analyzeWorkoutHabits,
  getPreferredWorkoutTime,
  getAverageDurationByTime,
} from '../../utils/workout/workoutUtils';
import { AdvancedPredictionPipeline } from '../../utils/ml/advancedPredictionPipeline.js';
import MLDashboard from '../ML/MLDashboard.jsx';
import PropTypes from 'prop-types';

function getMostWorkedMuscleGroup(workouts) {
  const muscleCount = {};
  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      if (ex.type) {
        muscleCount[ex.type] = (muscleCount[ex.type] || 0) + 1;
      }
    });
  });
  const sorted = Object.entries(muscleCount).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : 'Aucun';
}

const StatsView = ({ stats, workouts, user, className = '' }) => {
  const { t } = useTranslation();
  const workoutHabits = analyzeWorkoutHabits(workouts);
  const preferredTime = getPreferredWorkoutTime(workouts);
  const avgDurationByTime = getAverageDurationByTime(workouts);

  // État pour le menu déroulant Madame Irma
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [filterConfidence, setFilterConfidence] = useState('all');
  const [sortBy, setSortBy] = useState('confidence');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMLDashboard, setShowMLDashboard] = useState(false);
  const [mlPipeline, setMlPipeline] = useState(null);
  const [mlMetrics, setMlMetrics] = useState(null);

  // Préparer les données pour la courbe de poids
  const weightData = (user?.weightHistory || [])
    .map((w) => ({
      week: w.weekKey,
      weekFormatted: new Date(w.weekKey).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      }),
      weight: Number(w.value),
    }))
    .filter((w) => w.weight > 0)
    .sort((a, b) => new Date(a.week) - new Date(b.week));

  // Fonction d'analyse ML avancée
  const performMLAnalysis = React.useCallback(async () => {
    if (workouts.length === 0) return {};
    
    try {
      // Initialiser le pipeline ML avancé
      const pipeline = new AdvancedPredictionPipeline({
        minDataPoints: 3,
        modelConfig: {
          linear: { learningRate: 0.01, maxIterations: 1000 },
          forest: { nTrees: 12, maxDepth: 5 },
          neural: { epochs: 200, batchSize: 16 }
        }
      });
      
      // Initialiser avec les données utilisateur
      const initResult = await pipeline.initialize(workouts, user);
      console.log('🚀 Pipeline ML initialisé:', initResult);
      
      // Analyser tous les exercices
      const mlAnalysis = await pipeline.analyzeAllExercises(workouts);
      
      // Stocker le pipeline et ses métriques pour le dashboard
      setMlPipeline(pipeline);
      setMlMetrics(pipeline.getPipelineMetrics());
      
      // Convertir le format ML vers le format attendu par l'interface
      const convertedAnalysis = {};
      Object.entries(mlAnalysis).forEach(([exerciseName, mlPrediction]) => {
        if (mlPrediction.confidence > 0) {
          convertedAnalysis[exerciseName] = {
            confidence: Math.round(mlPrediction.confidence),
            lastWeight: mlPrediction.currentWeight,
            predictedWeight: mlPrediction.predictedWeight,
            recommendation: mlPrediction.recommendations?.[0] || 
              `Prédiction ML basée sur ${mlPrediction.features?.progression_2weeks || 'vos données'} d'entraînement`,
            increment: mlPrediction.increment,
            plateauAnalysis: mlPrediction.plateauAnalysis,
            insights: mlPrediction.insights,
            modelInfo: mlPrediction.modelInfo
          };
        }
      });
      
      return convertedAnalysis;
    } catch (error) {
      console.warn('⚠️ Erreur du pipeline ML, fallback vers analyse simple:', error);
      // Fallback vers l'ancienne méthode en cas d'erreur
      const { analyzeAllExercises } = await import('../../utils/ml/weightPrediction');
      return analyzeAllExercises(workouts);
    }
  }, [workouts, user]);

  // State pour gérer l'analyse asynchrone
  const [analysisData, setAnalysisData] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Effet pour exécuter l'analyse ML
  React.useEffect(() => {
    if (workouts.length > 0) {
      setIsAnalyzing(true);
      performMLAnalysis().then(result => {
        setAnalysisData(result);
        setIsAnalyzing(false);
      }).catch(error => {
        console.error('Erreur analyse ML:', error);
        setAnalysisData({});
        setIsAnalyzing(false);
      });
    } else {
      setAnalysisData({});
      setIsAnalyzing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workouts.length, user]);

  const exercisesWithData = useMemo(() => {
    return Object.entries(analysisData).filter(
      ([_, analysis]) => analysis.confidence > 0
    );
  }, [analysisData]);

  // Logique de filtrage et tri pour Madame Irma
  const filteredExercises = useMemo(() => {
    return exercisesWithData
      .filter(([name, analysis]) => {
        // Filtre par confiance
        if (filterConfidence === 'high' && analysis.confidence < 70) return false;
        if (filterConfidence === 'medium' && (analysis.confidence < 40 || analysis.confidence >= 70)) return false;
        if (filterConfidence === 'low' && analysis.confidence >= 40) return false;
        
        // Filtre par recherche
        if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'confidence': return b[1].confidence - a[1].confidence;
          case 'name': return a[0].localeCompare(b[0]);
          case 'progression': return (b[1].predictedWeight - b[1].lastWeight) - (a[1].predictedWeight - a[1].lastWeight);
          default: return 0;
        }
      });
  }, [exercisesWithData, filterConfidence, searchTerm, sortBy]);

  const displayedExercises = showAllExercises ? filteredExercises : filteredExercises.slice(0, 6);
  
  const irmaStats = useMemo(() => ({
    total: exercisesWithData.length,
    avgConfidence: exercisesWithData.length > 0 ? Math.round(exercisesWithData.reduce((sum, [, analysis]) => sum + analysis.confidence, 0) / exercisesWithData.length) : 0,
    highConfidence: exercisesWithData.filter(([, analysis]) => analysis.confidence >= 70).length
  }), [exercisesWithData]);

  return (
    <div className={`p-6 space-y-8 ${className}`}>
      <div>
        <h2 className="section-title text-3xl">
          Statistiques
        </h2>
        <p className="text-secondary mt-1">{t('stats_subtitle')}</p>
      </div>

      {/* Courbe d'évolution du poids */}
      <div className="card mb-8">
        <h3 className="section-title text-xl mb-4 flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 nav-icon" />
          <span>Évolution du poids</span>
        </h3>
        {weightData.length === 0 ? (
                  <div className="text-center py-8 text-white">
          Aucune donnée de poids enregistrée.
          <br />
          Ajoutez votre poids dans le profil pour voir la courbe !
        </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={weightData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="weekFormatted" fontSize={12} fill="white" />
              <YAxis domain={['auto', 'auto']} tickCount={6} fill="white" />
              <Tooltip
                formatter={(value, name) => [value + ' kg', 'Poids']}
                labelFormatter={(label) => `Semaine du ${label}`}
                contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '8px', color: 'white' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 6 }}
              >
                <LabelList position="top" offset={12} fontSize={12} fill="white" />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Madame IrmIA */}
      {workouts.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-xl flex items-center space-x-2">
              <span>🤖</span>
              <span>Madame IrmIA v2.0 - IA Avancée</span>
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowMLDashboard(!showMLDashboard)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  showMLDashboard
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {showMLDashboard ? '📊 Masquer Dashboard' : '📊 Dashboard ML'}
              </button>
              {mlPipeline && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  title="Réentraîner les modèles"
                >
                  🔄
                </button>
              )}
            </div>
          </div>

          {isAnalyzing ? (
            <div className="text-center py-8">
              <div className="animate-spin text-6xl mb-4">🧠</div>
              <p className="mb-2 text-secondary">Analyse ML en cours...</p>
              <p className="text-sm text-tertiary">
                Traitement des modèles d'intelligence artificielle
              </p>
            </div>
          ) : exercisesWithData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🧠</div>
              <p className="mb-2 text-secondary">Pas encore assez de données</p>
              <p className="text-sm text-tertiary">
                Continuez à vous entraîner pour obtenir des prédictions de Madame IrmIA
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-6">
                <p className="text-secondary mb-2">
                  🚀 <strong>Nouveau!</strong> Madame IrmIA v2.0 utilise un ensemble de 3 modèles ML avancés :
                  Régression Linéaire + Random Forest + Réseau de Neurones
                </p>
                <p className="text-sm text-tertiary">
                  Contraintes réalistes de musculation • Détection de plateaux • 20+ features avancées
                </p>
              </div>

              {/* Dashboard ML intégré */}
              {showMLDashboard && mlPipeline && (
                <div className="mb-6 border border-purple-500/30 rounded-lg p-4">
                  <MLDashboard
                    predictions={analysisData}
                    modelPerformance={mlPipeline.trainingMetrics?.individualPerformances}
                    plateauAnalysis={Object.fromEntries(
                      Object.entries(analysisData).map(([name, analysis]) => [
                        name,
                        analysis.plateauAnalysis || { isPlateau: false }
                      ])
                    )}
                    constraints={{
                      minIncrement: 0.5,
                      maxIncrement: 2.5,
                      plateauThreshold: 4
                    }}
                    pipelineMetrics={mlMetrics}
                    onRefresh={() => window.location.reload()}
                  />
                </div>
              )}
              
              {/* Statistiques globales */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card text-center ml-stats-card">
                  <div className="text-lg font-bold text-primary flex items-center justify-center space-x-1">
                    <span>🎯</span>
                    <span>{irmaStats.total}</span>
                  </div>
                  <div className="text-xs text-tertiary">Exercices analysés</div>
                </div>
                <div className="card text-center ml-stats-card">
                  <div className="text-lg font-bold text-primary flex items-center justify-center space-x-1">
                    <span>🧠</span>
                    <span>{irmaStats.avgConfidence}%</span>
                  </div>
                  <div className="text-xs text-tertiary">Confiance ML</div>
                </div>
                <div className="card text-center ml-stats-card">
                  <div className="text-lg font-bold text-primary flex items-center justify-center space-x-1">
                    <span>⭐</span>
                    <span>{irmaStats.highConfidence}</span>
                  </div>
                  <div className="text-xs text-tertiary">Haute confiance (≥70%)</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto ml-predictions-scroll pr-2">
                {displayedExercises.map(([exerciseName, analysis]) => (
                  <div key={exerciseName} className="card ml-prediction-card">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-primary text-sm truncate">
                        {exerciseName}
                      </h4>
                      <span className={`status-badge text-xs font-medium px-2 py-1 rounded-full ml-confidence-badge ${
                        analysis.confidence >= 70 
                          ? 'badge-success high'
                          : analysis.confidence >= 40
                            ? 'badge-warning medium'
                            : 'badge-danger low'
                      }`}>
                        {analysis.confidence}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-tertiary">💪 Actuel</span>
                        <span className="text-sm font-medium text-primary">
                          {analysis.lastWeight}kg
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-tertiary">🤖 IA Prédiction</span>
                        <span className="text-sm font-bold badge">
                          {analysis.predictedWeight}kg
                        </span>
                      </div>
                      
                      {analysis.increment !== undefined && analysis.increment > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-green-400">
                          <TrendingUp className="h-3 w-3" />
                          <span>+{analysis.increment.toFixed(1)}kg progression</span>
                        </div>
                      )}
                      
                      {analysis.plateauAnalysis?.isPlateau && (
                        <div className="flex items-center space-x-1 text-xs text-orange-400">
                          <span>⚠️</span>
                          <span>Plateau détecté ({analysis.plateauAnalysis.weeksStuck} sem)</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-purple-500/30">
                      <div className="space-y-1">
                        <p className="text-xs text-secondary">
                          {analysis.recommendation}
                        </p>
                        {analysis.modelInfo && (
                          <p className="text-xs text-tertiary flex items-center space-x-1">
                            <span>🧠</span>
                            <span>{analysis.modelInfo.type === 'EnsembleModel' ? 'Ensemble ML' : analysis.modelInfo.type}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Section scrollable avec tous les exercices */}
              <div className="space-y-4">
                <div className="text-center">
                  <button
                    onClick={() => setShowAllExercises(!showAllExercises)}
                    className="inline-flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 ml-toggle-button"
                  >
                    <span>
                      {showAllExercises 
                        ? `Masquer les exercices` 
                        : `Voir tous les exercices (${exercisesWithData.length})`
                      }
                    </span>
                    {showAllExercises ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {/* Menu de filtres et tri */}
                {showAllExercises && (
                    <div className="card space-y-4 transition-all duration-300 ease-in-out ml-filters-container">
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {/* Recherche */}
                        <div className="relative flex-1 max-w-xs">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Rechercher un exercice..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none ml-search-input"
                          />
                        </div>
                        
                        {/* Filtres par confiance */}
                        <div className="flex items-center space-x-2">
                          <Filter className="h-4 w-4 text-gray-400" />
                          <div className="flex space-x-1">
                            {[
                              { key: 'all', label: 'Tous' },
                              { key: 'high', label: '70%+' },
                              { key: 'medium', label: '40-69%' },
                              { key: 'low', label: '<40%' }
                            ].map(filter => (
                              <button
                                key={filter.key}
                                onClick={() => setFilterConfidence(filter.key)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ml-filter-button ${
                                  filterConfidence === filter.key
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                {filter.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Tri */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">Tri:</span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                          >
                            <option value="confidence">Confiance</option>
                            <option value="name">Nom</option>
                            <option value="progression">Progression</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Résultats filtrés */}
                      {filteredExercises.length === 0 && (searchTerm || filterConfidence !== 'all') && (
                        <div className="text-center py-4 text-gray-400">
                          Aucun exercice trouvé avec ces critères
                        </div>
                      )}
                      
                      {filteredExercises.length > 0 && filteredExercises.length !== exercisesWithData.length && (
                        <div className="text-sm text-gray-400 text-center">
                          {filteredExercises.length} exercice(s) sur {exercisesWithData.length}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">
                {t('total_workouts')}
              </p>
              <p className="text-4xl font-bold text-white">{stats.totalWorkouts}</p>
            </div>
            <div className="icon-primary p-3 rounded-lg">
              <Target className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">
                {t('total_sets')}
              </p>
              <p className="text-4xl font-bold text-white">{stats.totalSets}</p>
            </div>
            <div className="icon-secondary p-3 rounded-lg">
              <Dumbbell className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">
                {t('total_reps')}
              </p>
              <p className="text-4xl font-bold text-white">{stats.totalReps}</p>
            </div>
            <div className="icon-success p-3 rounded-lg">
              <TrendingUp className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">
                {t('avg_duration')}
              </p>
              <p className="text-4xl font-bold text-white">{stats.avgDuration} min</p>
            </div>
            <div className="icon-warning p-3 rounded-lg">
              <Clock className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">
                {t('regularity')}
              </p>
              <p className="text-4xl font-bold text-white">
                {workouts.length > 0 ? '💪' : '🔥'}
              </p>
            </div>
            <div className="icon-primary p-3 rounded-lg">
              <Zap className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm font-medium">
                Groupe préféré
              </p>
              <p className="text-2xl font-bold text-white">
                {getMostWorkedMuscleGroup(workouts)}
              </p>
            </div>
            <div className="icon-success p-3 rounded-lg">
              <Dumbbell className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Habitudes d'entraînement */}
      {workoutHabits.totalWithTime > 0 && (
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Clock className="h-6 w-6" />
            <span>Habitudes d'entraînement</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Moment préféré */}
            <div className="card">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Moment préféré
              </h4>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{preferredTime.icon}</span>
                <div>
                  <p className="text-xl font-bold text-white">
                    {preferredTime.name}
                  </p>
                  <p className="text-sm text-white">
                    {preferredTime.count} séances ({preferredTime.percentage}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Répartition par moment */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-800">
                Répartition
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>🌅</span>
                    <span>Matin (5h-12h)</span>
                  </span>
                  <span className="font-semibold text-white">
                    {workoutHabits.morning.count} (
                    {workoutHabits.morning.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>☀️</span>
                    <span>Après-midi (12h-18h)</span>
                  </span>
                  <span className="font-semibold text-white">
                    {workoutHabits.afternoon.count} (
                    {workoutHabits.afternoon.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>🌆</span>
                    <span>Soir (18h-22h)</span>
                  </span>
                  <span className="font-semibold text-white">
                    {workoutHabits.evening.count} (
                    {workoutHabits.evening.percentage}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>🌙</span>
                    <span>Nuit (22h-5h)</span>
                  </span>
                  <span className="font-semibold text-white">
                    {workoutHabits.night.count} (
                    {workoutHabits.night.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Durée moyenne par moment */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Durée moyenne par moment
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center">
                <div className="text-2xl mb-1">🌅</div>
                <div className="font-bold text-white">
                  {avgDurationByTime.morning} min
                </div>
                <div className="text-sm text-white">Matin</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl mb-1">☀️</div>
                <div className="font-bold text-white">
                  {avgDurationByTime.afternoon} min
                </div>
                <div className="text-sm text-white">Après-midi</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl mb-1">🌆</div>
                <div className="font-bold text-white">
                  {avgDurationByTime.evening} min
                </div>
                <div className="text-sm text-white">Soir</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl mb-1">🌙</div>
                <div className="font-bold text-white">
                  {avgDurationByTime.night} min
                </div>
                <div className="text-sm text-white">Nuit</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Recommandations */}
      <div className="card">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <Target className="h-6 w-6" />
          <span>Recommandations personnalisées</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recommandation basée sur la fréquence */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>📊</span>
              <span>Fréquence d'entraînement</span>
            </h4>
            {(() => {
              const recentWorkouts = workouts.filter((w) => {
                const workoutDate = new Date(w.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return workoutDate >= thirtyDaysAgo;
              });

              if (workouts.length === 0) {
                return (
                  <p className="text-gray-600">
                    Commencez par faire votre première séance !
                  </p>
                );
              } else if (recentWorkouts.length < 4) {
                return (
                  <p className="text-gray-600">
                    Augmentez votre fréquence : visez 3-4 séances par semaine
                    pour de meilleurs résultats.
                  </p>
                );
              } else if (recentWorkouts.length < 8) {
                return (
                  <p className="text-gray-600">
                    Bonne régularité ! Maintenez ce rythme pour progresser
                    constamment.
                  </p>
                );
              } else if (recentWorkouts.length < 12) {
                return (
                  <p className="text-gray-600">
                    Excellent rythme ! Vous êtes sur la bonne voie pour
                    atteindre vos objectifs.
                  </p>
                );
              } else {
                return (
                  <p className="text-gray-600">
                    Impressionnant ! Votre régularité est exemplaire. Continuez
                    ainsi !
                  </p>
                );
              }
            })()}
          </div>

          {/* Recommandation basée sur le groupe musculaire */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>💪</span>
              <span>Équilibre musculaire</span>
            </h4>
            {(() => {
              const muscleCount = {};
              const recentWorkouts = workouts.filter((w) => {
                const workoutDate = new Date(w.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return workoutDate >= thirtyDaysAgo;
              });

              recentWorkouts.forEach((w) => {
                w.exercises.forEach((ex) => {
                  if (ex.type) {
                    muscleCount[ex.type] = (muscleCount[ex.type] || 0) + 1;
                  }
                });
              });

              const muscleGroups = Object.keys(muscleCount);

              if (muscleGroups.length < 2) {
                return (
                  <p className="text-gray-600">
                    Diversifiez vos entraînements ! Ajoutez des exercices pour
                    d'autres groupes musculaires.
                  </p>
                );
              } else if (muscleGroups.length < 4) {
                return (
                  <p className="text-gray-600">
                    Bon équilibre ! Essayez d'ajouter 1-2 groupes musculaires
                    supplémentaires.
                  </p>
                );
              } else if (muscleGroups.length < 6) {
                return (
                  <p className="text-gray-600">
                    Excellent équilibre ! Vous travaillez une bonne variété de
                    muscles.
                  </p>
                );
              } else {
                return (
                  <p className="text-gray-600">
                    Parfait ! Votre programme est très équilibré et complet.
                  </p>
                );
              }
            })()}
          </div>

          {/* Recommandation basée sur la durée */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>⏱️</span>
              <span>Durée des séances</span>
            </h4>
            {(() => {
              const recentWorkouts = workouts.filter((w) => {
                const workoutDate = new Date(w.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return workoutDate >= thirtyDaysAgo;
              });

              const recentAvgDuration =
                recentWorkouts.length > 0
                  ? recentWorkouts.reduce(
                      (total, w) => total + (w.duration || 0),
                      0
                    ) / recentWorkouts.length
                  : stats.avgDuration;

              if (recentAvgDuration < 25) {
                return (
                  <p className="text-gray-600">
                    Séances courtes : augmentez progressivement à 30-45 min pour
                    de meilleurs résultats.
                  </p>
                );
              } else if (recentAvgDuration < 45) {
                return (
                  <p className="text-gray-600">
                    Durée équilibrée ! Parfait pour maintenir votre forme et
                    progresser.
                  </p>
                );
              } else if (recentAvgDuration < 75) {
                return (
                  <p className="text-gray-600">
                    Séances intenses ! Excellente intensité pour maximiser vos
                    gains.
                  </p>
                );
              } else {
                return (
                  <p className="text-gray-600">
                    Séances très longues ! Assurez-vous de bien récupérer et de
                    varier l'intensité.
                  </p>
                );
              }
            })()}
          </div>

          {/* Recommandation basée sur le moment */}
          <div className="card">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>🌅</span>
              <span>Moment d'entraînement</span>
            </h4>
            {(() => {
              const recentWorkouts = workouts.filter((w) => {
                const workoutDate = new Date(w.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return workoutDate >= thirtyDaysAgo;
              });

              const timeDistribution = {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0,
              };
              recentWorkouts.forEach((w) => {
                if (w.startTime) {
                  const hour = parseInt(w.startTime.split(':')[0]);
                  if (hour >= 5 && hour < 12) timeDistribution.morning++;
                  else if (hour >= 12 && hour < 18)
                    timeDistribution.afternoon++;
                  else if (hour >= 18 && hour < 22) timeDistribution.evening++;
                  else timeDistribution.night++;
                }
              });

              const totalWithTime = Object.values(timeDistribution).reduce(
                (a, b) => a + b,
                0
              );
              const preferredTimeRecent =
                totalWithTime > 0
                  ? Object.entries(timeDistribution).reduce((a, b) =>
                      a[1] > b[1] ? a : b
                    )[0]
                  : preferredTime.name.toLowerCase();

              if (
                preferredTimeRecent === 'morning' ||
                preferredTimeRecent === 'matin'
              ) {
                return (
                  <p className="text-gray-600">
                    Entraînement matinal ! Excellent pour booster votre
                    métabolisme et commencer la journée en forme.
                  </p>
                );
              } else if (
                preferredTimeRecent === 'afternoon' ||
                preferredTimeRecent === 'après-midi'
              ) {
                return (
                  <p className="text-gray-600">
                    Séances d'après-midi ! Moment optimal pour des performances
                    maximales et une récupération efficace.
                  </p>
                );
              } else if (
                preferredTimeRecent === 'evening' ||
                preferredTimeRecent === 'soir'
              ) {
                return (
                  <p className="text-gray-600">
                    Entraînement du soir ! Pensez à bien vous étirer et à manger
                    léger après la séance.
                  </p>
                );
              } else {
                return (
                  <p className="text-gray-600">
                    Séances nocturnes ! Assurez-vous de bien vous reposer et
                    d'éviter les stimulants après l'entraînement.
                  </p>
                );
              }
            })()}
          </div>
        </div>

        {/* Recommandation générale */}
        <div className="mt-6 card">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <span>🎯</span>
            <span>Objectif du mois</span>
          </h4>
          {(() => {
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();
            const monthWorkouts = workouts.filter((w) => {
              const workoutDate = new Date(w.date);
              return (
                workoutDate.getMonth() === thisMonth &&
                workoutDate.getFullYear() === thisYear
              );
            });

            const daysElapsed = new Date().getDate();
            const progressPercentage =
              (monthWorkouts.length /
                Math.max(1, Math.floor(daysElapsed / 7) * 3)) *
              100;

            if (monthWorkouts.length < 4) {
              return (
                <p className="text-gray-600">
                  Objectif : Faites au moins 8 séances ce mois-ci pour maintenir
                  votre progression ! ({Math.round(progressPercentage)}% de
                  l'objectif)
                </p>
              );
            } else if (monthWorkouts.length < 8) {
              return (
                <p className="text-gray-600">
                  Objectif : Essayez d'atteindre 12 séances ce mois-ci pour
                  optimiser vos résultats ! ({Math.round(progressPercentage)}%
                  de l'objectif)
                </p>
              );
            } else if (monthWorkouts.length < 12) {
              return (
                <p className="text-gray-600">
                  Excellent ! Visez 16 séances ce mois-ci pour maximiser vos
                  gains ! ({Math.round(progressPercentage)}% de l'objectif)
                </p>
              );
            } else {
              return (
                <p className="text-gray-600">
                  Félicitations ! Vous avez dépassé l'objectif du mois.
                  Continuez ainsi ! ({Math.round(progressPercentage)}% de
                  l'objectif)
                </p>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
};

StatsView.propTypes = {
  stats: PropTypes.object.isRequired,
  workouts: PropTypes.array.isRequired,
  user: PropTypes.object,
  className: PropTypes.string,
};

export default StatsView;

import React, { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFriends } from '../hooks/useFriends';
import { BarChart3, Trophy, Target, Clock, Dumbbell, Repeat, Calendar } from 'lucide-react';
import { 
  PERIODS, 
  METRICS, 
  calculateUserStats, 
  getLeaderboardRanking, 
  formatMetricValue, 
  getPeriodLabel, 
  getMetricLabel 
} from '../utils/leaderboardUtils';

function Leaderboard({ user, onShowComparison }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.WEEK);
  const [selectedMetric, setSelectedMetric] = useState(METRICS.WORKOUTS);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const { friends } = useFriends(user);

  // Récupère les stats pour chaque ami + soi-même
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const allUsers = [user, ...friends];
      const statsArr = [];

      for (const u of allUsers) {
        if (!u) continue;
        
        try {
          // Récupérer les workouts de l'utilisateur
          const q = query(collection(db, 'workouts'), where('userId', '==', u.uid));
          const snap = await getDocs(q);
          const workouts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Calculer les statistiques
          const userStats = calculateUserStats(workouts, selectedPeriod);
          
          statsArr.push({
            uid: u.uid,
            displayName: u.displayName || u.email,
            stats: userStats,
            workouts: workouts
          });
        } catch (error) {
          console.error(`Erreur lors de la récupération des stats pour ${u.displayName}:`, error);
        }
      }

      setStats(statsArr);
      setLoading(false);
    };

    if (user) fetchStats();
  }, [user, friends, selectedPeriod]);

  // Obtenir le classement actuel
  const currentRanking = getLeaderboardRanking(stats, selectedMetric);

  // Obtenir la liste des exercices disponibles
  const getAvailableExercises = () => {
    const exercises = new Set();
    stats.forEach(user => {
      Object.keys(user.stats.exerciseStats || {}).forEach(exerciseName => {
        exercises.add(exerciseName);
      });
    });
    return Array.from(exercises).sort();
  };

  // Obtenir le classement pour un exercice spécifique
  const getExerciseRanking = (exerciseName) => {
    return stats
      .map(user => ({
        uid: user.uid,
        displayName: user.displayName,
        value: user.stats.exerciseStats?.[exerciseName]?.totalWeight || 0,
        stats: user.stats.exerciseStats?.[exerciseName] || null
      }))
      .filter(user => user.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
      }));
  };

  const exerciseRanking = selectedExercise ? getExerciseRanking(selectedExercise) : [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-lg space-y-4 md:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🏆 Leaderboard
        </h2>
        {friends.length > 0 && (
          <button
            onClick={onShowComparison}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Comparaison détaillée</span>
          </button>
        )}
      </div>

      {/* Sélecteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Période */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Période</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
          >
            <option value={PERIODS.WEEK}>Cette semaine</option>
            <option value={PERIODS.MONTH}>Ce mois</option>
            <option value={PERIODS.YEAR}>Cette année</option>
            <option value={PERIODS.ALL_TIME}>Tout le temps</option>
          </select>
        </div>

        {/* Métrique */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Métrique</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
          >
            <option value={METRICS.WORKOUTS}>Séances</option>
            <option value={METRICS.DURATION}>Temps total</option>
            <option value={METRICS.TOTAL_WEIGHT}>Poids total</option>
            <option value={METRICS.TOTAL_REPS}>Répétitions</option>
            <option value={METRICS.TOTAL_SETS}>Séries</option>
          </select>
        </div>

        {/* Exercice spécifique */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Exercice spécifique</label>
          <select
            value={selectedExercise || ''}
            onChange={(e) => setSelectedExercise(e.target.value || null)}
            className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
          >
            <option value="">Tous les exercices</option>
            {getAvailableExercises().map(exercise => (
              <option key={exercise} value={exercise}>{exercise}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Affichage du classement */}
      {loading ? (
        <div className="text-center py-6 md:py-8">
          <div className="text-gray-400 text-sm">Chargement du classement...</div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {/* Titre du classement */}
          <div className="text-center">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 px-2">
              {getPeriodLabel(selectedPeriod)} - {getMetricLabel(selectedMetric)}
              {selectedExercise && ` - ${selectedExercise}`}
            </h3>
          </div>

          {/* Classement principal */}
          <div className="bg-gray-50 rounded-xl p-3 md:p-4">
            <div className="space-y-2 md:space-y-3">
              {selectedExercise ? (
                // Classement par exercice spécifique
                exerciseRanking.length > 0 ? (
                  exerciseRanking.map((user, idx) => (
                    <div
                      key={user.uid}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 rounded-lg space-y-2 sm:space-y-0 ${
                        user.uid === user?.uid ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="text-xl md:text-2xl">{user.medal || `#${user.rank}`}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm md:text-base truncate">{user.displayName}</div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {user.stats?.count || 0} fois • Meilleur: {user.stats?.bestWeight || 0}kg
                          </div>
                        </div>
                      </div>
                      <div className="text-right sm:text-right">
                        <div className="font-bold text-base md:text-lg text-indigo-600">
                          {formatMetricValue(user.value, METRICS.EXERCISE_SPECIFIC)}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">
                          {user.stats?.totalReps || 0} reps total
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 md:py-8 text-gray-500 text-sm">
                    Aucune donnée pour cet exercice sur cette période
                  </div>
                )
              ) : (
                // Classement général
                currentRanking.length > 0 ? (
                  currentRanking.map((user, idx) => (
                    <div
                      key={user.uid}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 rounded-lg space-y-2 sm:space-y-0 ${
                        user.uid === user?.uid ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <div className="text-xl md:text-2xl">{user.medal || `#${user.rank}`}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm md:text-base truncate">{user.displayName}</div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {user.stats.totalWorkouts} séances • {user.stats.averageWorkoutDuration}min/séance
                          </div>
                        </div>
                      </div>
                      <div className="text-right sm:text-right">
                        <div className="font-bold text-base md:text-lg text-indigo-600">
                          {formatMetricValue(user.value, selectedMetric)}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500">
                          {user.stats.workoutFrequency} séances/semaine
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 md:py-8 text-gray-500 text-sm">
                    Aucune donnée sur cette période
                  </div>
                )
              )}
            </div>
          </div>

          {/* Statistiques supplémentaires */}
          {!selectedExercise && currentRanking.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 md:p-4 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  <span className="font-semibold text-green-800 text-sm md:text-base">Champion</span>
                </div>
                <div className="text-lg md:text-2xl font-bold text-green-600 truncate">
                  {currentRanking[0]?.displayName}
                </div>
                <div className="text-xs md:text-sm text-green-600">
                  {formatMetricValue(currentRanking[0]?.value, selectedMetric)}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800 text-sm md:text-base">Ton rang</span>
                </div>
                <div className="text-lg md:text-2xl font-bold text-blue-600">
                  #{currentRanking.find(u => u.uid === user?.uid)?.rank || 'N/A'}
                </div>
                <div className="text-xs md:text-sm text-blue-600">
                  {formatMetricValue(currentRanking.find(u => u.uid === user?.uid)?.value || 0, selectedMetric)}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 md:p-4 rounded-xl border border-purple-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  <span className="font-semibold text-purple-800 text-sm md:text-base">Participants</span>
                </div>
                <div className="text-lg md:text-2xl font-bold text-purple-600">
                  {currentRanking.length}
                </div>
                <div className="text-xs md:text-sm text-purple-600">
                  actifs sur cette période
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard; 
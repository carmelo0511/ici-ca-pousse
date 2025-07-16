import React, { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFriends } from '../hooks/useFriends';
import { BarChart3 } from 'lucide-react';
import { 
  PERIODS, 
  METRICS, 
  calculateUserStats, 
  getLeaderboardRanking, 
  formatMetricValue, 
  getPeriodLabel, 
  getMetricLabel,
  getAllowedExercises
} from '../utils/leaderboardUtils';
import BadgeList from './Badges';

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
            badges: u.badges || [],
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

  // Obtenir le classement actuel - par défaut basé sur les séances
  const currentRanking = getLeaderboardRanking(stats, selectedMetric);

  // Obtenir le classement pour un exercice spécifique
  const getExerciseRanking = (exerciseName) => {
    return stats
      .map(user => ({
        uid: user.uid,
        displayName: user.displayName,
        badges: user.badges,
        value: user.stats.exerciseStats?.[exerciseName]?.maxWeight || 0,
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
            <option value={METRICS.MAX_WEIGHT}>Poids max</option>
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
            {getAllowedExercises().map(exercise => (
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
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="text-xl md:text-2xl">{user.medal || `#${user.rank}`}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm md:text-base truncate">{user.displayName}</div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {user.stats?.count || 0} fois
                          </div>
                        </div>
                        {user.badges && user.badges.length > 0 && (
                          <BadgeList badges={user.badges} size="sm" maxDisplay={3} />
                        )}
                      </div>
                      <div className="text-right sm:text-right">
                        <div className="font-bold text-base md:text-lg text-indigo-600">
                          {formatMetricValue(user.value, METRICS.MAX_WEIGHT)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Aucun classement disponible pour cet exercice
                  </div>
                )
              ) : (
                // Classement général - par défaut basé sur les séances
                currentRanking.length > 0 ? (
                  currentRanking.map((user, idx) => (
                    <div
                      key={user.uid}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 rounded-lg space-y-2 sm:space-y-0 ${
                        user.uid === user?.uid ? 'bg-indigo-100 border-2 border-indigo-300' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="text-xl md:text-2xl">{user.medal || `#${user.rank}`}</div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm md:text-base truncate">{user.displayName}</div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {user.stats.workouts || 0} séances • Poids max: {user.stats.maxWeight || 0}kg
                          </div>
                        </div>
                        {user.badges && user.badges.length > 0 && (
                          <BadgeList badges={user.badges} size="sm" maxDisplay={3} />
                        )}
                      </div>
                      <div className="text-right sm:text-right">
                        <div className="font-bold text-base md:text-lg text-indigo-600">
                          {formatMetricValue(user.value, selectedMetric)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Aucun classement disponible
                  </div>
                )
              )}
            </div>
          </div>

          {/* Statistiques rapides */}
          {!selectedExercise && currentRanking.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-3 md:p-4 rounded-lg text-center">
                <div className="text-2xl md:text-3xl font-bold">🥇</div>
                <div className="text-sm md:text-base font-semibold">{currentRanking[0]?.displayName}</div>
                <div className="text-xs md:text-sm opacity-90">
                  {formatMetricValue(currentRanking[0]?.value || 0, selectedMetric)}
                </div>
              </div>
              
              {currentRanking[1] && (
                <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white p-3 md:p-4 rounded-lg text-center">
                  <div className="text-2xl md:text-3xl font-bold">🥈</div>
                  <div className="text-sm md:text-base font-semibold">{currentRanking[1]?.displayName}</div>
                  <div className="text-xs md:text-sm opacity-90">
                    {formatMetricValue(currentRanking[1]?.value || 0, selectedMetric)}
                  </div>
                </div>
              )}
              
              {currentRanking[2] && (
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-3 md:p-4 rounded-lg text-center">
                  <div className="text-2xl md:text-3xl font-bold">🥉</div>
                  <div className="text-sm md:text-base font-semibold">{currentRanking[2]?.displayName}</div>
                  <div className="text-xs md:text-sm opacity-90">
                    {formatMetricValue(currentRanking[2]?.value || 0, selectedMetric)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard; 
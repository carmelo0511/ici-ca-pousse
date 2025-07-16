import React, { useState } from 'react';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFriends } from '../hooks/useFriends';
import { BarChart3, Calendar, Target, TrendingUp } from 'lucide-react';

function StatsComparison({ user }) {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { friends } = useFriends(user);

  // Récupère les stats détaillées pour un ami
  const fetchFriendStats = async (friend) => {
    setLoading(true);
    setSelectedFriend(friend);
    
    // Récupère les séances de l'ami
    const q = query(collection(db, 'workouts'), where('userId', '==', friend.uid));
    const snap = await getDocs(q);
    const friendWorkouts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Récupère les séances de l'utilisateur actuel
    const userQ = query(collection(db, 'workouts'), where('userId', '==', user.uid));
    const userSnap = await getDocs(userQ);
    const userWorkouts = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calcule les stats
    const calculateStats = (workouts) => {
      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce((sum, w) => sum + (parseInt(w.duration) || 0), 0);
      const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0);
      const totalSets = workouts.reduce((sum, w) => 
        sum + w.exercises.reduce((exSum, ex) => exSum + ex.sets.length, 0), 0
      );
      
      // Stats par mois (6 derniers mois)
      const monthlyStats = {};
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = month.toISOString().slice(0, 7); // YYYY-MM
        monthlyStats[monthKey] = 0;
      }
      
      workouts.forEach(workout => {
        const workoutMonth = workout.date.slice(0, 7);
        if (monthlyStats[workoutMonth] !== undefined) {
          monthlyStats[workoutMonth]++;
        }
      });
      
      return {
        totalWorkouts,
        totalDuration,
        totalExercises,
        totalSets,
        avgDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
        avgExercises: totalWorkouts > 0 ? Math.round(totalExercises / totalWorkouts) : 0,
        avgSets: totalWorkouts > 0 ? Math.round(totalSets / totalWorkouts) : 0,
        monthlyStats: Object.entries(monthlyStats).reverse()
      };
    };
    
    const friendStats = calculateStats(friendWorkouts);
    const userStats = calculateStats(userWorkouts);
    
    setComparisonData({ friend: friendStats, user: userStats });
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Comparaison de Stats
        </h2>
        
        {/* Sélection d'ami */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choisir un ami à comparer :
          </label>
          <div className="flex flex-wrap gap-2">
            {friends.map(friend => (
              <button
                key={friend.uid}
                onClick={() => fetchFriendStats(friend)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFriend?.uid === friend.uid
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {friend.displayName || friend.email}
              </button>
            ))}
          </div>
        </div>

        {/* Comparaison détaillée */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-400">Chargement des stats...</div>
          </div>
        )}

        {comparisonData && !loading && (
          <div className="space-y-6">
            {/* Stats générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Séances totales</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-900">{comparisonData.user.totalWorkouts}</span>
                  <span className="text-lg text-blue-700">vs {comparisonData.friend.totalWorkouts}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Durée moyenne</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-900">{comparisonData.user.avgDuration}min</span>
                  <span className="text-lg text-green-700">vs {comparisonData.friend.avgDuration}min</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Exercices/séance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-purple-900">{comparisonData.user.avgExercises}</span>
                  <span className="text-lg text-purple-700">vs {comparisonData.friend.avgExercises}</span>
                </div>
              </div>
            </div>

            {/* Graphique mensuel */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span>Évolution mensuelle</span>
              </h3>
              <div className="space-y-3">
                {comparisonData.user.monthlyStats.map(([month, userCount]) => {
                  const friendCount = comparisonData.friend.monthlyStats.find(([m]) => m === month)?.[1] || 0;
                  const maxCount = Math.max(userCount, friendCount);
                  return (
                    <div key={month} className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600 w-16">{month}</span>
                      <div className="flex-1 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className="bg-indigo-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${maxCount > 0 ? (userCount / maxCount) * 100 : 0}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                            {userCount}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">vs</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className="bg-green-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${maxCount > 0 ? (friendCount / maxCount) * 100 : 0}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                            {friendCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                  <span>Vous</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>{selectedFriend?.displayName || selectedFriend?.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedFriend && !loading && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Sélectionnez un ami pour comparer vos statistiques</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsComparison; 
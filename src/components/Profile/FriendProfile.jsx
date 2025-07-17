import React, { useEffect, useState } from 'react';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart3, Calendar, Target, TrendingUp, User } from 'lucide-react';

function FriendProfile({ friend, onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const q = query(collection(db, 'workouts'), where('userId', '==', friend.uid));
      const snap = await getDocs(q);
      const workouts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Calcule les stats
      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce((sum, w) => sum + (parseInt(w.duration) || 0), 0);
      const totalExercises = workouts.reduce((sum, w) => sum + w.exercises.length, 0);
      const totalSets = workouts.reduce((sum, w) => sum + w.exercises.reduce((exSum, ex) => exSum + ex.sets.length, 0), 0);
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
      setStats({
        totalWorkouts,
        totalDuration,
        totalExercises,
        totalSets,
        avgDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
        avgExercises: totalWorkouts > 0 ? Math.round(totalExercises / totalWorkouts) : 0,
        avgSets: totalWorkouts > 0 ? Math.round(totalSets / totalWorkouts) : 0,
        monthlyStats: Object.entries(monthlyStats).reverse()
      });
      setLoading(false);
    };
    if (friend) fetchStats();
  }, [friend]);

  if (!friend) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-4"
      >
        <User className="h-4 w-4" />
        <span>Retour</span>
      </button>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 flex items-center space-x-4">
        <div className="bg-indigo-100 rounded-full p-3">
          <User className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <div className="text-xl font-bold text-indigo-800">{friend.displayName || friend.email}</div>
          <div className="text-gray-500 text-sm">{friend.email}</div>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-400">Chargement des stats...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Séances totales</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalWorkouts}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Durée moyenne</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{stats.avgDuration} min</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Exercices/séance</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{stats.avgExercises}</div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <span>Évolution mensuelle</span>
            </h3>
            <div className="space-y-3">
              {stats.monthlyStats.map(([month, count]) => (
                <div key={month} className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 w-16">{month}</span>
                  <div className="flex-1 bg-indigo-100 rounded-full h-4 relative">
                    <div
                      className="bg-indigo-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${count > 0 ? count * 10 : 0}%`, minWidth: count > 0 ? '2rem' : 0 }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FriendProfile; 
import React, { useEffect, useState } from 'react';
import { db } from '../../utils/firebase/index.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart3, Calendar, Target, TrendingUp, User, Clock, Activity, Copy, Check } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';

function FriendProfile({ friend, onBack, showToastMsg, setActiveTab, setExercisesFromWorkout }) {
  const [stats, setStats] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useUserProfile();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', friend.uid)
      );
      const snap = await getDocs(q);
      const workouts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Récupère la dernière séance en triant côté client
      const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
      if (sortedWorkouts.length > 0) {
        setLastWorkout(sortedWorkouts[0]);
      }

      // Calcule les stats
      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce(
        (sum, w) => sum + (parseInt(w.duration) || 0),
        0
      );
      const totalExercises = workouts.reduce(
        (sum, w) => sum + w.exercises.length,
        0
      );
      const totalSets = workouts.reduce(
        (sum, w) =>
          sum + w.exercises.reduce((exSum, ex) => exSum + ex.sets.length, 0),
        0
      );
      // Stats par mois (6 derniers mois)
      const monthlyStats = {};
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = month.toISOString().slice(0, 7); // YYYY-MM
        monthlyStats[monthKey] = 0;
      }
      workouts.forEach((workout) => {
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
        avgDuration:
          totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
        avgExercises:
          totalWorkouts > 0 ? Math.round(totalExercises / totalWorkouts) : 0,
        avgSets: totalWorkouts > 0 ? Math.round(totalSets / totalWorkouts) : 0,
        monthlyStats: Object.entries(monthlyStats).reverse(),
      });
      setLoading(false);
    };
    if (friend) fetchStats();
  }, [friend]);

  const copyLastWorkout = async () => {
    if (!lastWorkout || !user) return;
    
    setCopying(true);
    try {
      // Préparer les exercices copiés pour l'onglet séance
      const copiedExercises = lastWorkout.exercises.map(exercise => {
        const formattedExercise = {
          id: Date.now() + Math.random(), // Nouvel ID pour éviter les conflits
          name: exercise.name || 'Exercice sans nom',
          type: exercise.type || 'custom',
          sets: exercise.sets.map(set => ({
            reps: parseInt(set.reps) || 0,
            weight: parseFloat(String(set.weight).replace(',', '.')) || 0,
            duration: parseInt(set.duration) || 0,
          })),
        };
        
        return formattedExercise;
      });

      // Méthode 1: Essayer avec setExercisesFromWorkout
      if (setExercisesFromWorkout) {
        setExercisesFromWorkout(copiedExercises);
      } else {
        // Méthode 2: Sauvegarder directement dans localStorage
        const currentWorkout = {
          exercises: copiedExercises,
          date: new Date().toISOString().split('T')[0],
          startTime: null,
          endTime: null,
        };
        localStorage.setItem('current_workout', JSON.stringify(currentWorkout));
      }

      // Naviguer vers l'onglet séance
      if (setActiveTab) {
        setActiveTab('workout');
      } else {
        // Méthode alternative: forcer le rechargement vers l'onglet séance
        // Sauvegarder un flag pour indiquer qu'il faut charger les exercices
        localStorage.setItem('load_copied_workout', 'true');
        localStorage.setItem('copied_workout_data', JSON.stringify(copiedExercises));
        
        // Rediriger vers l'onglet séance
        window.location.href = window.location.pathname + '#workout';
        // Forcer le rechargement pour que l'onglet séance charge les exercices
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }

      setCopied(true);
      if (showToastMsg) {
        showToastMsg(`Séance chargée dans l'onglet "Séance" ! Vous pouvez maintenant l'adapter à vos besoins.`, 'success');
      }
      setTimeout(() => setCopied(false), 3000); // Reset après 3 secondes
      
    } catch (error) {
      console.error('Erreur lors de la copie de la séance:', error);
      if (showToastMsg) {
        showToastMsg('Erreur lors de la copie de la séance', 'error');
      } else {
        alert('Erreur lors de la copie de la séance');
      }
    } finally {
      setCopying(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMuscleIcon = (muscle) => {
    switch (muscle) {
      case 'pectoraux':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'dos':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'jambes':
        return <Activity className="h-4 w-4 text-purple-600" />;
      case 'abdos':
        return <Activity className="h-4 w-4 text-orange-600" />;
      case 'biceps':
        return <Activity className="h-4 w-4 text-red-600" />;
      case 'triceps':
        return <Activity className="h-4 w-4 text-indigo-600" />;
      case 'épaules':
        return <Activity className="h-4 w-4 text-yellow-600" />;
      case 'cardio':
        return <Activity className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

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
          <div className="text-xl font-bold text-indigo-800">
            {friend.displayName || friend.email}
          </div>
          <div className="text-gray-500 text-sm">{friend.email}</div>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-400">Chargement des stats...</div>
      ) : (
        <div className="space-y-6">
          {/* Dernière séance */}
          {lastWorkout && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>Dernière séance</span>
                </h3>
                {user && (
                  <button
                    onClick={copyLastWorkout}
                    disabled={copying}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : copying
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                                         {copied ? (
                       <>
                         <Check className="h-4 w-4" />
                         <span>Chargé !</span>
                       </>
                     ) : copying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Copie...</span>
                      </>
                                         ) : (
                       <>
                         <Copy className="h-4 w-4" />
                         <span>Utiliser cette séance</span>
                       </>
                     )}
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {formatDate(lastWorkout.date)}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {lastWorkout.duration} min
                  </span>
                </div>
                <div className="space-y-2">
                  {lastWorkout.exercises?.map((exercise, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getMuscleIcon(exercise.type)}
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{exercise.name}</div>
                        <div className="text-sm text-gray-600">
                          {exercise.type === 'cardio' ? (
                            `${exercise.sets?.length || 0} séries`
                          ) : (
                            `${exercise.sets?.length || 0} séries, ${exercise.sets?.reduce((sum, set) => sum + (set.reps || 0), 0)} reps`
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        exercise.type === 'cardio' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {exercise.type === 'cardio' ? 'Cardio' : exercise.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  Séances totales
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {stats.totalWorkouts}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  Durée moyenne
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {stats.avgDuration} min
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">
                  Exercices/séance
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {stats.avgExercises}
              </div>
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
                      style={{
                        width: `${count > 0 ? count * 10 : 0}%`,
                        minWidth: count > 0 ? '2rem' : 0,
                      }}
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

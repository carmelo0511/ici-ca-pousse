import React from 'react';
import { BarChart3, Dumbbell, Target, TrendingUp, Clock, Zap, Calendar, Copy, Edit3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDate } from '../../utils/workoutUtils';
import { useExercises } from '../../hooks/useExercises';

function getWeeklyWorkoutData(workouts) {
  // Regroupe les séances par semaine (année + numéro de semaine)
  const weekMap = {};
  workouts.forEach(w => {
    const d = new Date(w.date);
    const year = d.getFullYear();
    // Numéro de semaine ISO
    const week = Math.ceil((((d - new Date(year,0,1)) / 86400000) + new Date(year,0,1).getDay()+1)/7);
    const key = `${year}-S${week}`;
    weekMap[key] = (weekMap[key] || 0) + 1;
  });
  return Object.entries(weekMap).map(([week, count]) => ({ week, count }));
}

function getMostWorkedMuscleGroup(workouts) {
  const muscleCount = {};
  workouts.forEach(w => {
    w.exercises.forEach(ex => {
      if (ex.type) {
        muscleCount[ex.type] = (muscleCount[ex.type] || 0) + 1;
      }
    });
  });
  const sorted = Object.entries(muscleCount).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : 'Aucun';
}

const groupWorkoutsByWeek = (workouts) => {
  const weeks = {};
  workouts.forEach((w) => {
    const date = new Date(w.date);
    // ISO week string: yyyy-Www
    const week = `${date.getFullYear()}-W${String(Math.ceil(((date - new Date(date.getFullYear(),0,1)) / 86400000 + new Date(date.getFullYear(),0,1).getDay()+1)/7)).padStart(2,'0')}`;
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(w);
  });
  return weeks;
};

const StatsView = ({ stats, workouts, onEditWorkout }) => {
  const { setExercisesFromWorkout } = useExercises();
  const weeks = groupWorkoutsByWeek(workouts);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          📊 Statistiques
        </h2>
        <p className="text-gray-600 mt-1">Analysez vos performances et progression</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Séances totales</p>
              <p className="text-4xl font-bold">{stats.totalWorkouts}</p>
            </div>
            <Target className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-green-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Séries totales</p>
              <p className="text-4xl font-bold">{stats.totalSets}</p>
            </div>
            <Dumbbell className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-purple-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Répétitions totales</p>
              <p className="text-4xl font-bold">{stats.totalReps}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-200" />
          </div>
        </div>



        <div className="bg-red-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Durée moyenne</p>
              <p className="text-4xl font-bold">{stats.avgDuration} min</p>
            </div>
            <Clock className="h-12 w-12 text-red-200" />
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Régularité</p>
              <p className="text-4xl font-bold">{workouts.length > 0 ? '💪' : '🔥'}</p>
            </div>
            <Zap className="h-12 w-12 text-indigo-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 fade-in-up">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>Évolution hebdomadaire</span>
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={getWeeklyWorkoutData(workouts)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 flex flex-col justify-center items-center fade-in-up">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Dumbbell className="h-6 w-6" />
            <span>Groupe musculaire le plus travaillé</span>
          </h3>
          <div className="text-4xl font-bold text-indigo-600 mb-2">{getMostWorkedMuscleGroup(workouts) === 'cardio' ? 'Cardio' : getMostWorkedMuscleGroup(workouts).charAt(0).toUpperCase() + getMostWorkedMuscleGroup(workouts).slice(1)}</div>
          <div className="text-gray-500">(sur toutes les séances)</div>
        </div>
      </div>

      {workouts.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>Dernières séances</span>
          </h3>
          <div className="space-y-4">
            {workouts.slice(-5).reverse().map((workout) => (
              <div key={workout.id} className="flex justify-between items-center py-4 px-6 bg-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="font-bold text-gray-800">{new Date(workout.date).toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm text-gray-600">{workout.exercises.length} exercices • {workout.totalSets} séries</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{workout.duration} min</p>
                  <p className="text-sm text-gray-600">{workout.totalWeight} kg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar className="h-5 w-5" /> Historique des séances par semaine</h2>
        {Object.keys(weeks).length === 0 ? (
          <div className="text-gray-400">Aucune séance enregistrée.</div>
        ) : (
          Object.entries(weeks).sort(([a], [b]) => b.localeCompare(a)).map(([week, weekWorkouts]) => (
            <div key={week} className="mb-8">
              <div className="font-semibold text-indigo-700 mb-2">Semaine {week}</div>
              <div className="space-y-3">
                {weekWorkouts.map((w) => (
                  <div key={w.id} className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-100">
                    <div>
                      <div className="font-bold text-lg text-gray-800">{formatDate(w.date)}</div>
                      <div className="text-sm text-gray-500">{w.exercises.length} exercice(s), {w.totalSets} série(s), {w.totalReps} rep, {w.totalWeight} kg</div>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => setExercisesFromWorkout(w.exercises)}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-purple-700 transition-all"
                      >
                        <Copy className="h-4 w-4" />
                        Dupliquer
                      </button>
                      <button
                        onClick={() => onEditWorkout(w)}
                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-yellow-500 hover:to-yellow-700 transition-all"
                      >
                        <Edit3 className="h-4 w-4" />
                        Modifier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StatsView;

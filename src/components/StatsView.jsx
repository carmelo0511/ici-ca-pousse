import React from 'react';
import { BarChart3, Dumbbell, Target, TrendingUp, Clock, Zap } from 'lucide-react';

const StatsView = ({ stats, workouts }) => (
  <div className="p-6 space-y-8">
    <div>
      <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        📊 Statistiques
      </h2>
      <p className="text-gray-600 mt-1">Analysez vos performances et progression</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Séances totales</p>
            <p className="text-4xl font-bold">{stats.totalWorkouts}</p>
          </div>
          <Target className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Séries totales</p>
            <p className="text-4xl font-bold">{stats.totalSets}</p>
          </div>
          <Dumbbell className="h-12 w-12 text-green-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Répétitions totales</p>
            <p className="text-4xl font-bold">{stats.totalReps}</p>
          </div>
          <TrendingUp className="h-12 w-12 text-purple-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">Poids total soulevé</p>
            <p className="text-4xl font-bold">{stats.totalWeight} kg</p>
          </div>
          <Dumbbell className="h-12 w-12 text-orange-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm font-medium">Durée moyenne</p>
            <p className="text-4xl font-bold">{stats.avgDuration} min</p>
          </div>
          <Clock className="h-12 w-12 text-red-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium">Régularité</p>
            <p className="text-4xl font-bold">{workouts.length > 0 ? '💪' : '🔥'}</p>
          </div>
          <Zap className="h-12 w-12 text-indigo-200" />
        </div>
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
            <div key={workout.id} className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
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
  </div>
);

export default StatsView;

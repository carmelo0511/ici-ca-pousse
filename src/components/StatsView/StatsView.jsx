import React, { useState } from 'react';
import { BarChart3, Dumbbell, Target, TrendingUp, Clock, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { parseLocalDate, analyzeWorkoutHabits, getPreferredWorkoutTime, getAverageDurationByTime } from '../../utils/workoutUtils';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function getWeeklyWorkoutData(workouts) {
  // Regroupe les séances par semaine (année + numéro de semaine)
  const weekMap = {};
  workouts.forEach(w => {
    const d = parseLocalDate(w.date);
    if (!d) return;
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


const StatsView = ({ stats, workouts, className = '' }) => {
  const { t, i18n } = useTranslation();
  // Trie les séances par date décroissante
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const weeks = groupWorkoutsByWeek(workouts);
  const workoutHabits = analyzeWorkoutHabits(workouts);
  const preferredTime = getPreferredWorkoutTime(workouts);
  const avgDurationByTime = getAverageDurationByTime(workouts);
  const dateLocale = i18n.language === 'fr' ? 'fr-FR' : undefined;

  return (
    <div className={`p-6 space-y-8 ${className}`}>
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {t('stats_title')}
        </h2>
        <p className="text-gray-600 mt-1">{t('stats_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('total_workouts')}</p>
              <p className="text-4xl font-bold">{stats.totalWorkouts}</p>
            </div>
            <Target className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-green-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('total_sets')}</p>
              <p className="text-4xl font-bold">{stats.totalSets}</p>
            </div>
            <Dumbbell className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-purple-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{t('total_reps')}</p>
              <p className="text-4xl font-bold">{stats.totalReps}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-200" />
          </div>
        </div>



        <div className="bg-red-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">{t('avg_duration')}</p>
              <p className="text-4xl font-bold">{stats.avgDuration} min</p>
            </div>
            <Clock className="h-12 w-12 text-red-200" />
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">{t('regularity')}</p>
              <p className="text-4xl font-bold">{workouts.length > 0 ? '💪' : '🔥'}</p>
            </div>
            <Zap className="h-12 w-12 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Habitudes d'entraînement */}
      {workoutHabits.totalWithTime > 0 && (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Clock className="h-6 w-6" />
            <span>Habitudes d'entraînement</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Moment préféré */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Moment préféré</h4>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{preferredTime.icon}</span>
                <div>
                  <p className="text-xl font-bold text-gray-800">{preferredTime.name}</p>
                  <p className="text-sm text-gray-600">{preferredTime.count} séances ({preferredTime.percentage}%)</p>
                </div>
              </div>
            </div>

            {/* Répartition par moment */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-800">Répartition</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>🌅</span>
                    <span>Matin (5h-12h)</span>
                  </span>
                  <span className="font-semibold">{workoutHabits.morning.count} ({workoutHabits.morning.percentage}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>☀️</span>
                    <span>Après-midi (12h-18h)</span>
                  </span>
                  <span className="font-semibold">{workoutHabits.afternoon.count} ({workoutHabits.afternoon.percentage}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>🌆</span>
                    <span>Soir (18h-22h)</span>
                  </span>
                  <span className="font-semibold">{workoutHabits.evening.count} ({workoutHabits.evening.percentage}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>🌙</span>
                    <span>Nuit (22h-5h)</span>
                  </span>
                  <span className="font-semibold">{workoutHabits.night.count} ({workoutHabits.night.percentage}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Durée moyenne par moment */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Durée moyenne par moment</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🌅</div>
                <div className="font-bold text-blue-800">{avgDurationByTime.morning} min</div>
                <div className="text-sm text-blue-600">Matin</div>
              </div>
              <div className="bg-yellow-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">☀️</div>
                <div className="font-bold text-yellow-800">{avgDurationByTime.afternoon} min</div>
                <div className="text-sm text-yellow-600">Après-midi</div>
              </div>
              <div className="bg-orange-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🌆</div>
                <div className="font-bold text-orange-800">{avgDurationByTime.evening} min</div>
                <div className="text-sm text-orange-600">Soir</div>
              </div>
              <div className="bg-purple-100 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">🌙</div>
                <div className="font-bold text-purple-800">{avgDurationByTime.night} min</div>
                <div className="text-sm text-purple-600">Nuit</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 fade-in-up">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>{t('weekly_progress')}</span>
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
            <span>{t('most_worked_muscle_group')}</span>
          </h3>
          <div className="text-4xl font-bold text-indigo-600 mb-2">{t(getMostWorkedMuscleGroup(workouts))}</div>
          <div className="text-gray-500">({t('all_sessions')})</div>
        </div>
      </div>

    </div>
  );
};

StatsView.propTypes = {
  stats: PropTypes.object.isRequired,
  workouts: PropTypes.array.isRequired,
  className: PropTypes.string,
};

export default StatsView;

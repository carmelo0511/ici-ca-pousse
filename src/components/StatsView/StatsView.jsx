import React from 'react';
import { BarChart3, Dumbbell, Target, TrendingUp, Clock, Zap, Calendar, Edit3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDate } from '../../utils/workoutUtils';
import { useTranslation } from 'react-i18next';
import { getBadges } from '../../utils/workoutUtils';
import PropTypes from 'prop-types';

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

const StatsView = ({ stats, workouts, onEditWorkout, className = '' }) => {
  const { t } = useTranslation();
  const weeks = groupWorkoutsByWeek(workouts);
  const badges = getBadges(stats);

  return (
    <div className={`p-6 space-y-8 ${className}`}>
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {t('stats_title')}
        </h2>
        <p className="text-gray-600 mt-1">{t('stats_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('total_workouts')}</p>
              <p className="text-4xl font-bold">{stats.totalWorkouts}</p>
            </div>
            <Target className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-green-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('total_sets')}</p>
              <p className="text-4xl font-bold">{stats.totalSets}</p>
            </div>
            <Dumbbell className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-purple-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{t('total_reps')}</p>
              <p className="text-4xl font-bold">{stats.totalReps}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-200" />
          </div>
        </div>



        <div className="bg-red-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">{t('avg_duration')}</p>
              <p className="text-4xl font-bold">{stats.avgDuration} min</p>
            </div>
            <Clock className="h-12 w-12 text-red-200" />
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">{t('regularity')}</p>
              <p className="text-4xl font-bold">{workouts.length > 0 ? '💪' : '🔥'}</p>
            </div>
            <Zap className="h-12 w-12 text-indigo-200" />
          </div>
        </div>
      </div>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-6">
          {badges.map(badge => (
            <div key={badge.key} className="badge bg-gradient-to-r from-yellow-100 to-yellow-300 border border-yellow-300 shadow text-yellow-800 flex items-center gap-2">
              <span className="text-xl">{badge.icon}</span>
              <span>{t(badge.key, { defaultValue: badge.label })}</span>
            </div>
          ))}
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

      {workouts.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>{t('last_sessions')}</span>
          </h3>
          <div className="space-y-4">
            {workouts.slice(-5).reverse().map((workout) => (
              <div key={workout.id} className="flex justify-between items-center py-4 px-6 bg-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="font-bold text-gray-800">{new Date(workout.date).toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm text-gray-600">{workout.exercises.length} {t('exercises')} • {workout.totalSets} {t('sets')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{workout.duration} min</p>
                  <p className="text-sm text-gray-600">{workout.totalWeight} {t('kg')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar className="h-5 w-5" /> {t('history_by_week')}</h2>
        {Object.keys(weeks).length === 0 ? (
          <div className="text-gray-400">{t('no_sessions_recorded')}</div>
        ) : (
          Object.entries(weeks).sort(([a], [b]) => b.localeCompare(a)).map(([week, weekWorkouts]) => (
            <div key={week} className="mb-8">
              <div className="font-semibold text-indigo-700 mb-2">{t('week')}</div>
              <div className="space-y-3">
                {weekWorkouts.map((w) => (
                  <div key={w.id} className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-100">
                    <div>
                      <div className="font-bold text-lg text-gray-800">{formatDate(w.date)}</div>
                      <div className="text-sm text-gray-500">{w.exercises.length} {t('exercises')}, {w.totalSets} {t('sets')}, {w.totalReps} {t('reps')}, {w.totalWeight} {t('kg')}</div>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => onEditWorkout(w)}
                        className={`flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-yellow-500 hover:to-yellow-700 transition-all text-sm sm:text-base max-w-full whitespace-nowrap`}
                      >
                        <Edit3 className="h-4 w-4" />
                        {t('edit')}
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

StatsView.propTypes = {
  stats: PropTypes.object.isRequired,
  workouts: PropTypes.array.isRequired,
  onEditWorkout: PropTypes.func,
  className: PropTypes.string,
};

export default StatsView;

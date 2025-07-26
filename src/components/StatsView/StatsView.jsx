import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, BarChart, Bar } from 'recharts';
import { Dumbbell, Target, TrendingUp, Clock, Zap, BarChart3, Edit3, Calendar, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { analyzeWorkoutHabits, getPreferredWorkoutTime, getAverageDurationByTime, groupWorkoutsByWeek, getWeeklyWorkoutData, parseLocalDate } from '../../utils/workoutUtils';
import { getBadges } from '../../utils/badges';
import PropTypes from 'prop-types';

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

const StatsView = ({ stats, workouts, user, onEditWorkout, className = '' }) => {
  const { t, i18n } = useTranslation();
  const [openWeeks, setOpenWeeks] = useState([]);
  
  // Trie les séances par date décroissante
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const weeks = groupWorkoutsByWeek(workouts);
  const badges = getBadges(stats);
  const workoutHabits = analyzeWorkoutHabits(workouts);
  const preferredTime = getPreferredWorkoutTime(workouts);
  const avgDurationByTime = getAverageDurationByTime(workouts);
  const dateLocale = i18n.language === 'fr' ? 'fr-FR' : undefined;

  // Préparer les données pour la courbe de poids
  const weightData = (user?.weightHistory || []).map(w => ({ week: w.weekKey, weight: Number(w.value) })).filter(w => w.weight > 0);

  const toggleWeek = (weekKey) => {
    setOpenWeeks(prev => 
      prev.includes(weekKey) 
        ? prev.filter(w => w !== weekKey)
        : [...prev, weekKey]
    );
  };

  return (
    <div className={`p-6 space-y-8 ${className}`}>
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {t('stats_title')}
        </h2>
        <p className="text-gray-600 mt-1">{t('stats_subtitle')}</p>
      </div>

      {/* Courbe d'évolution du poids */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 fade-in-up mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <TrendingUp className="h-6 w-6" />
          <span>Évolution du poids</span>
        </h3>
        {weightData.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Aucune donnée de poids enregistrée.<br/>Ajoutez votre poids dans le profil pour voir la courbe !</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weightData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis domain={['auto', 'auto']} tickCount={6} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }}>
                <LabelList position="top" offset={12} fontSize={12} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Statistiques principales */}
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

        <div className="bg-yellow-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Badges</p>
              <p className="text-4xl font-bold">{badges.length}</p>
            </div>
            <Target className="h-12 w-12 text-yellow-200" />
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
              {avgDurationByTime.map((timeSlot, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{timeSlot.icon}</span>
                    <span className="font-medium">{timeSlot.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{timeSlot.count} séances</p>
                    <p className="text-sm text-gray-600">{timeSlot.avgDuration} min en moyenne</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progression hebdomadaire et groupe musculaire préféré */}
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

      {/* Dernières séances */}
      {sortedWorkouts.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>{t('last_sessions')}</span>
          </h3>
          <div className="space-y-4">
            {sortedWorkouts.slice(0, 5).map((workout) => (
              <div key={workout.id} className="flex justify-between items-center py-4 px-6 bg-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div>
                  <p className="font-bold text-gray-800">{parseLocalDate(workout.date).toLocaleDateString(dateLocale)}</p>
                  <p className="text-sm text-gray-600">
                    {workout.exercises.length} {t('exercises')} • {workout.totalSets} {t('sets')}
                    {workout.startTime && (
                      <span className="ml-2 text-blue-600">
                        • {workout.startTime}
                        {workout.endTime && ` → ${workout.endTime}`}
                      </span>
                    )}
                  </p>
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

      {/* Séances par semaine */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <Calendar className="h-6 w-6" />
          <span>Séances par semaine</span>
        </h3>
        <div className="space-y-4">
          {Object.entries(weeks).map(([weekKey, weekWorkouts]) => {
            const weekDate = new Date(weekKey);
            const weekLabel = weekDate.toLocaleDateString(dateLocale, { 
              day: 'numeric', 
              month: 'short',
              year: 'numeric'
            });
            const isOpen = openWeeks.includes(weekKey);
            
            return (
              <div key={weekKey} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleWeek(weekKey)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-800">{weekLabel}</span>
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium">
                      {weekWorkouts.length} séance{weekWorkouts.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </div>
                </button>
                
                {isOpen && (
                  <div className="p-4 bg-white">
                    {weekWorkouts.map((w) => (
                      <div key={w.id} className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-100">
                        <div>
                          <div className="font-bold text-lg text-gray-800">{parseLocalDate(w.date).toLocaleDateString(dateLocale)}</div>
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

StatsView.propTypes = {
  stats: PropTypes.object.isRequired,
  workouts: PropTypes.array.isRequired,
  user: PropTypes.object,
  onEditWorkout: PropTypes.func,
  className: PropTypes.string,
};

export default StatsView;

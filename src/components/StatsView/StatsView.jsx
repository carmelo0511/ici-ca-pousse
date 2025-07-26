import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { Dumbbell, Target, TrendingUp, Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { analyzeWorkoutHabits, getPreferredWorkoutTime, getAverageDurationByTime } from '../../utils/workoutUtils';
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

const StatsView = ({ stats, workouts, user, className = '' }) => {
  const { t } = useTranslation();
  const workoutHabits = analyzeWorkoutHabits(workouts);
  const preferredTime = getPreferredWorkoutTime(workouts);
  const avgDurationByTime = getAverageDurationByTime(workouts);

  // Préparer les données pour la courbe de poids
  const weightData = (user?.weightHistory || []).map(w => ({ week: w.weekKey, weight: Number(w.value) })).filter(w => w.weight > 0);

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

        <div className="bg-orange-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Groupe préféré</p>
              <p className="text-2xl font-bold">{getMostWorkedMuscleGroup(workouts)}</p>
            </div>
            <Dumbbell className="h-12 w-12 text-orange-200" />
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

      {/* Section Recommandations */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <Target className="h-6 w-6" />
          <span>Recommandations personnalisées</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recommandation basée sur la fréquence */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>📊</span>
              <span>Fréquence d'entraînement</span>
            </h4>
            {workouts.length === 0 ? (
              <p className="text-gray-600">Commencez par faire votre première séance !</p>
            ) : workouts.length < 5 ? (
              <p className="text-gray-600">Excellent début ! Continuez à vous entraîner régulièrement.</p>
            ) : workouts.length < 15 ? (
              <p className="text-gray-600">Bonne régularité ! Essayez d'ajouter une séance par semaine.</p>
            ) : (
              <p className="text-gray-600">Impressionnant ! Vous êtes très régulier dans vos entraînements.</p>
            )}
          </div>

          {/* Recommandation basée sur le groupe musculaire */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>💪</span>
              <span>Équilibre musculaire</span>
            </h4>
            {(() => {
              const muscleCount = {};
              workouts.forEach(w => {
                w.exercises.forEach(ex => {
                  if (ex.type) {
                    muscleCount[ex.type] = (muscleCount[ex.type] || 0) + 1;
                  }
                });
              });
              const muscleGroups = Object.keys(muscleCount);
              
              if (muscleGroups.length < 3) {
                return <p className="text-gray-600">Diversifiez vos entraînements en travaillant différents groupes musculaires.</p>;
              } else if (muscleGroups.length < 5) {
                return <p className="text-gray-600">Bon équilibre ! Continuez à varier vos exercices.</p>;
              } else {
                return <p className="text-gray-600">Excellent équilibre musculaire ! Vous travaillez tous les groupes.</p>;
              }
            })()}
          </div>

          {/* Recommandation basée sur la durée */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>⏱️</span>
              <span>Durée des séances</span>
            </h4>
            {stats.avgDuration < 30 ? (
              <p className="text-gray-600">Vos séances sont courtes. Essayez d'augmenter progressivement la durée.</p>
            ) : stats.avgDuration < 60 ? (
              <p className="text-gray-600">Durée équilibrée ! Parfait pour maintenir votre forme.</p>
            ) : (
              <p className="text-gray-600">Séances intenses ! Assurez-vous de bien récupérer entre les entraînements.</p>
            )}
          </div>

          {/* Recommandation basée sur le moment */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>🌅</span>
              <span>Moment d'entraînement</span>
            </h4>
            {preferredTime.name === 'Matin' ? (
              <p className="text-gray-600">Entraînement matinal ! Excellent pour booster votre métabolisme.</p>
            ) : preferredTime.name === 'Après-midi' ? (
              <p className="text-gray-600">Séances d'après-midi ! Bon moment pour des performances optimales.</p>
            ) : preferredTime.name === 'Soir' ? (
              <p className="text-gray-600">Entraînement du soir ! Pensez à bien vous étirer avant de dormir.</p>
            ) : (
              <p className="text-gray-600">Séances nocturnes ! Assurez-vous de bien vous reposer après.</p>
            )}
          </div>
        </div>

        {/* Recommandation générale */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <span>🎯</span>
            <span>Objectif du mois</span>
          </h4>
          {(() => {
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();
            const monthWorkouts = workouts.filter(w => {
              const workoutDate = new Date(w.date);
              return workoutDate.getMonth() === thisMonth && workoutDate.getFullYear() === thisYear;
            });
            
            if (monthWorkouts.length < 8) {
              return <p className="text-gray-600">Objectif : Faites au moins 8 séances ce mois-ci pour maintenir votre progression !</p>;
            } else if (monthWorkouts.length < 12) {
              return <p className="text-gray-600">Objectif : Essayez d'atteindre 12 séances ce mois-ci pour optimiser vos résultats !</p>;
            } else {
              return <p className="text-gray-600">Félicitations ! Vous avez dépassé l'objectif du mois. Continuez ainsi !</p>;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

StatsView.propTypes = {
  stats: PropTypes.object.isRequired,
  workouts: PropTypes.array.isRequired,
  user: PropTypes.object,
  className: PropTypes.string,
};

export default StatsView;

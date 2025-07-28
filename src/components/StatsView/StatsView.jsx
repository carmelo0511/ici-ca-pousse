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
  const weightData = (user?.weightHistory || [])
    .map(w => ({ 
      week: w.weekKey, 
      weekFormatted: new Date(w.weekKey).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      weight: Number(w.value) 
    }))
    .filter(w => w.weight > 0)
    .sort((a, b) => new Date(a.week) - new Date(b.week));

  return (
    <div className={`p-6 space-y-8 ${className}`}>
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Statistiques
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
              <XAxis dataKey="weekFormatted" fontSize={12} />
              <YAxis domain={['auto', 'auto']} tickCount={6} />
              <Tooltip 
                formatter={(value, name) => [value + ' kg', 'Poids']}
                labelFormatter={(label) => `Semaine du ${label}`}
              />
              <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }}>
                <LabelList position="top" offset={12} fontSize={12} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('total_workouts')}</p>
              <p className="text-4xl font-bold">{stats.totalWorkouts}</p>
            </div>
            <Target className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('total_sets')}</p>
              <p className="text-4xl font-bold">{stats.totalSets}</p>
            </div>
            <Dumbbell className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('total_reps')}</p>
              <p className="text-4xl font-bold">{stats.totalReps}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('avg_duration')}</p>
              <p className="text-4xl font-bold">{stats.avgDuration} min</p>
            </div>
            <Clock className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('regularity')}</p>
              <p className="text-4xl font-bold">{workouts.length > 0 ? '💪' : '🔥'}</p>
            </div>
            <Zap className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl w-full max-w-full overflow-x-auto border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Groupe préféré</p>
              <p className="text-2xl font-bold">{getMostWorkedMuscleGroup(workouts)}</p>
            </div>
            <Dumbbell className="h-12 w-12 text-blue-200" />
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
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-white/20">
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
              <div className="bg-blue-100 rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-1">🌅</div>
                <div className="font-bold text-blue-800">{avgDurationByTime.morning} min</div>
                <div className="text-sm text-blue-600">Matin</div>
              </div>
              <div className="bg-blue-100 rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-1">☀️</div>
                <div className="font-bold text-blue-800">{avgDurationByTime.afternoon} min</div>
                <div className="text-sm text-blue-600">Après-midi</div>
              </div>
              <div className="bg-blue-100 rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-1">🌆</div>
                <div className="font-bold text-blue-800">{avgDurationByTime.evening} min</div>
                <div className="text-sm text-blue-600">Soir</div>
              </div>
              <div className="bg-blue-100 rounded-xl p-4 text-center border border-white/20">
                <div className="text-2xl mb-1">🌙</div>
                <div className="font-bold text-blue-800">{avgDurationByTime.night} min</div>
                <div className="text-sm text-blue-600">Nuit</div>
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
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>📊</span>
              <span>Fréquence d'entraînement</span>
            </h4>
            {(() => {
              const recentWorkouts = workouts.filter(w => {
                const workoutDate = new Date(w.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return workoutDate >= thirtyDaysAgo;
              });
              
              if (workouts.length === 0) {
                return <p className="text-gray-600">Commencez par faire votre première séance !</p>;
              } else if (recentWorkouts.length < 4) {
                return <p className="text-gray-600">Augmentez votre fréquence : visez 3-4 séances par semaine pour de meilleurs résultats.</p>;
              } else if (recentWorkouts.length < 8) {
                return <p className="text-gray-600">Bonne régularité ! Maintenez ce rythme pour progresser constamment.</p>;
              } else if (recentWorkouts.length < 12) {
                return <p className="text-gray-600">Excellent rythme ! Vous êtes sur la bonne voie pour atteindre vos objectifs.</p>;
              } else {
                return <p className="text-gray-600">Impressionnant ! Votre régularité est exemplaire. Continuez ainsi !</p>;
              }
            })()}
          </div>

          {/* Recommandation basée sur le groupe musculaire */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>💪</span>
              <span>Équilibre musculaire</span>
            </h4>
            {(() => {
              const muscleCount = {};
              const recentWorkouts = workouts.filter(w => {
                const workoutDate = new Date(w.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return workoutDate >= thirtyDaysAgo;
              });
              
              recentWorkouts.forEach(w => {
                w.exercises.forEach(ex => {
                  if (ex.type) {
                    muscleCount[ex.type] = (muscleCount[ex.type] || 0) + 1;
                  }
                });
              });
              
              const muscleGroups = Object.keys(muscleCount);
              
              if (muscleGroups.length < 2) {
                return <p className="text-gray-600">Diversifiez vos entraînements ! Ajoutez des exercices pour d'autres groupes musculaires.</p>;
              } else if (muscleGroups.length < 4) {
                return <p className="text-gray-600">Bon équilibre ! Essayez d'ajouter 1-2 groupes musculaires supplémentaires.</p>;
              } else if (muscleGroups.length < 6) {
                return <p className="text-gray-600">Excellent équilibre ! Vous travaillez une bonne variété de muscles.</p>;
              } else {
                return <p className="text-gray-600">Parfait ! Votre programme est très équilibré et complet.</p>;
              }
            })()}
          </div>

          {/* Recommandation basée sur la durée */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>⏱️</span>
              <span>Durée des séances</span>
            </h4>
            {(() => {
              const recentWorkouts = workouts.filter(w => {
                const workoutDate = new Date(w.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return workoutDate >= thirtyDaysAgo;
              });
              
              const recentAvgDuration = recentWorkouts.length > 0 
                ? recentWorkouts.reduce((total, w) => total + (w.duration || 0), 0) / recentWorkouts.length 
                : stats.avgDuration;
              
              if (recentAvgDuration < 25) {
                return <p className="text-gray-600">Séances courtes : augmentez progressivement à 30-45 min pour de meilleurs résultats.</p>;
              } else if (recentAvgDuration < 45) {
                return <p className="text-gray-600">Durée équilibrée ! Parfait pour maintenir votre forme et progresser.</p>;
              } else if (recentAvgDuration < 75) {
                return <p className="text-gray-600">Séances intenses ! Excellente intensité pour maximiser vos gains.</p>;
              } else {
                return <p className="text-gray-600">Séances très longues ! Assurez-vous de bien récupérer et de varier l'intensité.</p>;
              }
            })()}
          </div>

          {/* Recommandation basée sur le moment */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <span>🌅</span>
              <span>Moment d'entraînement</span>
            </h4>
            {(() => {
              const recentWorkouts = workouts.filter(w => {
                const workoutDate = new Date(w.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return workoutDate >= thirtyDaysAgo;
              });
              
              const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
              recentWorkouts.forEach(w => {
                if (w.startTime) {
                  const hour = parseInt(w.startTime.split(':')[0]);
                  if (hour >= 5 && hour < 12) timeDistribution.morning++;
                  else if (hour >= 12 && hour < 18) timeDistribution.afternoon++;
                  else if (hour >= 18 && hour < 22) timeDistribution.evening++;
                  else timeDistribution.night++;
                }
              });
              
              const totalWithTime = Object.values(timeDistribution).reduce((a, b) => a + b, 0);
              const preferredTimeRecent = totalWithTime > 0 ? 
                Object.entries(timeDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0] : 
                preferredTime.name.toLowerCase();
              
              if (preferredTimeRecent === 'morning' || preferredTimeRecent === 'matin') {
                return <p className="text-gray-600">Entraînement matinal ! Excellent pour booster votre métabolisme et commencer la journée en forme.</p>;
              } else if (preferredTimeRecent === 'afternoon' || preferredTimeRecent === 'après-midi') {
                return <p className="text-gray-600">Séances d'après-midi ! Moment optimal pour des performances maximales et une récupération efficace.</p>;
              } else if (preferredTimeRecent === 'evening' || preferredTimeRecent === 'soir') {
                return <p className="text-gray-600">Entraînement du soir ! Pensez à bien vous étirer et à manger léger après la séance.</p>;
              } else {
                return <p className="text-gray-600">Séances nocturnes ! Assurez-vous de bien vous reposer et d'éviter les stimulants après l'entraînement.</p>;
              }
            })()}
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
            
            const daysElapsed = new Date().getDate();
            const progressPercentage = (monthWorkouts.length / Math.max(1, Math.floor(daysElapsed / 7) * 3)) * 100;
            
            if (monthWorkouts.length < 4) {
              return <p className="text-gray-600">Objectif : Faites au moins 8 séances ce mois-ci pour maintenir votre progression ! ({Math.round(progressPercentage)}% de l'objectif)</p>;
            } else if (monthWorkouts.length < 8) {
              return <p className="text-gray-600">Objectif : Essayez d'atteindre 12 séances ce mois-ci pour optimiser vos résultats ! ({Math.round(progressPercentage)}% de l'objectif)</p>;
            } else if (monthWorkouts.length < 12) {
              return <p className="text-gray-600">Excellent ! Visez 16 séances ce mois-ci pour maximiser vos gains ! ({Math.round(progressPercentage)}% de l'objectif)</p>;
            } else {
              return <p className="text-gray-600">Félicitations ! Vous avez dépassé l'objectif du mois. Continuez ainsi ! ({Math.round(progressPercentage)}% de l'objectif)</p>;
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

import React from 'react';
import {
  Clock,
  Zap,
  Dumbbell,
  Heart,
  Trash2,
  X,
  BarChart3,
  Calendar,
  Edit3,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { parseLocalDate } from '../../utils/workout/workoutUtils';

const groupWorkoutsByWeek = (workouts) => {
  const weeks = {};
  workouts.forEach((w) => {
    const date = parseLocalDate(w.date);
    if (!date) return;
    const week = `${date.getFullYear()}-W${String(
      Math.ceil(
        ((date - new Date(date.getFullYear(), 0, 1)) / 86400000 +
          new Date(date.getFullYear(), 0, 1).getDay() +
          1) /
          7
      )
    ).padStart(2, '0')}`;
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(w);
  });
  return weeks;
};

function getWeekBounds(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

const CalendarView = ({
  workouts,
  getWorkoutForDate,
  openWorkoutDetail,
  showWorkoutDetail,
  selectedWorkout,
  deleteWorkout,
  setShowWorkoutDetail,
  onEditWorkout,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  // Ajout navigation mois
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const [openWeeks, setOpenWeeks] = useState([]);
  const sortedWorkouts = [...workouts].sort(
    (a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)
  );
  const weeks = groupWorkoutsByWeek(workouts);
  const dateLocale = i18n.language === 'fr' ? 'fr-FR' : undefined;

  return (
    <div className={`p-6 space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            {t('calendar')}
          </h2>
          <p className="text-gray-600 mt-1">{t('calendar_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-2 sm:p-4 border border-gray-100 fade-in-up calendar-scrollable w-full max-w-full overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => {
              if (month === 0) {
                setMonth(11);
                setYear(year - 1);
              } else {
                setMonth(month - 1);
              }
            }}
            aria-label="Mois précédent"
          >
            <span className="text-xl">←</span>
          </button>
          <div className="text-center text-lg sm:text-2xl font-bold text-gray-800">
            {t(`month_${month + 1}`)} {year}
          </div>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => {
              if (month === 11) {
                setMonth(0);
                setYear(year + 1);
              } else {
                setMonth(month + 1);
              }
            }}
            aria-label="Mois suivant"
          >
            <span className="text-xl">→</span>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, index) => {
            if (day === null)
              return (
                <div
                  key={`empty-${year}-${month + 1}-${index}`}
                  className="h-10 sm:h-12"
                ></div>
              );
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasWorkout = getWorkoutForDate(dateString);
            // Correction : comparaison locale
            const todayLocal = parseLocalDate(
              `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
            );
            const cellDate = parseLocalDate(dateString);
            const isToday =
              cellDate &&
              todayLocal &&
              cellDate.getTime() === todayLocal.getTime();
            return (
              <div
                key={dateString}
                className={`
                  h-10 sm:h-12 flex items-center justify-center text-xs sm:text-sm rounded-xl cursor-pointer font-medium transition-all duration-200 relative select-none
                  ${isToday ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'hover:bg-gray-100'}
                  ${hasWorkout ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-md' : ''}
                `}
                style={{ minWidth: '32px', maxWidth: '100%', margin: '0 auto' }}
                onClick={() => hasWorkout && openWorkoutDetail(hasWorkout)}
              >
                {day}
                {hasWorkout && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200 rounded-2xl p-6 fade-in-up">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm font-bold text-green-800">
              {t('sessions_done')}
            </span>
          </div>
          <p className="text-3xl font-bold text-green-900">{workouts.length}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6 fade-in-up">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-800">
              {t('this_week')}
            </span>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {
              workouts.filter((w) => {
                const workoutDate = parseLocalDate(w.date);
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                return workoutDate >= weekStart && workoutDate <= weekEnd;
              }).length
            }
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 rounded-2xl p-6 fade-in-up">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-800">
              Motivation
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {workouts.length > 10
              ? '🔥 En feu!'
              : workouts.length > 5
                ? '💪 Fort!'
                : '🌱 Début'}
          </p>
        </div>
      </div>

      {sortedWorkouts.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <span>{t('last_sessions')}</span>
          </h3>
          <div className="space-y-4">
            {sortedWorkouts.slice(0, 5).map((workout) => (
              <div
                key={workout.id}
                className="flex justify-between items-center py-4 px-6 bg-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <p className="font-bold text-gray-800">
                    {parseLocalDate(workout.date).toLocaleDateString(
                      dateLocale
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {workout.exercises.length} {t('exercises')} •{' '}
                    {workout.totalSets} {t('sets')}
                    {workout.startTime && (
                      <span className="ml-2 text-blue-600">
                        • {workout.startTime}
                        {workout.endTime && ` → ${workout.endTime}`}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    {workout.duration} min
                  </p>
                  <p className="text-sm text-gray-600">
                    {workout.totalWeight} {t('kg')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" /> {t('history_by_week')}
        </h2>
        {Object.keys(weeks).length === 0 ? (
          <div className="text-gray-400">{t('no_sessions_recorded')}</div>
        ) : (
          Object.entries(weeks)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([week, weekWorkouts]) => {
              const firstWorkout = weekWorkouts[0];
              const d = parseLocalDate(firstWorkout.date);
              const { monday, sunday } = getWeekBounds(d);
              const isOpen = openWeeks.includes(week);
              return (
                <div key={week} className="mb-4">
                  <button
                    className={`w-full flex justify-between items-center px-6 py-4 rounded-2xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 font-semibold text-indigo-700 shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                    onClick={() =>
                      setOpenWeeks((prev) =>
                        prev.includes(week)
                          ? prev.filter((w) => w !== week)
                          : [...prev, week]
                      )
                    }
                    aria-expanded={isOpen}
                  >
                    <span>
                      Semaine du{' '}
                      {monday.toLocaleDateString(dateLocale, {
                        day: '2-digit',
                        month: '2-digit',
                      })}{' '}
                      au{' '}
                      {sunday.toLocaleDateString(dateLocale, {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                    <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div className="space-y-3 mt-2">
                      {weekWorkouts
                        .sort(
                          (a, b) =>
                            parseLocalDate(b.date) - parseLocalDate(a.date)
                        )
                        .map((w) => (
                          <div
                            key={w.id}
                            className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-100"
                          >
                            <div>
                              <div className="font-bold text-lg text-gray-800">
                                {parseLocalDate(w.date).toLocaleDateString(
                                  dateLocale
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {w.exercises.length} {t('exercises')},{' '}
                                {w.totalSets} {t('sets')}, {w.totalReps}{' '}
                                {t('reps')}, {w.totalWeight} {t('kg')}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 sm:mt-0">
                              <button
                                onClick={() => onEditWorkout(w)}
                                className={`flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-yellow-500 hover:to-yellow-700 transition-all text-sm sm:text-base max-w-full whitespace-nowrap`}
                              >
                                <Edit3 className="h-4 w-4" />
                                {t('edit')}
                              </button>
                              <button
                                onClick={() => deleteWorkout(w.id)}
                                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-red-600 hover:to-red-700 transition-all text-sm sm:text-base max-w-full whitespace-nowrap"
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {showWorkoutDetail && selectedWorkout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-screen flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header sticky */}
            <div className="sticky top-0 z-10 bg-white rounded-t-3xl px-4 sm:px-6 pt-4 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🏋️ Séance du{' '}
                {selectedWorkout.date
                  ? parseLocalDate(selectedWorkout.date).toLocaleDateString(
                      'fr-FR'
                    )
                  : ''}
              </h3>
              <div className="flex flex-wrap gap-2 ml-auto">
                <button
                  onClick={() => deleteWorkout(selectedWorkout.id)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </button>
                <button
                  onClick={() => setShowWorkoutDetail(false)}
                  className="text-gray-500 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-all duration-200 border-2 border-gray-300 hover:border-red-500"
                  aria-label="Fermer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            {/* Contenu scrollable */}
            <div className="overflow-y-auto px-2 sm:px-6 py-4 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl text-center border border-blue-200">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {selectedWorkout.duration}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-blue-800">
                    {t('minutes')}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl text-center border border-green-200">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {selectedWorkout.totalSets}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-green-800">
                    {t('series')}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl text-center border border-purple-200">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                    {selectedWorkout.totalReps}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-purple-800">
                    {t('repetitions')}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4 rounded-2xl text-center border border-orange-200">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {selectedWorkout.totalWeight}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-orange-800">
                    {t('kg_lifted')}
                  </div>
                </div>
              </div>

              {/* Affichage des ressentis */}
              {selectedWorkout.feeling && (
                <div className="mb-8">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
                    <span className="text-2xl">💭</span>
                    <span>Ressentis après la séance</span>
                  </h4>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-indigo-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-indigo-100 rounded-full">
                        <span className="text-2xl">
                          {selectedWorkout.feeling === 'easy' ||
                          selectedWorkout.feeling === 'strong' ||
                          selectedWorkout.feeling === 'energized' ||
                          selectedWorkout.feeling === 'motivated' ||
                          selectedWorkout.feeling === 'great' ||
                          selectedWorkout.feeling === 'good'
                            ? '😊'
                            : selectedWorkout.feeling === 'medium' ||
                                selectedWorkout.feeling === 'tired' ||
                                selectedWorkout.feeling === 'ok'
                              ? '😐'
                              : selectedWorkout.feeling === 'hard' ||
                                  selectedWorkout.feeling === 'weak' ||
                                  selectedWorkout.feeling === 'demotivated' ||
                                  selectedWorkout.feeling === 'bad' ||
                                  selectedWorkout.feeling === 'terrible'
                                ? '😔'
                                : '💭'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-800 capitalize">
                          {selectedWorkout.feeling === 'easy'
                            ? t('feeling_easy')
                            : selectedWorkout.feeling === 'medium'
                              ? t('feeling_medium')
                              : selectedWorkout.feeling === 'hard'
                                ? t('feeling_hard')
                                : selectedWorkout.feeling === 'weak'
                                  ? t('feeling_weak')
                                  : selectedWorkout.feeling === 'strong'
                                    ? t('feeling_strong')
                                    : selectedWorkout.feeling === 'tired'
                                      ? t('feeling_tired')
                                      : selectedWorkout.feeling === 'energized'
                                        ? t('feeling_energized')
                                        : selectedWorkout.feeling ===
                                            'motivated'
                                          ? t('feeling_motivated')
                                          : selectedWorkout.feeling ===
                                              'demotivated'
                                            ? t('feeling_demotivated')
                                            : selectedWorkout.feeling ===
                                                'great'
                                              ? t('feeling_great')
                                              : selectedWorkout.feeling ===
                                                  'good'
                                                ? t('feeling_good')
                                                : selectedWorkout.feeling ===
                                                    'ok'
                                                  ? t('feeling_ok')
                                                  : selectedWorkout.feeling ===
                                                      'bad'
                                                    ? t('feeling_bad')
                                                    : selectedWorkout.feeling ===
                                                        'terrible'
                                                      ? t('feeling_terrible')
                                                      : selectedWorkout.feeling}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedWorkout.feeling === 'easy'
                            ? 'Séance facile et agréable'
                            : selectedWorkout.feeling === 'medium'
                              ? 'Séance de difficulté moyenne'
                              : selectedWorkout.feeling === 'hard'
                                ? 'Séance difficile et intense'
                                : selectedWorkout.feeling === 'weak'
                                  ? "Vous vous sentiez faible aujourd'hui"
                                  : selectedWorkout.feeling === 'strong'
                                    ? 'Vous vous sentiez fort et puissant'
                                    : selectedWorkout.feeling === 'tired'
                                      ? 'Vous étiez fatigué pendant la séance'
                                      : selectedWorkout.feeling === 'energized'
                                        ? "Vous étiez plein d'énergie"
                                        : selectedWorkout.feeling ===
                                            'motivated'
                                          ? 'Vous étiez très motivé'
                                          : selectedWorkout.feeling ===
                                              'demotivated'
                                            ? 'Vous manquiez de motivation'
                                            : selectedWorkout.feeling ===
                                                'great'
                                              ? 'Excellente séance !'
                                              : selectedWorkout.feeling ===
                                                  'good'
                                                ? 'Bonne séance'
                                                : selectedWorkout.feeling ===
                                                    'ok'
                                                  ? 'Séance correcte'
                                                  : selectedWorkout.feeling ===
                                                      'bad'
                                                    ? 'Séance pas terrible'
                                                    : selectedWorkout.feeling ===
                                                        'terrible'
                                                      ? 'Séance difficile'
                                                      : 'Ressenti personnalisé'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <h4 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5" />
                  <span>{t('exercises_performed')}</span>
                </h4>
                {selectedWorkout.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id || index}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200 fade-in-up"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${exercise.type === 'cardio' ? 'bg-red-500' : 'bg-blue-500'}`}
                        >
                          {exercise.type === 'cardio' ? (
                            <Heart className="h-5 w-5 text-white" />
                          ) : (
                            <Dumbbell className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <h5 className="font-bold text-gray-800 text-base sm:text-lg">
                          {exercise.name}
                        </h5>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${exercise.type === 'cardio' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                      >
                        {exercise.type === 'cardio' ? 'Cardio' : 'Musculation'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div
                        className={`grid gap-3 text-xs sm:text-sm font-bold text-gray-600 pb-2 border-b border-gray-300 ${exercise.type === 'cardio' ? 'grid-cols-3' : 'grid-cols-3'}`}
                      >
                        <span>{t('set')}</span>
                        {exercise.type === 'cardio' ? (
                          <>
                            <span>{t('duration')}</span>
                            <span>{t('intensity')}</span>
                          </>
                        ) : (
                          <>
                            <span>{t('repetitions')}</span>
                            <span>{t('weight')}</span>
                          </>
                        )}
                      </div>
                      {exercise.sets.map((set, setIndex) => (
                        <div
                          key={`set-${setIndex}-${exercise.id || index}`}
                          className="grid grid-cols-3 gap-3 text-xs sm:text-sm font-medium"
                        >
                          <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">
                            {setIndex + 1}
                          </span>
                          {exercise.type === 'cardio' ? (
                            <>
                              <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">
                                {set.duration} min
                              </span>
                              <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">
                                {set.reps}/10
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">
                                {set.reps}
                              </span>
                              <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">
                                {set.weight}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-2 sm:p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-xs sm:text-sm font-bold text-gray-600">
                        {exercise.type === 'cardio' ? (
                          <>
                            📊 Total:{' '}
                            {exercise.sets.reduce(
                              (acc, set) => acc + (set.duration || 0),
                              0
                            )}{' '}
                            min, ~
                            {exercise.sets.reduce(
                              (acc, set) =>
                                acc +
                                Math.round(
                                  (set.duration || 0) * (set.reps || 5) * 8
                                ),
                              0
                            )}{' '}
                            calories
                          </>
                        ) : (
                          <>
                            📊 Total:{' '}
                            {exercise.sets.reduce(
                              (acc, set) => acc + set.reps,
                              0
                            )}{' '}
                            reps,
                            {exercise.sets.reduce(
                              (acc, set) => acc + set.weight * set.reps,
                              0
                            )}{' '}
                            kg
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CalendarView.propTypes = {
  workouts: PropTypes.array.isRequired,
  getWorkoutForDate: PropTypes.func.isRequired,
  openWorkoutDetail: PropTypes.func.isRequired,
  showWorkoutDetail: PropTypes.bool,
  selectedWorkout: PropTypes.object,
  deleteWorkout: PropTypes.func,
  setShowWorkoutDetail: PropTypes.func,
  onEditWorkout: PropTypes.func,
  className: PropTypes.string,
};

export default CalendarView;

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
import { useState, useMemo } from 'react';
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
  onDateSelect,
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
  // Optimisation du calcul des jours du mois
  const days = useMemo(() => {
    const daysArray = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }
    return daysArray;
  }, [startingDayOfWeek, daysInMonth]);

  const [openWeeks, setOpenWeeks] = useState([]);
  
  // Optimisation des performances avec useMemo
  const sortedWorkouts = useMemo(() => 
    [...workouts].sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)),
    [workouts]
  );
  
  const weeks = useMemo(() => groupWorkoutsByWeek(workouts), [workouts]);
  const dateLocale = i18n.language === 'fr' ? 'fr-FR' : undefined;

  return (
    <div className={`p-6 space-y-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title text-3xl">
            {t('calendar')}
          </h2>
          <p className="text-secondary mt-1">{t('calendar_subtitle')}</p>
        </div>
      </div>

      <div className="card p-2 sm:p-4 w-full max-w-full overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn-secondary ripple-effect p-2 rounded-full"
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
          <div className="text-center text-lg sm:text-2xl section-title">
            {t(`month_${month + 1}`)} {year}
          </div>
          <button
            className="btn-secondary ripple-effect p-2 rounded-full"
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
                  ${isToday ? 'calendar-today' : 'calendar-day'}
                  ${hasWorkout ? 'calendar-workout' : 'calendar-empty'}
                `}
                style={{ minWidth: '32px', maxWidth: '100%', margin: '0 auto' }}
                onClick={() => {
                  if (hasWorkout) {
                    openWorkoutDetail(hasWorkout);
                  } else if (onDateSelect) {
                    onDateSelect(dateString);
                  }
                }}
              >
                {day}
                {hasWorkout && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 calendar-indicator rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 calendar-summary-grid">
        <div className="card hover-lift calendar-summary-card">
          <div className="flex items-center space-x-3 mb-3">
            <div className="icon-success w-4 h-4 rounded-full"></div>
            <span className="text-sm font-bold text-secondary">
              {t('sessions_done')}
            </span>
          </div>
          <p className="text-3xl font-bold text-primary">{workouts.length}</p>
        </div>

        <div className="card hover-lift calendar-summary-card">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="h-5 w-5 nav-icon" />
            <span className="text-sm font-bold text-secondary">
              {t('this_week')}
            </span>
          </div>
          <p className="text-3xl font-bold text-primary">
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

        <div className="card hover-lift calendar-summary-card">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="h-5 w-5 nav-icon" />
            <span className="text-sm font-bold text-secondary">
              Motivation
            </span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {workouts.length > 10
              ? '🔥 En feu!'
              : workouts.length > 5
                ? '💪 Fort!'
                : '🌱 Début'}
          </p>
        </div>
      </div>

      {sortedWorkouts.length > 0 && (
        <div className="card">
          <h3 className="section-title text-2xl mb-6 flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 nav-icon" />
            <span>{t('last_sessions')}</span>
          </h3>
          <div className="space-y-4">
            {sortedWorkouts.slice(0, 3).map((workout) => (
              <div
                key={workout.id}
                className="card hover-lift flex justify-between items-center py-4 px-6"
              >
                <div>
                  <p className="font-bold text-primary">
                    {parseLocalDate(workout.date).toLocaleDateString(
                      dateLocale
                    )}
                  </p>
                  <p className="text-sm text-secondary">
                    {workout.exercises.length} {t('exercises')} •{' '}
                    {workout.totalSets} {t('sets')}
                    {workout.startTime && (
                      <span className="ml-2">
                        • {workout.startTime}
                        {workout.endTime && ` → ${workout.endTime}`}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {workout.duration} min
                  </p>
                  <p className="text-sm text-secondary">
                    {workout.totalWeight} {t('kg')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="section-title text-2xl mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 nav-icon" /> {t('history_by_week')}
        </h2>
        {Object.keys(weeks).length === 0 ? (
          <div className="text-secondary">{t('no_sessions_recorded')}</div>
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
                    className="week-button ripple-effect w-full flex justify-between items-center px-6 py-4"
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
                            className="card hover-lift p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <div className="font-bold text-lg text-primary">
                                {parseLocalDate(w.date).toLocaleDateString(
                                  dateLocale
                                )}
                              </div>
                              <div className="text-sm text-secondary">
                                {w.exercises.length} {t('exercises')},{' '}
                                {w.totalSets} {t('sets')}, {w.totalReps}{' '}
                                {t('reps')}, {w.totalWeight} {t('kg')}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 sm:mt-0">
                              <button
                                onClick={() => onEditWorkout(w)}
                                className="btn-secondary ripple-effect flex items-center gap-2 px-4 py-2 text-sm sm:text-base max-w-full whitespace-nowrap"
                              >
                                <Edit3 className="h-4 w-4" />
                                {t('edit')}
                              </button>
                              <button
                                onClick={() => deleteWorkout(w.id)}
                                className="badge-danger ripple-effect flex items-center gap-2 px-4 py-2 text-sm sm:text-base max-w-full whitespace-nowrap"
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
        <div className="fixed inset-0 modal-backdrop flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="modal w-full max-w-3xl max-h-screen flex flex-col overflow-hidden">
            {/* Header sticky */}
            <div className="sticky top-0 z-10 px-4 sm:px-6 pt-4 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl sm:text-2xl font-bold">
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
                  className="btn-secondary px-3 sm:px-4 py-2 flex items-center space-x-2 text-sm sm:text-base"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </button>
                <button
                  onClick={() => setShowWorkoutDetail(false)}
                  className="btn-secondary p-2"
                  aria-label="Fermer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            {/* Contenu scrollable */}
            <div className="overflow-y-auto px-2 sm:px-6 py-4 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {selectedWorkout.duration}
                  </div>
                  <div className="text-xs sm:text-sm font-medium">
                    {t('minutes')}
                  </div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {selectedWorkout.totalSets}
                  </div>
                  <div className="text-xs sm:text-sm font-medium">
                    {t('series')}
                  </div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {selectedWorkout.totalReps}
                  </div>
                  <div className="text-xs sm:text-sm font-medium">
                    {t('repetitions')}
                  </div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold">
                    {selectedWorkout.totalWeight}
                  </div>
                  <div className="text-xs sm:text-sm font-medium">
                    {t('kg_lifted')}
                  </div>
                </div>
              </div>

              {/* Affichage des ressentis */}
              {selectedWorkout.feeling && (
                <div className="mb-8">
                  <h4 className="text-lg sm:text-xl font-bold flex items-center space-x-2 mb-4">
                    <span className="text-2xl">💭</span>
                    <span>Ressentis après la séance</span>
                  </h4>
                  <div className="card p-4 sm:p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 icon-primary rounded-full">
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
                        <p className="text-lg font-semibold capitalize">
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
                        <p className="text-sm mt-1">
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
                <h4 className="text-lg sm:text-xl font-bold flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5" />
                  <span>{t('exercises_performed')}</span>
                </h4>
                {selectedWorkout.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id || index}
                    className="card p-4 sm:p-6"
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
                        <h5 className="font-bold text-base sm:text-lg">
                          {exercise.name}
                        </h5>
                      </div>
                      <span
                        className={`badge text-xs sm:text-sm ${exercise.type === 'cardio' ? 'badge-danger' : 'badge'}`}
                      >
                        {exercise.type === 'cardio' ? 'Cardio' : 'Musculation'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div
                        className={`grid gap-3 text-xs sm:text-sm font-bold pb-2 ${exercise.type === 'cardio' ? 'grid-cols-3' : 'grid-cols-3'}`}
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
                          <span className="card px-2 sm:px-3 py-2 text-center">
                            {setIndex + 1}
                          </span>
                          {exercise.type === 'cardio' ? (
                            <>
                              <span className="card px-2 sm:px-3 py-2 text-center">
                                {set.duration} min
                              </span>
                              <span className="card px-2 sm:px-3 py-2 text-center">
                                {set.reps}/10
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="card px-2 sm:px-3 py-2 text-center">
                                {set.reps}
                              </span>
                              <span className="card px-2 sm:px-3 py-2 text-center">
                                {set.weight}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-2 sm:p-3 card">
                      <span className="text-xs sm:text-sm font-bold">
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
  onDateSelect: PropTypes.func,
  className: PropTypes.string,
};

export default CalendarView;

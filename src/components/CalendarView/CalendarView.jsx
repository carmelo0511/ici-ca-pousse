import React from 'react';
import { Clock, Zap, Dumbbell, Heart, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CalendarView = ({
  workouts,
  getWorkoutForDate,
  openWorkoutDetail,
  showWorkoutDetail,
  selectedWorkout,
  deleteWorkout,
  setShowWorkoutDetail
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            📅 {t('calendar')}
          </h2>
          <p className="text-gray-600 mt-1">{t('calendar_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 fade-in-up">
        <div className="text-center text-2xl font-bold text-gray-800 mb-8">
          {t(`month_${currentMonth + 1}`)} {currentYear}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => (
            <div key={day} className="text-center text-sm font-bold text-gray-600 py-3">
              {t(day)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) return <div key={index} className="h-12"></div>;

            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasWorkout = getWorkoutForDate(dateString);
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

            return (
              <div
                key={day}
                className={`
                  h-12 flex items-center justify-center text-sm rounded-xl cursor-pointer font-medium transition-all duration-200 relative
                  ${isToday ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'hover:bg-gray-100'}
                  ${hasWorkout ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-md' : ''}
                `}
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
            <span className="text-sm font-bold text-green-800">{t('sessions_done')}</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{workouts.length}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6 fade-in-up">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-800">{t('this_week')}</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            {workouts.filter(w => {
              const workoutDate = new Date(w.date);
              const today = new Date();
              const weekStart = new Date(today);
              weekStart.setDate(today.getDate() - today.getDay());
              weekStart.setHours(0, 0, 0, 0);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              weekEnd.setHours(23, 59, 59, 999);
              return workoutDate >= weekStart && workoutDate <= weekEnd;
            }).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 rounded-2xl p-6 fade-in-up">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-800">Motivation</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {workouts.length > 10 ? '🔥 En feu!' : workouts.length > 5 ? '💪 Fort!' : '🌱 Début'}
          </p>
        </div>
      </div>

      {showWorkoutDetail && selectedWorkout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-screen flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header sticky */}
            <div className="sticky top-0 z-10 bg-white rounded-t-3xl px-4 sm:px-6 pt-4 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🏋️ Séance du {new Date(selectedWorkout.date).toLocaleDateString('fr-FR')}
              </h3>
              <div className="flex flex-wrap gap-2 ml-auto">
                <button
                  onClick={() => deleteWorkout(selectedWorkout.id)}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 sm:px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
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
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{selectedWorkout.duration}</div>
                  <div className="text-xs sm:text-sm font-medium text-blue-800">{t('minutes')}</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl text-center border border-green-200">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{selectedWorkout.totalSets}</div>
                  <div className="text-xs sm:text-sm font-medium text-green-800">{t('series')}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl text-center border border-purple-200">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">{selectedWorkout.totalReps}</div>
                  <div className="text-xs sm:text-sm font-medium text-purple-800">{t('repetitions')}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4 rounded-2xl text-center border border-orange-200">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-600">{selectedWorkout.totalWeight}</div>
                  <div className="text-xs sm:text-sm font-medium text-orange-800">{t('kg_lifted')}</div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5" />
                  <span>{t('exercises_performed')}</span>
                </h4>
                {selectedWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200 fade-in-up">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${exercise.type === 'cardio' ? 'bg-red-500' : 'bg-blue-500'}`}>
                          {exercise.type === 'cardio' ? <Heart className="h-5 w-5 text-white" /> : <Dumbbell className="h-5 w-5 text-white" />}
                        </div>
                        <h5 className="font-bold text-gray-800 text-base sm:text-lg">{exercise.name}</h5>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${exercise.type === 'cardio' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {exercise.type === 'cardio' ? 'Cardio' : 'Musculation'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className={`grid gap-3 text-xs sm:text-sm font-bold text-gray-600 pb-2 border-b border-gray-300 ${exercise.type === 'cardio' ? 'grid-cols-3' : 'grid-cols-3'}`}> 
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
                        <div key={setIndex} className="grid grid-cols-3 gap-3 text-xs sm:text-sm font-medium">
                          <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">{setIndex + 1}</span>
                          {exercise.type === 'cardio' ? (
                            <>
                              <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">{set.duration} min</span>
                              <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">{set.reps}/10</span>
                            </>
                          ) : (
                            <>
                              <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">{set.reps}</span>
                              <span className="bg-white rounded-lg px-2 sm:px-3 py-2 text-center border border-gray-200">{set.weight}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-2 sm:p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-xs sm:text-sm font-bold text-gray-600">
                        {exercise.type === 'cardio' ? (
                          <>📊 Total: {exercise.sets.reduce((acc, set) => acc + (set.duration || 0), 0)} min,
                          ~{exercise.sets.reduce((acc, set) => acc + Math.round((set.duration || 0) * (set.reps || 5) * 8), 0)} calories</>
                        ) : (
                          <>📊 Total: {exercise.sets.reduce((acc, set) => acc + set.reps, 0)} reps,
                          {exercise.sets.reduce((acc, set) => acc + (set.weight * set.reps), 0)} kg</>
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

export default CalendarView;

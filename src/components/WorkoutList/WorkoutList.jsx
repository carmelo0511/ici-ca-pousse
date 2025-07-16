import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../utils/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  Calendar,
  Plus,
  Dumbbell,
  Heart,
  Target,
  Clock,
  X,
  Star,
  Activity,
  Shield,
  Zap,
  Apple
} from 'lucide-react';
import { exerciseDatabase } from '../../utils/exerciseDatabase';
import Modal from '../Modal';
import GradientButton from '../GradientButton';
import Card from '../Card';
import IconButton from '../IconButton';
import PropTypes from 'prop-types';

function getMuscleIcon(muscle) {
  switch (muscle) {
    case 'pectoraux': return <Dumbbell className="h-8 w-8 text-white" />;
    case 'dos': return <Target className="h-8 w-8 text-white" />;
    case 'jambes': return <Shield className="h-8 w-8 text-white" />;
    case 'abdos': return <Apple className="h-8 w-8 text-white" />;
    case 'biceps': return <Dumbbell className="h-8 w-8 text-white" />;
    case 'triceps': return <Zap className="h-8 w-8 text-white" />;
    case 'épaules': return <Activity className="h-8 w-8 text-white" />;
    case 'cardio': return <Heart className="h-8 w-8 text-white" />;
    default: return <Dumbbell className="h-8 w-8 text-white" />;
  }
}

function WorkoutList({
  selectedDate,
  setSelectedDate,
  exercises,
  addSet,
  updateSet,
  removeSet,
  saveWorkout,
  workoutDuration,
  setWorkoutDuration,
  showAddExercise,
  setShowAddExercise,
  selectedMuscleGroup,
  setSelectedMuscleGroup,
  addExerciseToWorkout,
  className = '',
}) {
  const { t } = useTranslation();
  const [user] = useAuthState(auth);
  // Ajout d'un état local pour le nom de l'exercice personnalisé
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteExercises, setFavoriteExercises] = useState([]);

  // Synchro favoris Firestore <-> localStorage
  useEffect(() => {
    if (user) {
      const favRef = doc(db, 'favorites', user.uid);
      // Ecoute temps réel
      const unsubscribe = onSnapshot(favRef, (docSnap) => {
        if (docSnap.exists()) {
          setFavoriteExercises(docSnap.data().exercises || []);
        } else {
          setFavoriteExercises([]);
        }
      });
      return unsubscribe;
    } else {
      // Fallback localStorage
      try {
        setFavoriteExercises(JSON.parse(localStorage.getItem('favoriteExercises') || '[]'));
      } catch {
        setFavoriteExercises([]);
      }
    }
  }, [user]);

  // Sauvegarde favoris Firestore ou localStorage
  useEffect(() => {
    if (user) {
      const favRef = doc(db, 'favorites', user.uid);
      setDoc(favRef, { exercises: favoriteExercises }, { merge: true });
    } else {
      localStorage.setItem('favoriteExercises', JSON.stringify(favoriteExercises));
    }
  }, [favoriteExercises, user]);

  // Migration favoris locaux -> cloud
  useEffect(() => {
    if (user) {
      const localFavs = JSON.parse(localStorage.getItem('favoriteExercises') || '[]');
      if (localFavs.length > 0) {
        const favRef = doc(db, 'favorites', user.uid);
        setDoc(favRef, { exercises: localFavs }, { merge: true });
        localStorage.setItem('favoriteExercises', '[]');
      }
    }
  }, [user]);

  const toggleFavorite = useCallback((exercise) => {
    setFavoriteExercises((prev) =>
      prev.includes(exercise)
        ? prev.filter((e) => e !== exercise)
        : [...prev, exercise]
    );
  }, []);

  // Filtrage dynamique des exercices selon la recherche
  const filteredExercises = useMemo(() => (
    selectedMuscleGroup && searchTerm.trim()
      ? exerciseDatabase[selectedMuscleGroup].filter(ex =>
          ex.toLowerCase().includes(searchTerm.trim().toLowerCase())
        )
      : selectedMuscleGroup
        ? exerciseDatabase[selectedMuscleGroup]
        : []
  ), [selectedMuscleGroup, searchTerm]);

  // Exercices favoris du groupe sélectionné (filtrés)
  const favoriteInGroup = useMemo(() => (
    selectedMuscleGroup
      ? filteredExercises.filter(ex => favoriteExercises.includes(ex))
      : []
  ), [selectedMuscleGroup, filteredExercises, favoriteExercises]);
  const nonFavoriteInGroup = useMemo(() => (
    selectedMuscleGroup
      ? filteredExercises.filter(ex => !favoriteExercises.includes(ex))
      : []
  ), [selectedMuscleGroup, filteredExercises, favoriteExercises]);

  return (
    <div className={`p-6 space-y-8 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t('new_workout')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('create_program')}
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-md border border-gray-100">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-0 outline-none font-medium text-gray-700"
          />
        </div>
      </div>

      {exercises.length === 0 ? (
        <Card className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl inline-block mb-6 shadow-lg">
            <Dumbbell className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('ready_to_train')}</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {t('start_workout')}
          </p>
          <GradientButton icon={Plus} onClick={() => setShowAddExercise(true)}>
            {t('add_exercise')}
          </GradientButton>
        </Card>
      ) : (
        <div className="space-y-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    exercise.type === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {exercise.type === 'cardio' ? <Heart className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      exercise.type === 'cardio' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {exercise.type === 'cardio' ? 'Cardio' : 'Musculation'}
                    </span>
                  </div>
                </div>
                <IconButton icon={Plus} onClick={() => addSet(exercise.id)} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg" />
              </div>

              <div className="space-y-3">
                <div className={`grid gap-3 text-sm font-semibold text-gray-600 pb-2 border-b border-gray-200 ${
                  exercise.type === 'cardio' ? 'grid-cols-4' : 'grid-cols-5'
                }`}>
                  <span>Série</span>
                  {exercise.type === 'cardio' ? (
                    <>
                      <span>Durée (min)</span>
                      <span>Intensité</span>
                      <span>Calories</span>
                    </>
                  ) : (
                    <>
                      <span>Répétitions</span>
                      <span>Poids (kg)</span>
                      <span>Total</span>
                      <span></span>
                    </>
                  )}
                </div>

                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className={`grid gap-3 items-center ${
                    exercise.type === 'cardio' ? 'grid-cols-4' : 'grid-cols-5'
                  }`}>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-lg px-3 py-2 text-center">
                      {setIndex + 1}
                    </span>
                    {exercise.type === 'cardio' ? (
                      <>
                        <input
                          type="number"
                          value={set.duration}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'duration', e.target.value)}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-red-500 focus:outline-none transition-colors duration-200"
                          min="0"
                          placeholder="20"
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'reps', e.target.value)}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-red-500 focus:outline-none transition-colors duration-200"
                          min="1"
                          max="10"
                          placeholder="7"
                        />
                        <span className="text-sm font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">
                          {Math.round((set.duration || 0) * (set.reps || 5) * 8)}
                        </span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'reps', e.target.value)}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          min="0"
                          placeholder="12"
                        />
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'weight', e.target.value)}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          min="0"
                          step="0.5"
                          placeholder="50"
                        />
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg px-3 py-2 text-center">
                          {set.reps * set.weight} kg
                        </span>
                        <button
                          onClick={() => removeSet(exercise.id, setIndex)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <div className="flex flex-row gap-4 justify-center items-center mt-4">
            <GradientButton icon={Plus} from="gray-100" to="gray-200" className="text-gray-700 border border-gray-200" onClick={() => setShowAddExercise(true)}>
              {t('add_exercise')}
            </GradientButton>
            <GradientButton icon={Target} from="green-500" to="emerald-600" onClick={saveWorkout}>
              {t('finish_workout')}
            </GradientButton>
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{t('workout_duration')}</h3>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(e.target.value)}
                placeholder="45"
                className="border-2 border-blue-200 rounded-xl px-4 py-3 w-32 text-center font-semibold focus:border-blue-500 focus:outline-none transition-colors duration-200"
                min="1"
                max="300"
              />
              <span className="text-gray-700 font-medium">{t('minutes')}</span>
            </div>
            <p className="text-sm text-blue-600 mt-3 font-medium">
              {t('default_duration_hint')}
            </p>
          </Card>
        </div>
      )}

      <Modal isOpen={showAddExercise} onClose={() => { setShowAddExercise(false); setSelectedMuscleGroup(null); }}>
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {selectedMuscleGroup && (
              <button
                onClick={() => setSelectedMuscleGroup(null)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
              >
                {t('back')}
              </button>
            )}
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {selectedMuscleGroup ? `💪 ${selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1)}` : t('choose_muscle_group')}
            </h3>
          </div>
          <button
            onClick={() => {
              setShowAddExercise(false);
              setSelectedMuscleGroup(null);
            }}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2">
          {!selectedMuscleGroup ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(exerciseDatabase).map(([muscle, exerciseList]) => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscleGroup(muscle)}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`p-4 rounded-2xl ${muscle === 'cardio' ? 'bg-red-500' : 'bg-indigo-500'} shadow-lg`}>
                      {getMuscleIcon(muscle)}
                    </div>
                    <div className="text-center">
                      <h4 className="font-bold text-gray-800 capitalize text-xl mb-2">{t(muscle)}</h4>
                      <p className="text-sm text-gray-600">{exerciseList.length} exercices</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Champ de recherche d'exercice */}
              <div className="flex flex-col items-center mb-4 w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={t('search_exercise')}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2 w-full max-w-md text-center font-medium focus:border-indigo-500 focus:outline-none transition-colors duration-200 shadow-sm"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {filteredExercises.length === 0 ? (
                  <div className="col-span-2 sm:col-span-3 text-center text-gray-400 py-8">{t('no_exercise_found')}</div>
                ) : (
                  <>
                    {/* Affichage des favoris en haut */}
                    {favoriteInGroup.length > 0 && (
                      <>
                        {favoriteInGroup.map((exercise) => (
                          <div key={exercise} className="relative">
                            <button
                              onClick={() => addExerciseToWorkout(exercise)}
                              className="w-full text-left p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl font-medium text-gray-700 transition-all duration-200 border border-yellow-200 hover:border-yellow-400 hover:shadow-md transform hover:scale-[1.02]"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${selectedMuscleGroup === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                  {selectedMuscleGroup === 'cardio' ? <Heart className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
                                </div>
                                <span className="flex-1">{t(exercise)}</span>
                                <span className="text-gray-400">→</span>
                              </div>
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); toggleFavorite(exercise); }}
                              className="absolute top-2 right-2 text-yellow-500 hover:text-yellow-600"
                              title="Retirer des favoris"
                            >
                              <Star fill="currentColor" className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <div className="col-span-2 sm:col-span-3 border-b border-yellow-200 my-2"></div>
                      </>
                    )}
                    {/* Exercices non favoris */}
                    {nonFavoriteInGroup.map((exercise) => (
                      <div key={exercise} className="relative">
                        <button
                          onClick={() => addExerciseToWorkout(exercise)}
                          className="w-full text-left p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-xl font-medium text-gray-700 transition-all duration-200 border border-gray-200 hover:border-indigo-300 hover:shadow-md transform hover:scale-[1.02]"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${selectedMuscleGroup === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                              {selectedMuscleGroup === 'cardio' ? <Heart className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
                            </div>
                            <span className="flex-1">{t(exercise)}</span>
                            <span className="text-gray-400">→</span>
                          </div>
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); toggleFavorite(exercise); }}
                          className="absolute top-2 right-2 text-gray-300 hover:text-yellow-500"
                          title="Ajouter aux favoris"
                        >
                          <Star className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
              {/* Champ pour exercice personnalisé */}
              <div className="flex flex-col items-center justify-center gap-3 mt-4 w-full">
                <input
                  type="text"
                  value={customExerciseName}
                  onChange={e => setCustomExerciseName(e.target.value)}
                  placeholder={t('custom_exercise_name')}
                  className="border-2 border-indigo-200 rounded-xl px-4 py-3 w-full max-w-md text-center font-semibold focus:border-indigo-500 focus:outline-none transition-colors duration-200 shadow-sm"
                />
                <button
                  onClick={() => {
                    if (customExerciseName.trim()) {
                      addExerciseToWorkout(customExerciseName.trim());
                      setCustomExerciseName('');
                      setShowAddExercise(false);
                      setSelectedMuscleGroup(null);
                    }
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full max-w-md"
                >
                  {t('add')}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

WorkoutList.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  setSelectedDate: PropTypes.func.isRequired,
  exercises: PropTypes.array.isRequired,
  addSet: PropTypes.func.isRequired,
  updateSet: PropTypes.func.isRequired,
  removeSet: PropTypes.func,
  saveWorkout: PropTypes.func,
  workoutDuration: PropTypes.number,
  setWorkoutDuration: PropTypes.func,
  showAddExercise: PropTypes.bool,
  setShowAddExercise: PropTypes.func,
  selectedMuscleGroup: PropTypes.string,
  setSelectedMuscleGroup: PropTypes.func,
  addExerciseToWorkout: PropTypes.func,
  className: PropTypes.string,
};

export default memo(WorkoutList);

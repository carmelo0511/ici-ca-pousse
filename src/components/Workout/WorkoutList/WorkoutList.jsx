import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '../../../constants';
import { db } from '../../../utils/firebase';
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
  Apple,
  Smile,
  Meh,
  Frown,
  Bookmark
} from 'lucide-react';
import { exerciseDatabase } from '../../../utils/exerciseDatabase';
import Modal from '../Modal';
import GradientButton from '../../GradientButton';
import Card from '../../Card';
import IconButton from '../../IconButton';
import PropTypes from 'prop-types';
import { getLastExerciseWeight } from '../../../utils/workoutUtils';



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
  workouts,
  addSet,
  updateSet,
  removeSet,
  saveWorkout,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  showAddExercise,
  setShowAddExercise,
  selectedMuscleGroup,
  setSelectedMuscleGroup,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  onSaveTemplate,
  user,
  className = '',
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('exerciseFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [customFeeling, setCustomFeeling] = useState('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Options de ressentis prédéfinis
  const feelingOptions = [
    { value: 'easy', label: t('feeling_easy'), icon: <Smile className="h-5 w-5" />, color: 'green' },
    { value: 'medium', label: t('feeling_medium'), icon: <Meh className="h-5 w-5" />, color: 'yellow' },
    { value: 'hard', label: t('feeling_hard'), icon: <Frown className="h-5 w-5" />, color: 'red' },
    { value: 'weak', label: t('feeling_weak'), icon: <Frown className="h-5 w-5" />, color: 'orange' },
    { value: 'strong', label: t('feeling_strong'), icon: <Smile className="h-5 w-5" />, color: 'green' },
    { value: 'tired', label: t('feeling_tired'), icon: <Meh className="h-5 w-5" />, color: 'gray' },
    { value: 'energized', label: t('feeling_energized'), icon: <Smile className="h-5 w-5" />, color: 'blue' },
    { value: 'motivated', label: t('feeling_motivated'), icon: <Smile className="h-5 w-5" />, color: 'purple' },
    { value: 'demotivated', label: t('feeling_demotivated'), icon: <Frown className="h-5 w-5" />, color: 'gray' },
    { value: 'great', label: t('feeling_great'), icon: <Smile className="h-5 w-5" />, color: 'green' },
    { value: 'good', label: t('feeling_good'), icon: <Smile className="h-5 w-5" />, color: 'blue' },
    { value: 'ok', label: t('feeling_ok'), icon: <Meh className="h-5 w-5" />, color: 'yellow' },
    { value: 'bad', label: t('feeling_bad'), icon: <Frown className="h-5 w-5" />, color: 'orange' },
    { value: 'terrible', label: t('feeling_terrible'), icon: <Frown className="h-5 w-5" />, color: 'red' },
  ];

  // Fonction pour gérer la sauvegarde avec ressentis
  const handleSaveWorkout = () => {
    if (exercises.length === 0) {
      saveWorkout();
      return;
    }
    setShowFeelingModal(true);
  };

  // Fonction pour gérer la sauvegarde directe en template
  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      alert('Veuillez donner un nom au template');
      return;
    }

    if (exercises.length === 0) {
      alert('Aucun exercice à sauvegarder');
      return;
    }

    try {
      await onSaveTemplate(exercises, templateName.trim(), templateDescription.trim());
      setShowSaveTemplateModal(false);
      setTemplateName('');
      setTemplateDescription('');
      // Message de succès géré par le parent (App.js)
    } catch (error) {
      console.error('Erreur sauvegarde template:', error);
      alert('Erreur lors de la sauvegarde du template');
    }
  };

  // Fonction pour confirmer la sauvegarde avec ressentis
  const confirmSaveWorkout = () => {
    let feeling = null;
    if (selectedFeeling === 'custom' && customFeeling.trim()) {
      feeling = customFeeling.trim();
    } else if (selectedFeeling && selectedFeeling !== 'none') {
      feeling = selectedFeeling;
    }
    saveWorkout(feeling);
    setShowFeelingModal(false);
    setSelectedFeeling('');
    setCustomFeeling('');
  };

  // Fonction pour obtenir le dernier poids d'un exercice
  const getLastWeightFor = useCallback(
    (name) => getLastExerciseWeight(workouts || [], name, selectedDate),
    [workouts, selectedDate]
  );

  // Synchro favoris Firestore <-> localStorage
  useEffect(() => {
    if (user) {
      const favRef = doc(db, 'favorites', user.uid);
      // Ecoute temps réel
      const unsubscribe = onSnapshot(favRef, (docSnap) => {
        if (docSnap.exists()) {
          setFavorites(docSnap.data().exercises || []);
        } else {
          setFavorites([]);
        }
      });
      return unsubscribe;
    } else {
      // Fallback localStorage
      try {
        setFavorites(JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE_EXERCISES) || '[]'));
      } catch {
        setFavorites([]);
      }
    }
  }, [user]);

  // Sauvegarde favoris Firestore ou localStorage
  useEffect(() => {
    if (user) {
      const favRef = doc(db, 'favorites', user.uid);
      setDoc(favRef, { exercises: favorites }, { merge: true });
    } else {
      localStorage.setItem(STORAGE_KEYS.FAVORITE_EXERCISES, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Migration favoris locaux -> cloud
  useEffect(() => {
    if (user) {
      const localFavs = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE_EXERCISES) || '[]');
      if (localFavs.length > 0) {
        const favRef = doc(db, 'favorites', user.uid);
        setDoc(favRef, { exercises: localFavs }, { merge: true });
        localStorage.setItem(STORAGE_KEYS.FAVORITE_EXERCISES, '[]');
      }
    }
  }, [user]);

  const toggleFavorite = useCallback((exercise) => {
    setFavorites((prev) =>
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
      ? filteredExercises.filter(ex => favorites.includes(ex))
      : []
  ), [selectedMuscleGroup, filteredExercises, favorites]);
  const nonFavoriteInGroup = useMemo(() => (
    selectedMuscleGroup
      ? filteredExercises.filter(ex => !favorites.includes(ex))
      : []
  ), [selectedMuscleGroup, filteredExercises, favorites]);

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
        <Card className="text-center py-6 sm:py-10 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 w-full max-w-[340px] sm:max-w-[400px] mx-auto overflow-visible shadow-md rounded-3xl" style={{ boxSizing: 'border-box' }}>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl inline-block mb-4 shadow-lg">
            <Dumbbell className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2 break-words overflow-wrap break-word truncate max-w-full">
            {t('ready_to_train')}
          </h3>
          <p className="text-gray-600 mb-6 max-w-[90%] mx-auto break-words overflow-wrap break-word truncate max-w-full">
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
                    {exercise.type !== 'cardio' && getLastWeightFor(exercise.name) !== null && (
                      <p className="text-xs text-gray-500">Dernier poids : {getLastWeightFor(exercise.name)} kg</p>
                    )}
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      exercise.type === 'cardio' ? 'bg-red-100 text-red-700' :
                      exercise.type === 'custom' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {exercise.type === 'cardio' ? 'Cardio' : 
                       exercise.type === 'custom' ? 'Personnalisé' : 
                       exercise.type ? t(exercise.type) : 'Musculation'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <IconButton
                    icon={Plus}
                    onClick={() => addSet(exercise.id)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
                  />
                  <button
                    onClick={() => removeExerciseFromWorkout(exercise.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md w-7 h-7 flex items-center justify-center"
                    title="Supprimer l'exercice"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
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
                          step="0.25"
                          placeholder="50"
                        />
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg px-3 py-2 text-center">
                          {set.reps * set.weight} kg
                        </span>
                        <button
                          onClick={() => removeSet(exercise.id, setIndex)}
                          className="bg-red-500 hover:bg-red-600 text-white p-0.5 rounded transition-all duration-200 shadow-sm hover:shadow-md w-6 h-6 flex items-center justify-center"
                          title="Supprimer la série"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <div className="space-y-3 mt-4">
            {/* Première ligne : Ajouter exercice + Vider séance */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowAddExercise(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex-1 max-w-xs"
              >
                <Plus className="h-5 w-5" />
                {t('add_exercise')}
              </button>
              {exercises.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Supprimer tous les exercices de cette séance ?')) {
                      exercises.forEach(exercise => removeExerciseFromWorkout(exercise.id));
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex-1 max-w-xs"
                >
                  <X className="h-5 w-5" />
                  <span className="font-medium">Vider la séance</span>
                </button>
              )}
            </div>

            {/* Deuxième ligne : Template + Terminer séance */}
            {exercises.length > 0 && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowSaveTemplateModal(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex-1 max-w-xs"
                >
                  <Bookmark className="h-5 w-5" />
                  Sauvegarder en template
                </button>
                <button
                  onClick={handleSaveWorkout}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex-1 max-w-xs"
                >
                  <Target className="h-5 w-5" />
                  {t('finish_workout')}
                </button>
              </div>
            )}

            {/* Si pas d'exercices, afficher seulement Terminer séance */}
            {exercises.length === 0 && (
              <div className="flex justify-center">
                <button
                  onClick={handleSaveWorkout}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 max-w-xs"
                >
                  <Target className="h-5 w-5" />
                  {t('finish_workout')}
                </button>
              </div>
            )}
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Heure de la séance</h3>
            </div>
            
            {/* Sélecteur d'heure moderne */}
            <div className="space-y-4">
              {/* Options rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setStartTime('06:00');
                    setEndTime('07:00');
                  }}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    startTime === '06:00' && endTime === '07:00'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  🌅 Matin<br/>6h-7h
                </button>
                <button
                  onClick={() => {
                    setStartTime('12:00');
                    setEndTime('13:00');
                  }}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    startTime === '12:00' && endTime === '13:00'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  ☀️ Midi<br/>12h-13h
                </button>
                <button
                  onClick={() => {
                    setStartTime('18:00');
                    setEndTime('19:00');
                  }}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    startTime === '18:00' && endTime === '19:00'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  🌆 Soir<br/>18h-19h
                </button>
                <button
                  onClick={() => {
                    setStartTime('20:00');
                    setEndTime('21:00');
                  }}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    startTime === '20:00' && endTime === '21:00'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  🌙 Soirée<br/>20h-21h
                </button>
              </div>

              {/* Sélecteur personnalisé */}
              <div className="flex items-center space-x-4">
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2">Début</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="border-2 border-blue-200 rounded-xl px-4 py-3 text-center font-semibold focus:border-blue-500 focus:outline-none transition-colors duration-200 bg-white"
                    step="60"
                  />
                </div>
                
                <div className="text-gray-700 font-medium text-2xl mt-6">→</div>
                
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2">Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="border-2 border-blue-200 rounded-xl px-4 py-3 text-center font-semibold focus:border-blue-500 focus:outline-none transition-colors duration-200 bg-white"
                    step="60"
                  />
                </div>
              </div>

              {/* Durées prédéfinies */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Durées rapides:</span>
                {[30, 45, 60, 90].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => {
                      if (startTime) {
                        const start = new Date(`2000-01-01T${startTime}`);
                        const end = new Date(start.getTime() + minutes * 60 * 1000);
                        setEndTime(end.toTimeString().slice(0, 5));
                      }
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors duration-200"
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>

            {/* Affichage de la durée calculée */}
            {startTime && endTime && (
              <div className="mt-4 p-4 bg-blue-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      ⏱️ Durée : {(() => {
                        const start = new Date(`2000-01-01T${startTime}`);
                        const end = new Date(`2000-01-01T${endTime}`);
                        const duration = Math.round((end - start) / (1000 * 60));
                        return duration > 0 ? `${duration} minutes` : 'Heure de fin invalide';
                      })()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {(() => {
                        const hour = parseInt(startTime.split(':')[0]);
                        if (hour >= 5 && hour < 12) return '🌅 Séance du matin';
                        if (hour >= 12 && hour < 18) return '☀️ Séance de l\'après-midi';
                        if (hour >= 18 && hour < 22) return '🌆 Séance du soir';
                        return '🌙 Séance de nuit';
                      })()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setStartTime('');
                      setEndTime('');
                    }}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <p className="text-sm text-blue-600 mt-3 font-medium">
              💡 Laissez vide pour une durée par défaut de 30 minutes
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
              <div className="grid grid-cols-1 gap-4 mb-6 max-h-[60vh] overflow-y-auto flex-1 w-full">
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
                              onClick={() => addExerciseToWorkout(exercise, selectedMuscleGroup)}
                              className="w-full text-left p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl font-medium text-gray-700 transition-all duration-200 border border-yellow-200 hover:border-yellow-400 hover:shadow-md transform hover:scale-[1.02]"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${selectedMuscleGroup === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                  {selectedMuscleGroup === 'cardio' ? <Heart className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
                                </div>
                                <span className="flex-1 text-center text-base font-medium break-words leading-tight max-h-[2.5em] overflow-hidden">{t(exercise)}</span>
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
                          onClick={() => addExerciseToWorkout(exercise, selectedMuscleGroup)}
                          className="w-full text-left p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-xl font-medium text-gray-700 transition-all duration-200 border border-gray-200 hover:border-indigo-300 hover:shadow-md transform hover:scale-[1.02]"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${selectedMuscleGroup === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                              {selectedMuscleGroup === 'cardio' ? <Heart className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
                            </div>
                            <span className="flex-1 text-center text-base font-medium break-words leading-tight max-h-[2.5em] overflow-hidden">{t(exercise)}</span>
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
                      // Passer l'exercice avec sa catégorie musculaire
                      addExerciseToWorkout(customExerciseName.trim(), selectedMuscleGroup);
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

      {/* Modal de ressenti */}
      <Modal isOpen={showFeelingModal} onClose={() => setShowFeelingModal(false)}>
        <div className="flex flex-col items-center justify-center gap-6 p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t('workout_feeling')}
            </h3>
            <p className="text-gray-600">Partagez vos ressentis après cette séance</p>
          </div>
          
          {/* Options de ressentis prédéfinis */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
            {feelingOptions.map((feeling) => (
              <button
                key={feeling.value}
                onClick={() => {
                  setSelectedFeeling(feeling.value);
                  setCustomFeeling('');
                }}
                className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                  selectedFeeling === feeling.value
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${
                  selectedFeeling === feeling.value 
                    ? 'bg-white/20' 
                    : `bg-${feeling.color}-100 text-${feeling.color}-600`
                }`}>
                  {feeling.icon}
                </div>
                <span className={`text-xs font-medium ${
                  selectedFeeling === feeling.value ? 'text-white' : 'text-gray-700'
                }`}>
                  {feeling.label}
                </span>
              </button>
            ))}
          </div>

          {/* Option personnalisée */}
          <div className="w-full max-w-lg">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => {
                  setSelectedFeeling('custom');
                  setCustomFeeling('');
                }}
                className={`p-3 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                  selectedFeeling === 'custom'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span className="text-sm font-medium">💭 Ressenti personnalisé</span>
              </button>
            </div>
            
            {selectedFeeling === 'custom' && (
              <input
                type="text"
                value={customFeeling}
                onChange={e => setCustomFeeling(e.target.value)}
                placeholder={t('feeling_placeholder')}
                className="border-2 border-indigo-200 rounded-xl px-4 py-3 w-full text-center font-medium focus:border-indigo-500 focus:outline-none transition-colors duration-200 shadow-sm"
                autoFocus
              />
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 w-full max-w-lg">
            <button
              onClick={() => {
                setShowFeelingModal(false);
                setSelectedFeeling('');
                setCustomFeeling('');
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              onClick={confirmSaveWorkout}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t('finish_workout')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal sauvegarder en template */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Sauvegarder en template</h3>
              <button
                onClick={() => {
                  setShowSaveTemplateModal(false);
                  setTemplateName('');
                  setTemplateDescription('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du template *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none"
                  placeholder="Ex: Séance pectoraux"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none"
                  placeholder="Description du template..."
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-blue-800">
                  <Star className="h-4 w-4" />
                  <span>Cette séance contient {exercises.length} exercices</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveTemplateModal(false);
                  setTemplateName('');
                  setTemplateDescription('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAsTemplate}
                className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200"
                style={{
                  background: 'linear-gradient(to right, #a855f7, #7c3aed)',
                }}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

WorkoutList.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  setSelectedDate: PropTypes.func.isRequired,
  exercises: PropTypes.array.isRequired,
  workouts: PropTypes.array,
  addSet: PropTypes.func.isRequired,
  updateSet: PropTypes.func.isRequired,
  removeSet: PropTypes.func,
  saveWorkout: PropTypes.func,
  startTime: PropTypes.string,
  setStartTime: PropTypes.func,
  endTime: PropTypes.string,
  setEndTime: PropTypes.func,
  showAddExercise: PropTypes.bool,
  setShowAddExercise: PropTypes.func,
  selectedMuscleGroup: PropTypes.string,
  setSelectedMuscleGroup: PropTypes.func,
  addExerciseToWorkout: PropTypes.func,
  removeExerciseFromWorkout: PropTypes.func,
  onSaveTemplate: PropTypes.func,
  user: PropTypes.object, // Added user prop type
  className: PropTypes.string,
};

export default memo(WorkoutList);

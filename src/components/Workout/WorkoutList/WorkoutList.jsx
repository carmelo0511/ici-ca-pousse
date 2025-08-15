import React, { memo, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Calendar,
  Plus,
  Dumbbell,
  Heart,
  Target,
  Clock,
  X,
  Activity,
  Shield,
  Zap,
  Apple,
  Bookmark,
  Star,
  Mic,
  MicOff,
} from 'lucide-react';
import { exerciseDatabase } from '../../../utils/workout/exerciseDatabase';
import Modal from '../Modal';
import ConicGradientButton from '../../ConicGradientButton';
import Card from '../../Card';

import LexIA from '../../IAInfoBox';
import MLWeightPrediction from '../../MLWeightPrediction';

import PropTypes from 'prop-types';
import { getLastExerciseWeight } from '../../../utils/workout/workoutUtils';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';

function getMuscleIcon(muscle) {
  switch (muscle) {
    case 'pectoraux':
      return <Dumbbell className="h-8 w-8 text-white" />;
    case 'dos':
      return <Target className="h-8 w-8 text-white" />;
    case 'jambes':
      return <Shield className="h-8 w-8 text-white" />;
    case 'abdos':
      return <Apple className="h-8 w-8 text-white" />;
    case 'biceps':
      return <Dumbbell className="h-8 w-8 text-white" />;
    case 'triceps':
      return <Zap className="h-8 w-8 text-white" />;
    case 'épaules':
      return <Activity className="h-8 w-8 text-white" />;
    case 'cardio':
      return <Heart className="h-8 w-8 text-white" />;
    default:
      return <Dumbbell className="h-8 w-8 text-white" />;
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
  addCompleteExerciseToWorkout,
  removeExerciseFromWorkout,
  onSaveTemplate,
  user,
  className = '',
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');

  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [customFeeling, setCustomFeeling] = useState('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Hook pour la reconnaissance vocale
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    parseExerciseFromSpeech,
    parseWorkoutDataFromSpeech,
    getMuscleGroupFromExercise
  } = useSpeechRecognition();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [parsedExercise, setParsedExercise] = useState(null);
  
  // États pour la reconnaissance vocale des données d'entraînement
  const [showVoiceDataModal, setShowVoiceDataModal] = useState(false);
  const [voiceDataTranscript, setVoiceDataTranscript] = useState('');
  const [parsedWorkoutData, setParsedWorkoutData] = useState(null);
  const [selectedExerciseForVoiceData, setSelectedExerciseForVoiceData] = useState(null);


  // Options de ressentis prédéfinis
  const feelingOptions = [
    {
      value: 'easy',
      label: t('feeling_easy'),
      icon: <span className="text-3xl">😊</span>,
      color: 'green',
    },
    {
      value: 'medium',
      label: t('feeling_medium'),
      icon: <span className="text-3xl">😐</span>,
      color: 'yellow',
    },
    {
      value: 'hard',
      label: t('feeling_hard'),
      icon: <span className="text-3xl">😔</span>,
      color: 'red',
    },
    {
      value: 'weak',
      label: t('feeling_weak'),
      icon: <span className="text-3xl">😞</span>,
      color: 'orange',
    },
    {
      value: 'strong',
      label: t('feeling_strong'),
      icon: <span className="text-3xl">💪</span>,
      color: 'green',
    },
    {
      value: 'tired',
      label: t('feeling_tired'),
      icon: <span className="text-3xl">😴</span>,
      color: 'gray',
    },
    {
      value: 'energized',
      label: t('feeling_energized'),
      icon: <span className="text-3xl">⚡</span>,
      color: 'blue',
    },
    {
      value: 'motivated',
      label: t('feeling_motivated'),
      icon: <span className="text-3xl">🔥</span>,
      color: 'blue',
    },
    {
      value: 'demotivated',
      label: t('feeling_demotivated'),
      icon: <span className="text-3xl">😕</span>,
      color: 'gray',
    },
    {
      value: 'great',
      label: t('feeling_great'),
      icon: <span className="text-3xl">🎉</span>,
      color: 'green',
    },
    {
      value: 'good',
      label: t('feeling_good'),
      icon: <span className="text-3xl">👍</span>,
      color: 'blue',
    },
    {
      value: 'ok',
      label: t('feeling_ok'),
      icon: <span className="text-3xl">🤷</span>,
      color: 'yellow',
    },
    {
      value: 'bad',
      label: t('feeling_bad'),
      icon: <span className="text-3xl">😟</span>,
      color: 'orange',
    },
    {
      value: 'terrible',
      label: t('feeling_terrible'),
      icon: <span className="text-3xl">😭</span>,
      color: 'red',
    },
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
      await onSaveTemplate(
        exercises,
        templateName.trim(),
        templateDescription.trim()
      );
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
    
    // Sauvegarder la séance
    saveWorkout(feeling);
    
    // Fermer la modal de ressenti
    setShowFeelingModal(false);
    setSelectedFeeling('');
    setCustomFeeling('');
  };

  // Fonction pour obtenir le dernier poids d'un exercice
  const getLastWeightFor = useCallback(
    (name) => getLastExerciseWeight(workouts || [], name, selectedDate),
    [workouts, selectedDate]
  );

  // Fonctions pour la reconnaissance vocale
  const handleStartVoiceRecognition = useCallback(() => {
    if (!isSupported) {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    setShowVoiceModal(true);
    setVoiceTranscript('');
    setParsedExercise(null);

    startListening(
      (text, isFinal) => {
        setVoiceTranscript(text);
        // Toujours parser le texte pour un affichage en temps réel
        if (text.trim()) {
          const parsed = parseExerciseFromSpeech(text);
          setParsedExercise(parsed);
          
          // Vérifier aussi s'il y a des données d'entraînement dans le texte
          const workoutData = parseWorkoutDataFromSpeech(text);
          if (workoutData.found) {
            // Stocker les données d'entraînement avec l'exercice parsé
            setParsedExercise(prev => ({
              ...prev,
              workoutData: workoutData
            }));
          }
        } else {
          // Si le texte est vide, vider l'exercice parsé
          setParsedExercise(null);
        }
      },
      (finalText) => {
        if (finalText.trim()) {
          const parsed = parseExerciseFromSpeech(finalText);
          
          // Vérifier aussi s'il y a des données d'entraînement dans le texte final
          const workoutData = parseWorkoutDataFromSpeech(finalText);
          if (workoutData.found) {
            parsed.workoutData = workoutData;
          }
          
          setParsedExercise(parsed);
        }
      }
    );
  }, [isSupported, startListening, parseExerciseFromSpeech, parseWorkoutDataFromSpeech]);

  const handleStopVoiceRecognition = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const handleConfirmVoiceExercise = useCallback(() => {
    if (parsedExercise && parsedExercise.name) {
      const muscleGroup = getMuscleGroupFromExercise(parsedExercise.name);
      
      // Stocker les données d'entraînement avant d'ajouter l'exercice
      const workoutData = parsedExercise.workoutData;
      
      
      // Ajouter l'exercice
      const newExerciseId = addExerciseToWorkout(parsedExercise.name, muscleGroup);
      
      
      // Si des données d'entraînement ont été détectées, les appliquer immédiatement
      if (workoutData && workoutData.found) {

        
        // Utiliser plusieurs timeouts pour s'assurer que l'exercice est bien ajouté
        setTimeout(() => {
          if (workoutData.sets && workoutData.sets > 0) {

            
            // D'abord, remplir la première série (qui existe déjà)
            setTimeout(() => {
              if (workoutData.reps) {
  
                updateSet(newExerciseId, 0, 'reps', workoutData.reps);
              }
              if (workoutData.weight) {

                updateSet(newExerciseId, 0, 'weight', workoutData.weight);
              }
            }, 100);
            
            // Ensuite, ajouter les séries supplémentaires (workoutData.sets - 1)
            for (let i = 1; i < workoutData.sets; i++) {
              setTimeout(() => {
  
                addSet(newExerciseId);
                
                // Remplir les données de cette série
                setTimeout(() => {
                  if (workoutData.reps) {
  
                    updateSet(newExerciseId, i, 'reps', workoutData.reps);
                  }
                  if (workoutData.weight) {

                    updateSet(newExerciseId, i, 'weight', workoutData.weight);
                  }
                }, 100);
              }, i * 100);
            }
          } else {
            // Si pas de séries spécifiées, utiliser la série par défaut et remplir les données

            
            setTimeout(() => {
              if (workoutData.reps) {

                updateSet(newExerciseId, 0, 'reps', workoutData.reps);
              }
              if (workoutData.weight) {

                updateSet(newExerciseId, 0, 'weight', workoutData.weight);
              }
            }, 200);
          }
        }, 300);
      }
      
      setShowVoiceModal(false);
      setVoiceTranscript('');
      setParsedExercise(null);
    }
  }, [parsedExercise, getMuscleGroupFromExercise, addExerciseToWorkout, addSet, updateSet]);

  const handleCancelVoiceRecognition = useCallback(() => {
    stopListening();
    setShowVoiceModal(false);
    setVoiceTranscript('');
    setParsedExercise(null);
  }, [stopListening]);

  // Fonctions pour la reconnaissance vocale des données d'entraînement
  const handleStartVoiceDataRecognition = useCallback((exercise) => {
    if (!isSupported) {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur');
      return;
    }

    setSelectedExerciseForVoiceData(exercise);
    setShowVoiceDataModal(true);
    setVoiceDataTranscript('');
    setParsedWorkoutData(null);

    startListening(
      (text, isFinal) => {
        setVoiceDataTranscript(text);
        if (text.trim()) {
          const parsed = parseWorkoutDataFromSpeech(text);
          setParsedWorkoutData(parsed);
        } else {
          setParsedWorkoutData(null);
        }
      },
      (finalText) => {
        if (finalText.trim()) {
          const parsed = parseWorkoutDataFromSpeech(finalText);
          setParsedWorkoutData(parsed);
        }
      }
    );
  }, [isSupported, startListening, parseWorkoutDataFromSpeech]);

  const handleConfirmVoiceWorkoutData = useCallback(() => {
    if (parsedWorkoutData && parsedWorkoutData.found && selectedExerciseForVoiceData) {
      const exercise = selectedExerciseForVoiceData;
      
      // Si des séries sont spécifiées, ajouter le bon nombre de séries
      if (parsedWorkoutData.sets && parsedWorkoutData.sets > 0) {
        // Supprimer les séries existantes pour cet exercice
        while (exercise.sets.length > 0) {
          removeSet(exercise.id, 0);
        }
        
        // Ajouter le nombre correct de séries
        for (let i = 0; i < parsedWorkoutData.sets; i++) {
          addSet(exercise.id);
          
          // Attendre que la série soit ajoutée avant de remplir les données
          setTimeout(() => {
            if (parsedWorkoutData.reps) {
              updateSet(exercise.id, i, 'reps', parsedWorkoutData.reps);
            }
            if (parsedWorkoutData.weight) {
              updateSet(exercise.id, i, 'weight', parsedWorkoutData.weight);
            }
          }, 50 * (i + 1));
        }
      } else {
        // Si pas de séries spécifiées, modifier la première série ou en créer une
        if (exercise.sets.length === 0) {
          addSet(exercise.id);
        }
        
        setTimeout(() => {
          if (parsedWorkoutData.reps) {
            updateSet(exercise.id, 0, 'reps', parsedWorkoutData.reps);
          }
          if (parsedWorkoutData.weight) {
            updateSet(exercise.id, 0, 'weight', parsedWorkoutData.weight);
          }
        }, 100);
      }
      
      setShowVoiceDataModal(false);
      setVoiceDataTranscript('');
      setParsedWorkoutData(null);
      setSelectedExerciseForVoiceData(null);
    }
  }, [parsedWorkoutData, selectedExerciseForVoiceData, addSet, removeSet, updateSet]);

  const handleCancelVoiceDataRecognition = useCallback(() => {
    stopListening();
    setShowVoiceDataModal(false);
    setVoiceDataTranscript('');
    setParsedWorkoutData(null);
    setSelectedExerciseForVoiceData(null);
  }, [stopListening]);



  // Filtrage dynamique des exercices selon la recherche
  const filteredExercises = useMemo(
    () =>
      selectedMuscleGroup && searchTerm.trim()
        ? exerciseDatabase[selectedMuscleGroup].filter((ex) =>
            ex.toLowerCase().includes(searchTerm.trim().toLowerCase())
          )
        : selectedMuscleGroup
          ? exerciseDatabase[selectedMuscleGroup]
          : [],
    [selectedMuscleGroup, searchTerm]
  );



  return (
    <div className={`p-6 space-y-8 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            {t('new_workout')}
          </h2>
          <p className="text-gray-600 mt-1">{t('create_program')}</p>
        </div>
        <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-md border border-gray-100">
          <Calendar className="h-5 w-5 text-blue-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-0 outline-none font-medium text-gray-700"
          />
        </div>
      </div>

      {exercises.length === 0 ? (
        <Card
          className="workout-main text-center py-6 sm:py-10 w-full max-w-[340px] sm:max-w-[400px] mx-auto overflow-visible"
          style={{ boxSizing: 'border-box' }}
        >

          <h3 className="section-title text-2xl mb-2 break-words overflow-wrap break-word truncate max-w-full">
            {t('ready_to_train')}
          </h3>
          <p className="text-secondary mb-6 max-w-[90%] mx-auto break-words overflow-wrap break-word truncate max-w-full">
            {t('start_workout')}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <ConicGradientButton
              icon={Plus}
              onClick={() => setShowAddExercise(true)}
              variant="primary"
              size="sm"
              className="min-w-[140px]"
            >
              {t('add_exercise')}
            </ConicGradientButton>
            
            {isSupported && (
              <ConicGradientButton
                icon={Mic}
                onClick={handleStartVoiceRecognition}
                variant="secondary"
                size="sm"
                className="min-w-[140px]"
              >
                Ajouter vocal
              </ConicGradientButton>
            )}

          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="card p-6 hover-lift"
              clickable={true}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start space-x-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      exercise.type === 'cardio'
                        ? 'icon-warning'
                        : 'icon-primary'
                    }`}
                  >
                    {exercise.type === 'cardio' ? (
                      <Heart className="h-5 w-5" />
                    ) : (
                      <Dumbbell className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-2">
                      {exercise.name}
                    </h3>
                    {exercise.type !== 'cardio' &&
                      getLastWeightFor(exercise.name) !== null && (
                        <p className="text-xs text-tertiary mb-3">
                          Dernier poids : {getLastWeightFor(exercise.name)} kg
                        </p>
                      )}
                    <span
                      className={`status-badge text-sm font-medium px-3 py-1 rounded-full ${
                        exercise.type === 'cardio'
                          ? 'badge-warning'
                          : exercise.type === 'custom'
                            ? 'badge'
                            : 'badge-success'
                      }`}
                    >
                      {exercise.type === 'cardio'
                        ? 'Cardio'
                        : exercise.type === 'custom'
                          ? 'Personnalisé'
                          : exercise.type
                            ? t(exercise.type)
                            : 'Musculation'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {isSupported && exercise.type !== 'cardio' && (
                    <button
                      onClick={() => handleStartVoiceDataRecognition(exercise)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md w-7 h-7 flex items-center justify-center"
                      title="Ajouter données par la voix"
                    >
                      <Mic className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => removeExerciseFromWorkout(exercise.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md w-7 h-7 flex items-center justify-center"
                    title="Supprimer l'exercice"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Prédiction IA en pleine largeur */}
              {exercise.type !== 'cardio' && (
                <div className="mb-6">
                  <MLWeightPrediction
                    exerciseName={exercise.name}
                    workouts={workouts}
                    currentWeight={getLastWeightFor(exercise.name)}
                    onWeightSuggestion={(suggestedWeight) => {
                      // Appliquer le poids suggéré au premier set vide ou créer un nouveau set
                      if (exercise.sets && exercise.sets.length > 0) {
                        const emptySetIndex = exercise.sets.findIndex(set => !set.weight || set.weight === 0);
                        if (emptySetIndex !== -1) {
                          updateSet(exercise.id, emptySetIndex, 'weight', suggestedWeight);
                        } else {
                          // Ajouter un nouveau set avec le poids suggéré
                          addSet(exercise.id);
                          setTimeout(() => {
                            const newSetIndex = exercise.sets.length;
                            updateSet(exercise.id, newSetIndex, 'weight', suggestedWeight);
                          }, 100);
                        }
                      }
                    }}
                  />
                </div>
              )}

              <div className="space-y-3">
                <div
                  className={`grid gap-3 text-sm font-semibold text-gray-600 pb-2 border-b border-gray-200 ${
                    exercise.type === 'cardio' ? 'grid-cols-4' : 'grid-cols-5'
                  }`}
                >
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
                  <div
                    key={setIndex}
                    className={`grid gap-3 items-center ${
                      exercise.type === 'cardio' ? 'grid-cols-4' : 'grid-cols-5'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-lg px-3 py-2 text-center">
                      {setIndex + 1}
                    </span>
                    {exercise.type === 'cardio' ? (
                      <>
                        <input
                          type="number"
                          value={set.duration}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              'duration',
                              e.target.value
                            )
                          }
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-red-500 focus:outline-none transition-colors duration-200"
                          min="0"
                          placeholder="20"
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              'reps',
                              e.target.value
                            )
                          }
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-red-500 focus:outline-none transition-colors duration-200"
                          min="1"
                          max="10"
                          placeholder="7"
                        />
                        <span className="text-sm font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">
                          {Math.round(
                            (set.duration || 0) * (set.reps || 5) * 8
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              'reps',
                              e.target.value
                            )
                          }
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          min="0"
                          placeholder="12"
                        />
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) =>
                            updateSet(
                              exercise.id,
                              setIndex,
                              'weight',
                              e.target.value
                            )
                          }
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          min="0"
                          step="0.25"
                          placeholder="50"
                        />
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg px-3 py-2 text-center">
                          {set.reps * set.weight} kg
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => addSet(exercise.id)}
                            className="bg-green-500 hover:bg-green-600 text-white p-0.5 rounded transition-all duration-200 shadow-sm hover:shadow-md w-6 h-6 flex items-center justify-center"
                            title="Ajouter une série"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                          <button
                            onClick={() => removeSet(exercise.id, setIndex)}
                            className="bg-red-500 hover:bg-red-600 text-white p-0.5 rounded transition-all duration-200 shadow-sm hover:shadow-md w-6 h-6 flex items-center justify-center"
                            title="Supprimer la série"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <div className="space-y-3 mt-4">
            {/* Première ligne : Ajouter exercice + Ajouter vocal + Vider séance */}
            <div className="flex gap-2 justify-center flex-wrap">
              <ConicGradientButton
                icon={Plus}
                onClick={() => setShowAddExercise(true)}
                variant="primary"
                size="sm"
                className="flex-1 max-w-[160px] min-w-[140px]"
              >
                {t('add_exercise')}
              </ConicGradientButton>
              
              {isSupported && (
                <ConicGradientButton
                  icon={Mic}
                  onClick={handleStartVoiceRecognition}
                  variant="secondary"
                  size="sm"
                  className="flex-1 max-w-[160px] min-w-[140px]"
                >
                  Ajouter vocal
                </ConicGradientButton>
              )}

              
              {exercises.length > 0 && (
                <ConicGradientButton
                  icon={X}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Supprimer tous les exercices de cette séance ?'
                      )
                    ) {
                      exercises.forEach((exercise) =>
                        removeExerciseFromWorkout(exercise.id)
                      );
                    }
                  }}
                  variant="danger"
                  size="sm"
                  className="flex-1 max-w-[160px] min-w-[140px]"
                >
                  Vider séance
                </ConicGradientButton>
              )}
            </div>

            {/* Deuxième ligne : Template + Terminer séance */}
            {exercises.length > 0 && (
              <div className="flex gap-2 justify-center">
                <ConicGradientButton
                  icon={Bookmark}
                  onClick={() => setShowSaveTemplateModal(true)}
                  variant="secondary"
                  size="sm"
                  className="flex-1 max-w-[160px] min-w-[140px]"
                >
                  Template
                </ConicGradientButton>
                <ConicGradientButton
                  icon={Target}
                  onClick={handleSaveWorkout}
                  variant="primary"
                  size="sm"
                  className="flex-1 max-w-[160px] min-w-[140px]"
                >
                  {t('finish_workout')}
                </ConicGradientButton>
              </div>
            )}

            {/* Si pas d'exercices, afficher seulement Terminer séance */}
            {exercises.length === 0 && (
              <div className="flex justify-center">
                <ConicGradientButton
                  icon={Target}
                  onClick={handleSaveWorkout}
                  variant="primary"
                  size="sm"
                  className="max-w-[160px] min-w-[140px]"
                >
                  {t('finish_workout')}
                </ConicGradientButton>
              </div>
            )}
          </div>

          <Card className="card">
            <div className="flex items-center space-x-3 mb-4">
              <div className="icon-primary p-2 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h3 className="section-title text-lg">
                Heure de la séance
              </h3>
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
                  className={`btn-secondary ripple-effect p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    startTime === '06:00' && endTime === '07:00'
                      ? 'btn-primary'
                      : ''
                  }`}
                >
                  🌅 Matin
                  <br />
                  6h-7h
                </button>
                <button
                  onClick={() => {
                    setStartTime('12:00');
                    setEndTime('13:00');
                  }}
                  className={`btn-secondary ripple-effect p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    startTime === '12:00' && endTime === '13:00'
                      ? 'btn-primary'
                      : ''
                  }`}
                >
                  ☀️ Midi
                  <br />
                  12h-13h
                </button>
                <button
                  onClick={() => {
                    setStartTime('18:00');
                    setEndTime('19:00');
                  }}
                  className={`btn-secondary ripple-effect p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    startTime === '18:00' && endTime === '19:00'
                      ? 'btn-primary'
                      : ''
                  }`}
                >
                  🌆 Soir
                  <br />
                  18h-19h
                </button>
                <button
                  onClick={() => {
                    setStartTime('20:00');
                    setEndTime('21:00');
                  }}
                  className={`btn-secondary ripple-effect p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    startTime === '20:00' && endTime === '21:00'
                      ? 'btn-primary'
                      : ''
                  }`}
                >
                  🌙 Soirée
                  <br />
                  20h-21h
                </button>
              </div>

              {/* Sélecteur personnalisé */}
              <div className="flex items-center space-x-4">
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium text-secondary mb-2">
                    Début
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input px-4 py-3 text-center font-semibold"
                    step="60"
                  />
                </div>

                <div className="text-gray-700 font-medium text-2xl mt-6">→</div>

                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium text-secondary mb-2">
                    Fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input px-4 py-3 text-center font-semibold"
                    step="60"
                  />
                </div>
              </div>

              {/* Durées prédéfinies */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-secondary mr-2">
                  Durées rapides:
                </span>
                {[30, 45, 60, 90].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => {
                      if (startTime) {
                        const start = new Date(`2000-01-01T${startTime}`);
                        const end = new Date(
                          start.getTime() + minutes * 60 * 1000
                        );
                        setEndTime(end.toTimeString().slice(0, 5));
                      }
                    }}
                    className="btn-secondary ripple-effect px-3 py-1 rounded-lg text-sm"
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
                      ⏱️ Durée :{' '}
                      {(() => {
                        const start = new Date(`2000-01-01T${startTime}`);
                        const end = new Date(`2000-01-01T${endTime}`);
                        const duration = Math.round(
                          (end - start) / (1000 * 60)
                        );
                        return duration > 0
                          ? `${duration} minutes`
                          : 'Heure de fin invalide';
                      })()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {(() => {
                        const hour = parseInt(startTime.split(':')[0]);
                        if (hour >= 5 && hour < 12) return '🌅 Séance du matin';
                        if (hour >= 12 && hour < 18)
                          return "☀️ Séance de l'après-midi";
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

      <Modal
        isOpen={showAddExercise}
        onClose={() => {
          setShowAddExercise(false);
          setSelectedMuscleGroup(null);
        }}
        maxWidth="max-w-2xl"
        className="lg:max-w-3xl xl:max-w-4xl"
      >
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
            <h3 className="text-2xl font-bold text-gray-800">
              {selectedMuscleGroup
                ? `💪 ${selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1)}`
                : t('choose_muscle_group')}
            </h3>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pr-2">
          {!selectedMuscleGroup ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {Object.entries(exerciseDatabase).map(
                ([muscle, exerciseList]) => (
                  <button
                    key={muscle}
                    onClick={() => setSelectedMuscleGroup(muscle)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/30 hover:border-blue-300/50 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  >
                                          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                        <div
                          className={`p-3 sm:p-4 rounded-2xl ${muscle === 'cardio' ? 'bg-red-500/20 backdrop-blur-sm' : 'bg-blue-500/20 backdrop-blur-sm'} shadow-lg`}
                        >
                          {getMuscleIcon(muscle)}
                        </div>
                        <div className="text-center">
                          <h4 className="font-bold text-gray-800 capitalize text-lg sm:text-xl mb-1 sm:mb-2">
                            {t(muscle)}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {exerciseList.length} exercices
                          </p>
                        </div>
                      </div>
                  </button>
                )
              )}
            </div>
          ) : (
            <>
              {/* Champ de recherche d'exercice */}
              <div className="flex flex-col items-center mb-4 w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('search_exercise')}
                  className="border-2 border-gray-200/50 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 w-full max-w-md text-center font-medium focus:border-blue-400 focus:outline-none transition-colors duration-200 shadow-sm"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-1 gap-4 mb-6 max-h-[60vh] overflow-y-auto flex-1 w-full">
                {filteredExercises.length === 0 ? (
                  <div className="col-span-2 sm:col-span-3 text-center text-gray-400 py-8">
                    {t('no_exercise_found')}
                  </div>
                ) : (
                  <>
                    {filteredExercises.map((exercise) => (
                      <div key={exercise} className="relative">
                        <button
                          onClick={() =>
                            addExerciseToWorkout(exercise, selectedMuscleGroup)
                          }
                          className="w-full text-left p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl font-medium text-gray-700 transition-all duration-200 border border-gray-200/30 hover:border-blue-300/50 hover:shadow-md transform hover:scale-[1.02]"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${selectedMuscleGroup === 'cardio' ? 'bg-red-100/50 text-red-600' : 'bg-blue-100/50 text-blue-600'}`}
                            >
                              {selectedMuscleGroup === 'cardio' ? (
                                <Heart className="h-4 w-4" />
                              ) : (
                                <Dumbbell className="h-4 w-4" />
                              )}
                            </div>
                            <span className="flex-1 text-center text-base font-medium break-words leading-tight max-h-[2.5em] overflow-hidden">
                              {t(exercise)}
                            </span>
                            <span className="text-gray-400">→</span>
                          </div>
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
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  placeholder={t('custom_exercise_name')}
                  className="border-2 border-blue-200/50 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 w-full max-w-md text-center font-semibold focus:border-blue-400 focus:outline-none transition-colors duration-200 shadow-sm"
                />
                <ConicGradientButton
                  onClick={() => {
                    if (customExerciseName.trim()) {
                      // Passer l'exercice avec sa catégorie musculaire
                      addExerciseToWorkout(
                        customExerciseName.trim(),
                        selectedMuscleGroup
                      );
                      setCustomExerciseName('');
                      setShowAddExercise(false);
                      setSelectedMuscleGroup(null);
                    }
                  }}
                  variant="primary"
                  className="w-full max-w-md"
                >
                  {t('add')}
                </ConicGradientButton>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de ressenti */}
      <Modal
        isOpen={showFeelingModal}
        onClose={() => setShowFeelingModal(false)}
      >
        <div className="flex flex-col items-center justify-center gap-6 p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {t('workout_feeling')}
            </h3>
            <p className="text-gray-600">
              Partagez vos ressentis après cette séance
            </p>
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
                    ? 'bg-blue-500/20 backdrop-blur-sm text-blue-700 border border-blue-300/50 shadow-lg transform scale-105'
                    : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-gray-200/30 hover:border-blue-300/50'
                }`}
              >
                <div
                  className={`p-3 rounded-full mb-2 ${
                    selectedFeeling === feeling.value
                      ? 'bg-white/20'
                      : `bg-${feeling.color}-100 text-${feeling.color}-600 shadow-sm`
                  }`}
                >
                  {feeling.icon}
                </div>
                <span
                  className={`text-xs font-medium ${
                    selectedFeeling === feeling.value
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
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
                    ? 'bg-blue-500/20 backdrop-blur-sm text-blue-700 border border-blue-300/50'
                    : 'bg-gray-100/50 backdrop-blur-sm hover:bg-gray-200/50 text-gray-700 border border-gray-200/30'
                }`}
              >
                <span className="text-sm font-medium">
                  💭 Ressenti personnalisé
                </span>
              </button>
            </div>

            {selectedFeeling === 'custom' && (
              <input
                type="text"
                value={customFeeling}
                onChange={(e) => setCustomFeeling(e.target.value)}
                placeholder={t('feeling_placeholder')}
                className="border-2 border-blue-200/50 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 w-full text-center font-medium focus:border-blue-400 focus:outline-none transition-colors duration-200 shadow-sm"
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
              className="flex-1 bg-blue-500/20 backdrop-blur-sm hover:bg-blue-500/30 text-blue-700 border border-blue-300/50 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t('finish_workout')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal sauvegarder en template */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-auto p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Sauvegarder en template
              </h3>
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
                  className="w-full border-2 border-gray-200/50 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 focus:border-blue-400 focus:outline-none"
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
                  className="w-full border-2 border-gray-200/50 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 focus:border-blue-400 focus:outline-none"
                  placeholder="Description du template..."
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-blue-800">
                  <Star className="h-4 w-4" />
                  <span>
                    Cette séance contient {exercises.length} exercices
                  </span>
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
                className="flex-1 bg-blue-500/20 backdrop-blur-sm hover:bg-blue-500/30 text-blue-700 border border-blue-300/50 px-4 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de reconnaissance vocale */}
      <Modal
        isOpen={showVoiceModal}
        onClose={handleCancelVoiceRecognition}
        maxWidth="max-w-lg"
      >
        <div className="flex flex-col items-center justify-center gap-6 p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent mb-2">
              🎤 Ajouter un exercice par la voix
            </h3>
            <p className="text-gray-300">
              Dites le nom de l'exercice (+ optionnel : séries, reps, poids)
            </p>
            <p className="text-sm text-gray-400">
              Ex: "développé couché 4 séries de 12 reps à 50 kg"
            </p>
          </div>

          {/* Statut de l'écoute */}
          <div className="w-full text-center">
            {isListening ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 border-4 border-red-300 rounded-full animate-ping"></div>
                </div>
                <p className="text-red-400 font-medium">🔴 Écoute en cours...</p>
                <p className="text-sm text-gray-400">
                  Essayez: "développé couché 4 séries de 12 reps à 50 kg"
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <MicOff className="h-8 w-8 text-white" />
                </div>
                <p className="text-emerald-400 font-medium">⏸️ En attente</p>
              </div>
            )}
          </div>

          {/* Transcript en temps réel */}
          {voiceTranscript && (
            <div className="w-full p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <p className="text-sm text-gray-300 mb-2">Texte reconnu :</p>
              <p className="font-semibold text-gray-100 text-base">"{voiceTranscript}"</p>
            </div>
          )}

          {/* Exercice parsé */}
          {parsedExercise && (
            <div className={`w-full p-4 rounded-xl ${
              parsedExercise.found 
                ? 'bg-emerald-900/20 border border-emerald-500/30' 
                : 'bg-yellow-900/20 border border-yellow-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {parsedExercise.found ? (
                  <>
                    <span className="text-emerald-400">✅</span>
                    <p className="text-sm text-emerald-300 font-medium">Exercice reconnu :</p>
                  </>
                ) : (
                  <>
                    <span className="text-yellow-400">⚠️</span>
                    <p className="text-sm text-yellow-300 font-medium">Exercice personnalisé :</p>
                  </>
                )}
              </div>
              <p className="font-bold text-gray-100 text-lg">{parsedExercise.name}</p>
              <p className="text-xs text-gray-300 mt-1">
                Groupe musculaire : {getMuscleGroupFromExercise(parsedExercise.name)}
              </p>
              
              {/* Afficher les données d'entraînement si détectées */}
              {parsedExercise.workoutData && parsedExercise.workoutData.found && (
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                  <p className="text-sm text-emerald-300 font-medium mb-2">🎯 Données détectées :</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {parsedExercise.workoutData.sets && (
                      <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-500/30">
                        <p className="text-xs text-blue-300">Séries</p>
                        <p className="text-sm font-bold text-blue-100">{parsedExercise.workoutData.sets}</p>
                      </div>
                    )}
                    {parsedExercise.workoutData.reps && (
                      <div className="bg-purple-900/20 rounded-lg p-2 border border-purple-500/30">
                        <p className="text-xs text-purple-300">Répétitions</p>
                        <p className="text-sm font-bold text-purple-100">{parsedExercise.workoutData.reps}</p>
                      </div>
                    )}
                    {parsedExercise.workoutData.weight && (
                      <div className="bg-orange-900/20 rounded-lg p-2 border border-orange-500/30">
                        <p className="text-xs text-orange-300">Poids (kg)</p>
                        <p className="text-sm font-bold text-orange-100">{parsedExercise.workoutData.weight}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleCancelVoiceRecognition}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded-xl font-medium transition-colors duration-200 border border-gray-600/50"
            >
              Annuler
            </button>
            
            {isListening ? (
              <button
                onClick={handleStopVoiceRecognition}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 border border-red-500/50"
              >
                <MicOff className="h-5 w-5 inline mr-2" />
                Arrêter
              </button>
            ) : parsedExercise ? (
              <button
                onClick={handleConfirmVoiceExercise}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 border border-emerald-500/50"
              >
                ✅ Ajouter l'exercice
              </button>
            ) : (
              <button
                onClick={() => {
                  // Réinitialiser les états avant de commencer
                  setVoiceTranscript('');
                  setParsedExercise(null);
                  handleStartVoiceRecognition();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 border border-emerald-500/50"
              >
                <Mic className="h-5 w-5 inline mr-2" />
                Commencer
              </button>
            )}
          </div>

          {/* Aide */}
          <div className="w-full text-center text-xs text-gray-400 border-t border-gray-700/50 pt-4">
            <p>💡 <strong>Astuce :</strong> Parlez clairement et attendez quelques secondes après avoir dit le nom de l'exercice</p>
            <p className="mt-1">🔊 Assurez-vous que votre microphone est autorisé pour ce site</p>
          </div>
        </div>
      </Modal>

      {/* Modal de reconnaissance vocale pour les données d'entraînement */}
      <Modal
        isOpen={showVoiceDataModal}
        onClose={handleCancelVoiceDataRecognition}
        maxWidth="max-w-lg"
      >
        <div className="flex flex-col items-center justify-center gap-6 p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent mb-2">
              🎤 Ajouter les données par la voix
            </h3>
            <p className="text-gray-300 mb-2">
              Dites les séries, répétitions et/ou poids pour{' '}
              <span className="font-semibold text-emerald-400">
                {selectedExerciseForVoiceData?.name}
              </span>
            </p>
            <p className="text-sm text-gray-400">
              Dites par exemple : "3 séries de 12 répétitions à 50 kg"
            </p>
          </div>

          {/* Statut de l'écoute */}
          <div className="w-full text-center">
            {isListening ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 border-4 border-red-300 rounded-full animate-ping"></div>
                </div>
                <p className="text-red-400 font-medium">🔴 Écoute en cours...</p>
                <div className="bg-red-900/20 rounded-xl p-3 border border-red-500/30 max-w-xs">
                  <p className="text-red-300 text-sm font-medium">Essayez de dire :</p>
                  <p className="text-red-100 text-xs mt-1">"3 séries de 12 répétitions à 50 kg"</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <MicOff className="h-8 w-8 text-white" />
                </div>
                <p className="text-emerald-400 font-medium">⏸️ En attente</p>
                <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/30 max-w-xs">
                  <p className="text-emerald-300 text-sm font-medium mb-2">💬 Phrases d'exemple :</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-emerald-100 bg-emerald-800/20 rounded px-2 py-1">"4 séries de 10 répétitions à 60 kg"</p>
                    <p className="text-emerald-100 bg-emerald-800/20 rounded px-2 py-1">"15 répétitions à 80 kilos"</p>
                    <p className="text-emerald-100 bg-emerald-800/20 rounded px-2 py-1">"3 séries de 12 répétitions"</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transcript en temps réel */}
          {voiceDataTranscript && (
            <div className="w-full p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <p className="text-sm text-gray-300 mb-2">Texte reconnu :</p>
              <p className="font-semibold text-gray-100 text-base">"{voiceDataTranscript}"</p>
            </div>
          )}

          {/* Données parsées */}
          {parsedWorkoutData && parsedWorkoutData.found && (
            <div className="w-full p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-400">✅</span>
                <p className="text-sm text-emerald-300 font-medium">Données reconnues :</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                {parsedWorkoutData.sets && (
                  <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                    <p className="text-xs text-blue-300 mb-1">Séries</p>
                    <p className="text-lg font-bold text-blue-100">{parsedWorkoutData.sets}</p>
                  </div>
                )}
                {parsedWorkoutData.reps && (
                  <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/30">
                    <p className="text-xs text-purple-300 mb-1">Répétitions</p>
                    <p className="text-lg font-bold text-purple-100">{parsedWorkoutData.reps}</p>
                  </div>
                )}
                {parsedWorkoutData.weight && (
                  <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/30">
                    <p className="text-xs text-orange-300 mb-1">Poids (kg)</p>
                    <p className="text-lg font-bold text-orange-100">{parsedWorkoutData.weight}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleCancelVoiceDataRecognition}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-3 rounded-xl font-medium transition-colors duration-200 border border-gray-600/50"
            >
              Annuler
            </button>
            
            {isListening ? (
              <button
                onClick={() => stopListening()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 border border-red-500/50"
              >
                <MicOff className="h-5 w-5 inline mr-2" />
                Arrêter
              </button>
            ) : parsedWorkoutData && parsedWorkoutData.found ? (
              <button
                onClick={handleConfirmVoiceWorkoutData}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 border border-emerald-500/50"
              >
                ✅ Appliquer les données
              </button>
            ) : (
              <button
                onClick={() => {
                  setVoiceDataTranscript('');
                  setParsedWorkoutData(null);
                  handleStartVoiceDataRecognition(selectedExerciseForVoiceData);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 border border-emerald-500/50"
              >
                <Mic className="h-5 w-5 inline mr-2" />
                Commencer
              </button>
            )}
          </div>

          {/* Aide et exemples détaillés */}
          <div className="w-full text-center text-xs text-gray-400 border-t border-gray-700/50 pt-4">
            <p>💡 <strong>Exemples de phrases qui fonctionnent :</strong></p>
            <div className="mt-2 space-y-1 text-left max-w-sm mx-auto">
              <p className="bg-gray-800/30 rounded px-2 py-1">🗣️ "3 séries de 12 répétitions à 50 kg"</p>
              <p className="bg-gray-800/30 rounded px-2 py-1">🗣️ "12 répétitions à 75 kilos"</p>
              <p className="bg-gray-800/30 rounded px-2 py-1">🗣️ "4 séries de 15 répétitions"</p>
              <p className="bg-gray-800/30 rounded px-2 py-1">🗣️ "60 kg pour 10 répétitions"</p>
              <p className="bg-gray-800/30 rounded px-2 py-1">🗣️ "5 séries" (séries seulement)</p>
              <p className="bg-gray-800/30 rounded px-2 py-1">🗣️ "20 répétitions" (répétitions seulement)</p>
              <p className="bg-gray-800/30 rounded px-2 py-1">🗣️ "80 kg" (poids seulement)</p>
            </div>
            <p className="mt-3 text-yellow-400">⚠️ <strong>Parlez clairement et attendez 2-3 secondes</strong></p>
          </div>
        </div>
      </Modal>

      {/* Encart explicatif du Coach IA */}
      <div className="flex justify-center">
        <LexIA className="mt-8" />
      </div>


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
  addCompleteExerciseToWorkout: PropTypes.func,
  removeExerciseFromWorkout: PropTypes.func,
  onSaveTemplate: PropTypes.func,
  user: PropTypes.object, // Added user prop type
  className: PropTypes.string,
};

export default memo(WorkoutList);


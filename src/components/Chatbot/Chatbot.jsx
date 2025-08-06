import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useChatGPT from '../../hooks/useChatGPTRefactored';
import MonitoringDashboard from './MonitoringDashboard';
import KnowledgeBaseManager from './KnowledgeBaseManager';
import ChatbotDashboard from './ChatbotDashboard';
import RecommendationsMenu from './RecommendationsMenu';
import {
  getMuscleGroupDistribution,
  getWorkoutWeightDetails,
  getWorkoutSetRepDetails,
} from '../../utils/workout/workoutUtils';
import { exerciseDatabase } from '../../utils/workout/exerciseDatabase';

const SESSION_TYPES = [
  { value: 'fullbody', label: 'Full body' },
  { value: 'haut', label: 'Haut du corps' },
  { value: 'bas', label: 'Bas du corps' },
  { value: 'push', label: 'Push (Pecs/Epaules/Triceps)' },
  { value: 'pull', label: 'Pull (Dos/Biceps)' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'abdos', label: 'Abdos' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'mobilite', label: 'Mobilité/Etirements' },
];

const INTENSITIES = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
];

const EXERCISES_BY_TYPE = {
  fullbody: [
    'Pompes',
    'Squats',
    'Gainage',
    'Burpees',
    'Fentes',
    'Tractions',
    'Dips',
    'Grimpeur',
    'Crunchs',
  ],
  haut: [
    'Pompes',
    'Tractions',
    'Dips',
    'Développé militaire',
    'Rowing',
    'Élévations latérales',
    'Pompes diamant',
    'Curl biceps',
  ],
  bas: [
    'Squats',
    'Fentes',
    'Mollets debout',
    'Hip thrust',
    'Soulevé de terre jambes tendues',
    'Leg curl',
    'Montées de banc',
  ],
  push: [
    'Pompes',
    'Développé couché',
    'Développé militaire',
    'Dips',
    'Élévations latérales',
    'Pompes diamant',
  ],
  pull: [
    'Tractions',
    'Rowing',
    'Curl biceps',
    'Tirage horizontal',
    'Face pull',
    'Shrugs',
    'Reverse fly',
  ],
  cardio: [
    'Burpees',
    'Sauts étoiles',
    'Grimpeur',
    'Corde à sauter',
    'Course sur place',
    'Genoux hauts',
  ],
  abdos: [
    'Crunchs',
    'Gainage',
    'Relevé de jambes',
    'Russian twist',
    'Planche latérale',
    'Sit-ups',
  ],
  hiit: [
    'Burpees',
    'Squats sautés',
    'Pompes',
    'Grimpeur',
    'Fentes sautées',
    'Sprints sur place',
  ],
  mobilite: [
    'Étirement dos',
    'Étirement ischio',
    'Étirement pectoraux',
    'Étirement épaules',
    'Étirement quadriceps',
    'Étirement fessiers',
  ],
};

function getSetsForIntensity(intensity, exercise) {
  // Nombre de séries aléatoire entre 3 et 4
  const nbSeries = Math.floor(Math.random() * 2) + 3; // 3 ou 4
  // Pour le cardio/hiit/mobilité, on privilégie la durée
  if (
    ['cardio', 'hiit', 'mobilite'].some((type) =>
      exercise.toLowerCase().includes(type)
    )
  ) {
    let base;
    if (intensity === 'facile') base = 20;
    else if (intensity === 'moyen') base = 30;
    else base = 40;
    return Array.from({ length: nbSeries }, () => ({
      reps: 0,
      weight: '',
      duration: base,
    }));
  }
  // Pour les autres, on joue sur reps/sets, poids toujours vide
  let repsArr;
  if (intensity === 'facile') repsArr = [10, 8, 8, 8];
  else if (intensity === 'moyen') repsArr = [12, 10, 10, 8];
  else repsArr = [15, 12, 10, 10];
  return Array.from({ length: nbSeries }, (_, i) => ({
    reps: repsArr[i] || repsArr[repsArr.length - 1],
    weight: '',
    duration: 0,
  }));
}

// Fonction pour déterminer le groupe musculaire d'un exercice
function getMuscleGroupForExercise(exerciseName) {
  // Vérifier dans la base de données d'exercices
  for (const [muscleGroup, exercises] of Object.entries(exerciseDatabase)) {
    if (exercises.includes(exerciseName)) {
      return muscleGroup;
    }
  }

  // Mapping spécifique pour les exercices du chatbot
  const exerciseMapping = {
    Pompes: 'pectoraux',
    Squats: 'jambes',
    Gainage: 'abdos',
    Burpees: 'cardio',
    Fentes: 'jambes',
    Tractions: 'dos',
    Dips: 'triceps',
    Grimpeur: 'cardio',
    Crunchs: 'abdos',
    'Développé militaire': 'épaules',
    Rowing: 'dos',
    'Élévations latérales': 'épaules',
    'Pompes diamant': 'triceps',
    'Curl biceps': 'biceps',
    'Mollets debout': 'jambes',
    'Hip thrust': 'jambes',
    'Soulevé de terre jambes tendues': 'jambes',
    'Leg curl': 'jambes',
    'Montées de banc': 'jambes',
    'Développé couché': 'pectoraux',
    'Tirage horizontal': 'dos',
    'Face pull': 'épaules',
    Shrugs: 'dos',
    'Reverse fly': 'épaules',
    'Sauts étoiles': 'cardio',
    'Corde à sauter': 'cardio',
    'Course sur place': 'cardio',
    'Genoux hauts': 'cardio',
    'Relevé de jambes': 'abdos',
    'Russian twist': 'abdos',
    'Planche latérale': 'abdos',
    'Sit-ups': 'abdos',
    'Squats sautés': 'jambes',
    'Fentes sautées': 'jambes',
    'Sprints sur place': 'cardio',
    'Étirement dos': 'mobilite',
    'Étirement ischio': 'mobilite',
    'Étirement pectoraux': 'mobilite',
    'Étirement épaules': 'mobilite',
    'Étirement quadriceps': 'mobilite',
    'Étirement fessiers': 'mobilite',
  };

  return exerciseMapping[exerciseName] || 'custom';
}

const Chatbot = ({
  workouts,
  user,
  setExercisesFromWorkout,
  setShowAddExercise,
  setActiveTab,
  messages: messagesProp,
  setMessages: setMessagesProp,
  onClose,
}) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const chatGpt = useChatGPT(apiKey);
  const messages = messagesProp || chatGpt.messages;
  const setMessages = setMessagesProp || chatGpt.setMessages;
  const sendMessage = chatGpt.sendMessage;
  const {
    isLoading,
    // clearCache, // TODO: Implement cache management UI
    // cacheStats, // TODO: Implement cache stats display
    clearMemory,
    // clearAll, // TODO: Implement clear all functionality
    exportConversation,
    getMemoryStats,
    getMonitoringStats,
    getFunctionStats,
    getPerformanceTrends,
    getPerformanceAlerts,
    // generatePerformanceReport, // TODO: Implement performance report generation
    // resetMonitoring, // TODO: Implement monitoring reset
    getSafetyStats,
    getKnowledgeBaseStats,
    addCustomKnowledge,
    searchKnowledgeBase,
    getKnowledgeByCategory,
  } = chatGpt;
  const [input, setInput] = useState('');
  const [sessionType, setSessionType] = useState('fullbody');
  const [intensity, setIntensity] = useState('moyen');
  const [showMenu, setShowMenu] = useState(false);
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);

  // Message d'accueil automatique au premier rendu
  useEffect(() => {
    if (messages.length === 0) {
      // Message d'accueil personnalisé
      const prenom = user?.displayName ? user.displayName.split(' ')[0] : '';
      setMessages([
        {
          role: 'assistant',
          content: `${prenom ? 'Bonjour ' + prenom + ', ' : 'Bonjour,'}je suis Coach Lex IA. Je peux t'aider avec tes séances de sport, la nutrition, le bien-être et bien d'autres sujets ! Comment puis-je t'aider aujourd'hui ?`,
        },
      ]);
    }
    // eslint-disable-next-line
  }, []);

  // Obtenir les statistiques de mémoire
  const memoryStats = getMemoryStats();

  // Génère un contexte enrichi à chaque message, mais accepte toutes les questions
  const getSummary = () => {
    if (!workouts || workouts.length === 0) return 'Aucune séance enregistrée.';
    const distribution = getMuscleGroupDistribution(workouts);
    const distString = Object.entries(distribution)
      .map(([muscle, percent]) => `${muscle}:${percent}%`)
      .join(', ');
    return `Répartition ${distString}`;
  };
  const getDetails = () => {
    if (!workouts || workouts.length === 0) return '';
    return workouts
      .slice(-3)
      .map(
        (w) =>
          `${w.date} - ${w.exercises?.length || 0} exercices - ${w.duration || 0}min`
      )
      .join('; ');
  };
  const getWeightDetails = () => {
    if (!workouts || workouts.length === 0) return '';
    return getWorkoutWeightDetails(workouts.slice(-3));
  };
  const getSetRepDetails = () => {
    if (!workouts || workouts.length === 0) return '';
    return getWorkoutSetRepDetails(workouts.slice(-3));
  };

  // Fonction pour analyser l'historique et faire des recommandations intelligentes
  const analyzeWorkoutHistory = () => {
    if (!workouts || workouts.length === 0) {
      return {
        muscleGroups: {},
        recentExercises: [],
        frequency: {},
        lastWorkoutDate: null,
        daysSinceLastWorkout: null,
        feelings: {},
        feelingTrends: {},
      };
    }

    const now = new Date();
    const lastWorkout = workouts[workouts.length - 1];
    const lastWorkoutDate = new Date(lastWorkout.date);
    const daysSinceLastWorkout = Math.floor(
      (now - lastWorkoutDate) / (1000 * 60 * 60 * 24)
    );

    // Analyser les groupes musculaires travaillés
    const muscleGroups = {};
    const recentExercises = [];
    const frequency = {};
    const feelings = {};
    const feelingTrends = {};

    workouts.slice(-5).forEach((workout) => {
      // Analyser les ressentis
      if (workout.feeling) {
        feelings[workout.feeling] = (feelings[workout.feeling] || 0) + 1;

        // Analyser les tendances de ressentis par type d'exercice
        workout.exercises?.forEach((exercise) => {
          const muscleGroup =
            exercise.type || getMuscleGroupForExercise(exercise.name);
          if (!feelingTrends[muscleGroup]) {
            feelingTrends[muscleGroup] = [];
          }
          feelingTrends[muscleGroup].push(workout.feeling);
        });
      }

      workout.exercises?.forEach((exercise) => {
        const muscleGroup =
          exercise.type || getMuscleGroupForExercise(exercise.name);
        muscleGroups[muscleGroup] = (muscleGroups[muscleGroup] || 0) + 1;

        if (!recentExercises.includes(exercise.name)) {
          recentExercises.push(exercise.name);
        }

        frequency[exercise.name] = (frequency[exercise.name] || 0) + 1;
      });
    });

    return {
      muscleGroups,
      recentExercises,
      frequency,
      lastWorkoutDate,
      daysSinceLastWorkout,
      feelings,
      feelingTrends,
    };
  };

  // Fonction pour analyser la progression des poids
  const analyzeWeightProgress = () => {
    if (!workouts || workouts.length < 2) return null;

    // Analyser les 4 dernières semaines
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentWorkouts = workouts.filter(
      (w) => new Date(w.date) >= fourWeeksAgo
    );

    if (recentWorkouts.length < 2) return null;

    // Calculer la progression des poids par exercice
    const exerciseProgress = {};

    recentWorkouts.forEach((workout) => {
      workout.exercises?.forEach((exercise) => {
        if (!exerciseProgress[exercise.name]) {
          exerciseProgress[exercise.name] = [];
        }

        exercise.sets?.forEach((set) => {
          if (set.weight && parseFloat(set.weight) > 0) {
            exerciseProgress[exercise.name].push({
              weight: parseFloat(set.weight),
              date: new Date(workout.date),
            });
          }
        });
      });
    });

    // Analyser la progression
    let progressSummary = [];
    let totalProgress = 0;
    let exerciseCount = 0;

    Object.entries(exerciseProgress).forEach(([exerciseName, weights]) => {
      if (weights.length >= 2) {
        const sortedWeights = weights.sort((a, b) => a.date - b.date);
        const firstWeight = sortedWeights[0].weight;
        const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
        const progress = lastWeight - firstWeight;

        if (progress !== 0) {
          progressSummary.push(
            `${exerciseName}: ${progress > 0 ? '+' : ''}${progress.toFixed(1)}kg`
          );
          totalProgress += progress;
          exerciseCount++;
        }
      }
    });

    if (progressSummary.length > 0) {
      const avgProgress = totalProgress / exerciseCount;
      const summary = progressSummary.slice(0, 5).join(', '); // Afficher jusqu'à 5 exercices
      return {
        details: summary,
        average: avgProgress.toFixed(1),
        count: exerciseCount,
      };
    }

    return null;
  };

  // Fonction pour analyser les ressentis et donner des conseils personnalisés
  const analyzeFeelings = () => {
    if (!workouts || workouts.length === 0) return '';

    const recentWorkouts = workouts.slice(-5);
    const workoutsWithFeelings = recentWorkouts.filter((w) => w.feeling);

    if (workoutsWithFeelings.length === 0) return '';

    const feelings = workoutsWithFeelings.map((w) => w.feeling);
    const positiveFeelings = [
      'easy',
      'strong',
      'energized',
      'motivated',
      'great',
      'good',
    ];
    const negativeFeelings = ['hard', 'weak', 'demotivated', 'bad', 'terrible'];

    const positiveCount = feelings.filter((f) =>
      positiveFeelings.includes(f)
    ).length;
    const negativeCount = feelings.filter((f) =>
      negativeFeelings.includes(f)
    ).length;

    let analysis = `Analyse des ressentis (${workoutsWithFeelings.length} séances) : `;

    if (positiveCount > negativeCount) {
      analysis += `Vous vous sentez généralement bien après vos séances (${positiveCount} séances positives). Continuez sur cette lancée !`;
    } else if (negativeCount > positiveCount) {
      analysis += `Vous avez eu des difficultés récemment (${negativeCount} séances difficiles). Il serait bon d'ajuster l'intensité ou de prendre plus de repos.`;
    } else {
      analysis += `Vos ressentis sont mixtes (${positiveCount} positifs, ${negativeCount} négatifs). Essayons d'optimiser vos séances.`;
    }

    // Analyser le dernier ressenti
    const lastFeeling = feelings[feelings.length - 1];
    if (lastFeeling) {
      analysis += ` Dernier ressenti : ${lastFeeling}.`;
    }

    return analysis;
  };

  // Fonction pour recommander des exercices intelligemment
  const getIntelligentExerciseRecommendations = () => {
    const analysis = analyzeWorkoutHistory();
    const allExercises =
      EXERCISES_BY_TYPE[sessionType] || EXERCISES_BY_TYPE['fullbody'];

    // Si pas d'historique, retourner des exercices de base
    if (Object.keys(analysis.muscleGroups).length === 0) {
      return allExercises.slice(0, 5);
    }

    // Déterminer les groupes musculaires sous-traités
    const muscleGroupCounts = analysis.muscleGroups;
    const allMuscleGroups = [
      'pectoraux',
      'dos',
      'épaules',
      'biceps',
      'triceps',
      'jambes',
      'abdos',
      'cardio',
    ];
    const underworkedGroups = allMuscleGroups.filter(
      (group) => !muscleGroupCounts[group] || muscleGroupCounts[group] < 2
    );

    // Prioriser les exercices des groupes sous-traités
    let recommendedExercises = [];

    // Ajouter des exercices des groupes sous-traités
    underworkedGroups.forEach((group) => {
      const groupExercises = allExercises.filter(
        (ex) => getMuscleGroupForExercise(ex) === group
      );
      recommendedExercises.push(...groupExercises.slice(0, 2));
    });

    // Si pas assez d'exercices, ajouter des exercices variés
    if (recommendedExercises.length < 4) {
      const remainingExercises = allExercises.filter(
        (ex) =>
          !recommendedExercises.includes(ex) &&
          !analysis.recentExercises.includes(ex)
      );
      recommendedExercises.push(
        ...remainingExercises.slice(0, 6 - recommendedExercises.length)
      );
    }

    // Éviter les exercices trop récents (dans les 2 dernières séances)
    const veryRecentExercises = [];
    workouts.slice(-2).forEach((workout) => {
      workout.exercises?.forEach((exercise) => {
        if (!veryRecentExercises.includes(exercise.name)) {
          veryRecentExercises.push(exercise.name);
        }
      });
    });

    recommendedExercises = recommendedExercises.filter(
      (ex) => !veryRecentExercises.includes(ex)
    );

    // Ajuster selon l'intensité et le type de séance
    if (sessionType === 'cardio' || sessionType === 'hiit') {
      recommendedExercises = recommendedExercises.filter((ex) =>
        ['cardio', 'jambes'].includes(getMuscleGroupForExercise(ex))
      );
    } else if (sessionType === 'abdos') {
      recommendedExercises = recommendedExercises.filter(
        (ex) => getMuscleGroupForExercise(ex) === 'abdos'
      );
    }

    // Retourner 4-6 exercices
    return recommendedExercises.slice(
      0,
      Math.min(6, Math.max(4, recommendedExercises.length))
    );
  };

  // Génère une séance conseillée intelligemment selon l'historique
  const handleSuggestWorkout = () => {
    // const analysis = analyzeWorkoutHistory(); // TODO: Utiliser pour personnaliser les recommandations
    const recommendedExercises = getIntelligentExerciseRecommendations();

    // Si pas assez d'exercices recommandés, compléter avec des exercices de base
    let finalExercises = [...recommendedExercises];
    if (finalExercises.length < 4) {
      const allExercises =
        EXERCISES_BY_TYPE[sessionType] || EXERCISES_BY_TYPE['fullbody'];
      const additionalExercises = allExercises.filter(
        (ex) => !finalExercises.includes(ex)
      );
      finalExercises.push(
        ...additionalExercises.slice(0, 4 - finalExercises.length)
      );
    }

    const suggestedExercises = finalExercises.map((ex, idx) => ({
      id: Date.now() + idx + 1,
      name: ex,
      type: getMuscleGroupForExercise(ex),
      sets: getSetsForIntensity(intensity, ex),
    }));

    // TODO: Générer un message explicatif pour l'utilisateur
    // let explanation = `Voici une séance ${sessionType} de niveau ${intensity} avec ${suggestedExercises.length} exercices :\n`;
    // if (analysis.daysSinceLastWorkout !== null) {
    //   if (analysis.daysSinceLastWorkout === 0) {
    //     explanation += '💪 Séance du jour ! ';
    //   } else if (analysis.daysSinceLastWorkout === 1) {
    //     explanation += '🔥 Reprise après 1 jour de repos. ';
    //   } else {
    //     explanation += `⏰ Reprise après ${analysis.daysSinceLastWorkout} jours. `;
    //   }
    // }
    // const muscleGroups = Object.keys(analysis.muscleGroups);
    // if (muscleGroups.length > 0) {
    //   explanation += `\n🎯 Cette séance équilibre ton entraînement en ciblant des groupes moins travaillés récemment.`;
    // }
    // setMessages(prev => [...prev, { role: 'assistant', content: explanation }]);

    // Fermer immédiatement le chatbot et afficher la séance
    setExercisesFromWorkout(suggestedExercises);
    if (setActiveTab) setActiveTab('workout');
    setShowMenu(false);

    // Fermer le chatbot immédiatement
    if (onClose) {
      onClose();
    }
  };

  // Fonction pour générer un récap intelligent des dernières séances
  const handleRecapLastWorkouts = () => {
    if (!workouts || workouts.length === 0) return;

    const analysis = analyzeWorkoutHistory();
    const last3 = workouts.slice(-3).reverse();

    const recap = last3
      .map((w) => {
        let date = new Date(w.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        date = date.charAt(0).toUpperCase() + date.slice(1);
        const exos = w.exercises
          ?.map((ex) => {
            const nbSeries = ex.sets?.length || 0;
            const reps = ex.sets?.map((s) => s.reps).join('/') || '-';
            const poids = ex.sets?.map((s) => s.weight).join('/') || '-';
            const muscleGroup = ex.type || getMuscleGroupForExercise(ex.name);
            return `  - ${ex.name} (${muscleGroup}) : ${nbSeries} séries, reps : ${reps}, poids : ${poids}`;
          })
          .join('\n');

        // Ajouter le ressenti si disponible
        let feelingInfo = '';
        if (w.feeling) {
          const feelingEmoji =
            w.feeling === 'easy' ||
            w.feeling === 'strong' ||
            w.feeling === 'energized' ||
            w.feeling === 'motivated' ||
            w.feeling === 'great' ||
            w.feeling === 'good'
              ? '😊'
              : w.feeling === 'medium' ||
                  w.feeling === 'tired' ||
                  w.feeling === 'ok'
                ? '😐'
                : w.feeling === 'hard' ||
                    w.feeling === 'weak' ||
                    w.feeling === 'demotivated' ||
                    w.feeling === 'bad' ||
                    w.feeling === 'terrible'
                  ? '😔'
                  : '💭';
          feelingInfo = `\n  💭 Ressenti : ${feelingEmoji} ${w.feeling}`;
        }

        return `• ${date} :\n${exos}${feelingInfo}`;
      })
      .join('\n');

    // Analyse intelligente et recommandations personnalisées
    let recommendations = [];

    // Analyser la fréquence des groupes musculaires
    const muscleGroupCounts = analysis.muscleGroups;
    const allMuscleGroups = [
      'pectoraux',
      'dos',
      'épaules',
      'biceps',
      'triceps',
      'jambes',
      'abdos',
      'cardio',
    ];

    // Trouver les groupes les plus et moins travaillés
    const sortedGroups = allMuscleGroups
      .map((group) => ({ group, count: muscleGroupCounts[group] || 0 }))
      .sort((a, b) => b.count - a.count);

    const mostWorked = sortedGroups[0];
    const leastWorked = sortedGroups.filter((g) => g.count === 0);

    // Recommandations basées sur l'analyse
    if (mostWorked.count > 3) {
      recommendations.push(
        `🎯 Tu as beaucoup travaillé les ${mostWorked.group} (${mostWorked.count}x). Pense à varier !`
      );
    }

    if (leastWorked.length > 0) {
      const groups = leastWorked.map((g) => g.group).join(', ');
      recommendations.push(`💪 Tu n'as pas encore travaillé : ${groups}`);
    }

    // Analyser la régularité
    if (analysis.daysSinceLastWorkout !== null) {
      if (analysis.daysSinceLastWorkout === 0) {
        recommendations.push(`🔥 Excellente régularité ! Séance du jour.`);
      } else if (analysis.daysSinceLastWorkout === 1) {
        recommendations.push(`👍 Bon rythme ! Reprise après 1 jour de repos.`);
      } else if (analysis.daysSinceLastWorkout <= 3) {
        recommendations.push(
          `⏰ Rythme correct. ${analysis.daysSinceLastWorkout} jours depuis la dernière séance.`
        );
      } else {
        recommendations.push(
          `⚠️ Attention : ${analysis.daysSinceLastWorkout} jours depuis la dernière séance. Essaye de maintenir un rythme régulier.`
        );
      }
    }

    // Ajouter l'analyse des ressentis
    const feelingsAnalysis = analyzeFeelings();
    if (feelingsAnalysis) {
      recommendations.push(feelingsAnalysis);
    }

    const message = `📊 **Récap des 3 dernières séances :**\n\n${recap}\n\n**Analyse et recommandations :**\n${recommendations.join('\n')}`;

    setMessages((prev) => [...prev, { role: 'assistant', content: message }]);
  };

  // Fonction pour des recommandations personnalisées basées sur l'IA
  const handlePersonalizedRecommendation = () => {
    const analysis = analyzeWorkoutHistory();
    const prenom = user?.displayName ? user.displayName.split(' ')[0] : '';

    let recommendation = `${prenom ? prenom + ', ' : ''}voici mes recommandations personnalisées :\n\n`;

    // Conseils spécifiques selon l'objectif
    if (user?.goal) {
      recommendation += `🎯 **Ton objectif : ${user.goal}**\n\n`;

      switch (user.goal) {
        case 'Perte de poids':
          recommendation += '🔥 **Stratégie perte de poids** :\n';
          recommendation += '• Privilégie les exercices cardio (30-45 min)\n';
          recommendation +=
            '• HIIT et circuits training pour brûler plus de calories\n';
          recommendation +=
            '• Exercices polyarticulaires (squats, burpees, mountain climbers)\n';
          recommendation +=
            '• Rythme soutenu avec peu de repos entre les séries\n';
          recommendation +=
            '• 4-5 séances par semaine pour maximiser la dépense calorique\n\n';
          break;

        case 'Prise de masse':
          recommendation += '💪 **Stratégie prise de masse** :\n';
          recommendation +=
            '• Focus sur les exercices de musculation avec charges\n';
          recommendation +=
            "• Séries de 8-12 répétitions pour l'hypertrophie\n";
          recommendation += '• Repos de 2-3 minutes entre les séries\n';
          recommendation +=
            '• Exercices de base : squats, deadlifts, bench press\n';
          recommendation += '• 3-4 séances par semaine avec récupération\n\n';
          break;

        case 'Endurance':
          recommendation += '❤️ **Stratégie endurance** :\n';
          recommendation += '• Séances cardio longues (45-60 min)\n';
          recommendation += '• Course à pied, vélo, natation, rameur\n';
          recommendation += '• Intensité modérée mais soutenue\n';
          recommendation += '• Séries de 15-20 répétitions en musculation\n';
          recommendation += '• 4-5 séances par semaine\n\n';
          break;

        case 'Performance':
          recommendation += '⚡ **Stratégie performance** :\n';
          recommendation += '• Entraînement fonctionnel et cross-training\n';
          recommendation += '• Exercices explosifs et plyométriques\n';
          recommendation += '• Séries courtes et intenses (5-8 répétitions)\n';
          recommendation += '• Travail de la puissance et de la vitesse\n';
          recommendation += '• 3-4 séances par semaine avec récupération\n\n';
          break;
        default:
          recommendation += '🎯 **Stratégie générale** :\n';
          recommendation +=
            '• Varie tes exercices pour un entraînement équilibré\n';
          recommendation +=
            '• Maintiens une bonne régularité (3-4 séances/semaine)\n';
          recommendation +=
            '• Écoute ton corps et ajuste selon tes ressentis\n\n';
          break;
      }
    }

    // Analyser le niveau d'activité
    if (!workouts || workouts.length === 0) {
      recommendation +=
        '🎯 **Débutant** : Commence par des séances courtes (20-30 min) avec des exercices de base.\n';
      recommendation +=
        '💪 **Exercices recommandés** : Pompes, Squats, Gainage, Burpees\n';
      recommendation += '📅 **Fréquence** : 2-3 séances par semaine\n';
      recommendation +=
        "🔥 **Progression** : Augmente progressivement l'intensité\n\n";
    } else {
      // Analyser la progression
      const recentWorkouts = workouts.slice(-7);
      const avgExercises =
        recentWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0) /
        recentWorkouts.length;

      if (avgExercises < 4) {
        recommendation +=
          "📈 **Progression** : Tes séances sont courtes. Essaie d'ajouter 1-2 exercices.\n";
      } else if (avgExercises > 6) {
        recommendation +=
          '💪 **Intensité** : Tes séances sont complètes ! Pense à augmenter les poids.\n';
      } else {
        recommendation +=
          '✅ **Équilibre** : Tes séances sont bien dosées. Continue comme ça !\n';
      }

      // Analyser les groupes musculaires
      const muscleGroupCounts = analysis.muscleGroups;
      const allMuscleGroups = [
        'pectoraux',
        'dos',
        'épaules',
        'biceps',
        'triceps',
        'jambes',
        'abdos',
        'cardio',
      ];
      const underworkedGroups = allMuscleGroups.filter(
        (group) => !muscleGroupCounts[group] || muscleGroupCounts[group] < 2
      );

      if (underworkedGroups.length > 0) {
        recommendation += `🎯 **Équilibre** : Travaille ces groupes : ${underworkedGroups.join(', ')}\n`;
      }

      // Recommandations selon la régularité
      if (analysis.daysSinceLastWorkout <= 1) {
        recommendation +=
          "🔥 **Régularité** : Excellente fréquence ! Tu peux augmenter l'intensité.\n";
      } else if (analysis.daysSinceLastWorkout <= 3) {
        recommendation +=
          "👍 **Régularité** : Bonne fréquence. Continue à t'entraîner régulièrement.\n";
      } else {
        recommendation +=
          '⚠️ **Régularité** : Reprends progressivement pour éviter les blessures.\n';
      }

      // Analyser les ressentis et donner des conseils spécifiques
      const feelingsAnalysis = analyzeFeelings();
      if (feelingsAnalysis) {
        recommendation += `\n💭 **Analyse des ressentis** :\n${feelingsAnalysis}\n`;

        // Conseils spécifiques basés sur les ressentis
        const recentFeelings = recentWorkouts
          .filter((w) => w.feeling)
          .map((w) => w.feeling);
        if (recentFeelings.length > 0) {
          const negativeFeelings = recentFeelings.filter((f) =>
            ['hard', 'weak', 'demotivated', 'bad', 'terrible'].includes(f)
          );
          const positiveFeelings = recentFeelings.filter((f) =>
            [
              'easy',
              'strong',
              'energized',
              'motivated',
              'great',
              'good',
            ].includes(f)
          );

          if (negativeFeelings.length > positiveFeelings.length) {
            recommendation +=
              '🔄 **Conseil** : Tes séances récentes ont été difficiles. Essaie de :\n';
            recommendation += "• Réduire l'intensité de 10-20%\n";
            recommendation +=
              '• Augmenter le temps de repos entre les séries\n';
            recommendation += "• Ajouter plus d'étirements et de mobilité\n";
            recommendation +=
              '• Prendre un jour de repos supplémentaire si nécessaire\n';
          } else if (positiveFeelings.length > negativeFeelings.length) {
            recommendation +=
              '🚀 **Conseil** : Tes séances récentes ont été positives ! Tu peux :\n';
            recommendation += "• Augmenter progressivement l'intensité\n";
            recommendation += '• Essayer de nouveaux exercices\n';
            recommendation += '• Ajouter des exercices plus complexes\n';
            recommendation += '• Maintenir ce rythme motivant\n';
          }
        }
      }
    }

    // Recommandations générales
    recommendation += '\n💡 **Conseils généraux** :\n';
    recommendation += '• Échauffe-toi toujours 5-10 minutes\n';
    recommendation += "• Bois suffisamment d'eau\n";
    recommendation += '• Dors 7-8h par nuit pour la récupération\n';
    recommendation += '• Varie tes exercices pour éviter la routine\n';
    recommendation += '• Écoute ton corps et ajuste selon tes ressentis\n';

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: recommendation },
    ]);
  };

  // Fonction pour analyser la progression de l'utilisateur
  const handleGoalsAndProgress = () => {
    const analysis = analyzeWorkoutHistory();
    const prenom = user?.displayName ? user.displayName.split(' ')[0] : '';

    let progressAnalysis = `${prenom ? prenom + ', ' : ''}voici ton analyse de progression :\n\n`;

    // Afficher l'objectif actuel
    if (user?.goal) {
      progressAnalysis += `🎯 **Ton objectif actuel : ${user.goal}**\n\n`;
    }

    if (!workouts || workouts.length === 0) {
      progressAnalysis += '📈 **Nouveau débutant** :\n';
      progressAnalysis += '• **Progression actuelle** : Aucune séance encore\n';
      progressAnalysis +=
        '• **Prochain objectif** : Commencer ta première séance\n';
      progressAnalysis += '• **Focus** : Technique et régularité\n\n';
    } else {
      // Analyser la progression sur les 4 dernières semaines
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const recentWorkouts = workouts.filter(
        (w) => new Date(w.date) >= fourWeeksAgo
      );

      // Calculer les métriques de progression
      const totalWorkouts = recentWorkouts.length;
      const avgExercises =
        recentWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0) /
        totalWorkouts;
      const avgDuration =
        recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) /
        totalWorkouts;

      // Analyser la progression des poids
      const weightProgress = analyzeWeightProgress();

      progressAnalysis += '📊 **Progression (4 dernières semaines)** :\n';
      progressAnalysis += `• **Séances** : ${totalWorkouts} séances (${Math.round((totalWorkouts / 4) * 7)}/semaine)\n`;
      progressAnalysis += `• **Exercices/séance** : ${Math.round(avgExercises)} exercices en moyenne\n`;
      progressAnalysis += `• **Durée moyenne** : ${Math.round(avgDuration)} minutes\n`;

      if (weightProgress) {
        progressAnalysis += `• **Progression poids** : ${weightProgress.details}\n`;
        progressAnalysis += `• **Progression moyenne** : ${weightProgress.average}kg par exercice\n`;
        progressAnalysis += `• **Exercices avec progression** : ${weightProgress.count} exercices\n`;
      }

      // Section dédiée à la progression des poids
      if (weightProgress) {
        progressAnalysis += `\n🏋️ **Progression des poids détaillée** :\n`;
        progressAnalysis += `• **Progression totale** : ${weightProgress.average}kg en moyenne\n`;
        if (parseFloat(weightProgress.average) > 0) {
          progressAnalysis += `• **Statut** : ⬆️ Tu progresses bien en force !\n`;
        } else if (parseFloat(weightProgress.average) < 0) {
          progressAnalysis += `• **Statut** : ⬇️ Tu as peut-être réduit l'intensité\n`;
        } else {
          progressAnalysis += `• **Statut** : ➡️ Progression stable\n`;
        }
        progressAnalysis += `• **Détail** : ${weightProgress.details}\n`;
      }

      // Analyser la progression de fréquence
      const allWorkouts = workouts.length;
      const weeksSinceStart = Math.max(
        1,
        Math.floor(
          (new Date() - new Date(workouts[0].date)) / (1000 * 60 * 60 * 24 * 7)
        )
      );
      const avgWeeklyWorkouts = allWorkouts / weeksSinceStart;

      progressAnalysis += `• **Progression globale** : ${allWorkouts} séances en ${weeksSinceStart} semaines\n`;
      progressAnalysis += `• **Moyenne hebdomadaire** : ${avgWeeklyWorkouts.toFixed(1)} séances/semaine\n`;

      // Analyser la progression récente vs globale
      const recentWeeklyAvg = totalWorkouts / 4;
      if (recentWeeklyAvg > avgWeeklyWorkouts) {
        progressAnalysis += `• **Tendance** : ⬆️ Tu t'améliores ! (${recentWeeklyAvg.toFixed(1)} vs ${avgWeeklyWorkouts.toFixed(1)})\n`;
      } else if (recentWeeklyAvg < avgWeeklyWorkouts) {
        progressAnalysis += `• **Tendance** : ⬇️ Tu as ralenti (${recentWeeklyAvg.toFixed(1)} vs ${avgWeeklyWorkouts.toFixed(1)})\n`;
      } else {
        progressAnalysis += `• **Tendance** : ➡️ Stable (${recentWeeklyAvg.toFixed(1)} séances/semaine)\n`;
      }

      // Analyser la progression des ressentis
      const feelingsAnalysis = analyzeFeelings();
      if (feelingsAnalysis) {
        progressAnalysis += `\n💭 **Progression des ressentis** :\n${feelingsAnalysis}\n`;
      }

      // Analyser la progression des groupes musculaires
      const muscleGroups = analysis.muscleGroups;
      const allGroups = [
        'pectoraux',
        'dos',
        'épaules',
        'biceps',
        'triceps',
        'jambes',
        'abdos',
        'cardio',
      ];
      const workedGroups = allGroups.filter(
        (group) => muscleGroups[group] && muscleGroups[group] >= 2
      );
      const weakGroups = allGroups.filter(
        (group) => !muscleGroups[group] || muscleGroups[group] < 2
      );

      progressAnalysis += `\n💪 **Progression musculaire** :\n`;
      progressAnalysis += `• **Groupes travaillés** : ${workedGroups.length}/8 groupes musculaires\n`;
      if (workedGroups.length > 0) {
        progressAnalysis += `• **Développés** : ${workedGroups.join(', ')}\n`;
      }
      if (weakGroups.length > 0) {
        progressAnalysis += `• **À développer** : ${weakGroups.join(', ')}\n`;
      }

      // Progression de l'intensité
      const recentIntensity =
        recentWorkouts.reduce((sum, w) => {
          const workoutIntensity =
            w.exercises?.reduce((exSum, ex) => {
              const setIntensity =
                ex.sets?.reduce((setSum, set) => {
                  return (
                    setSum + (set.reps || 0) * (parseFloat(set.weight) || 0)
                  );
                }, 0) || 0;
              return exSum + setIntensity;
            }, 0) || 0;
          return sum + workoutIntensity;
        }, 0) / totalWorkouts;

      progressAnalysis += `\n🔥 **Progression d'intensité** :\n`;
      progressAnalysis += `• **Intensité moyenne** : ${Math.round(recentIntensity)} points/séance\n`;

      // Conseils de progression
      progressAnalysis += '\n🚀 **Conseils pour progresser** :\n';
      if (avgExercises < 4) {
        progressAnalysis += '• Ajoute 1-2 exercices par séance\n';
      }
      if (avgDuration < 30) {
        progressAnalysis += '• Augmente progressivement la durée\n';
      }
      if (weakGroups.length > 0) {
        progressAnalysis += '• Travaille les groupes musculaires négligés\n';
      }
      progressAnalysis += '• Varie les intensités (facile/moyen/difficile)\n';
      progressAnalysis += '• Suis tes ressentis pour ajuster\n';
    }

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: progressAnalysis },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Contexte enrichi avec analyse des ressentis
    const feelingsContext = analyzeFeelings();
    const context = `Tu es un assistant personnel sportif et bien-être. Sois motivant, bienveillant et adapte tes réponses à mon niveau. Voici un résumé de mes dernières séances : ${getSummary()} ${getDetails()} ${getWeightDetails()} ${getSetRepDetails()} ${feelingsContext ? `\n\nAnalyse des ressentis : ${feelingsContext}` : ''}`;

    await sendMessage(
      input,
      context,
      user?.height,
      user?.weight,
      user?.goal,
      false,
      workouts,
      user
    );
    setInput('');
  };

  return (
    <div className="p-2 sm:p-6 bg-white/60 backdrop-blur-lg rounded-xl shadow-lg">
      {/* Header avec boutons de contrôle */}
      <div className="flex items-center justify-end mb-2 sm:mb-4">
        {/* Dashboard unifié */}
        <ChatbotDashboard
          onMonitoring={() => setShowMonitoring(true)}
          onKnowledgeBase={() => setShowKnowledgeBase(true)}
          onExport={exportConversation}
          onReset={clearMemory}
          memoryStats={memoryStats}
        />
      </div>

      {/* Boutons d'action principaux */}
      <div className="mb-2 sm:mb-4 flex items-center gap-1 sm:gap-3">
        {/* Bouton création séance IA */}
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all text-xs sm:text-sm border border-white/20 flex items-center gap-1 sm:gap-2"
          title="Créer une séance personnalisée avec l'IA"
        >
          <span>🤖</span>
          <span>Séance IA</span>
        </button>
        
        {/* Menu de recommandations IA */}
        <RecommendationsMenu
          onRecapWorkouts={handleRecapLastWorkouts}
          onPersonalizedRecommendation={() =>
            handlePersonalizedRecommendation()
          }
          onGoalsAndProgress={() => handleGoalsAndProgress()}
        />
      </div>

      {/* Menu de création de séance */}
      {showMenu && (
        <div className="mb-2 sm:mb-4 p-2 sm:p-4 bg-white border rounded-xl shadow-xl">
          <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
            Créer une séance personnalisée
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-1 sm:mb-2 text-xs sm:text-sm">
                Type de séance
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
              >
                {SESSION_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1 sm:mb-2 text-xs sm:text-sm">
                Intensité
              </label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
              >
                {INTENSITIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-4">
            <button
              onClick={handleSuggestWorkout}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded font-semibold shadow hover:from-green-600 hover:to-green-700 transition border border-white/20 text-xs sm:text-sm"
            >
              💪 Générer
            </button>
            <button
              onClick={() => setShowMenu(false)}
              className="text-gray-500 px-2 sm:px-4 py-1 sm:py-2 rounded hover:bg-gray-100 transition text-xs sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Zone de messages */}
      <div className="border rounded-xl p-2 sm:p-4 h-32 sm:h-64 overflow-y-auto bg-white space-y-2 shadow-inner mb-2 sm:mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'text-right' : 'text-left'}
          >
            <span
              className={
                m.role === 'user'
                  ? 'bg-indigo-100 text-indigo-800 px-2 sm:px-3 py-1 sm:py-2 rounded inline-block text-xs sm:text-lg'
                  : 'bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded inline-block text-xs sm:text-lg'
              }
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      {/* Zone de saisie */}
      <div className="flex space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          className="flex-1 border rounded px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-lg input-modern"
          placeholder="Posez une question..."
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className={`btn-gradient text-white px-3 sm:px-5 py-1 sm:py-2 rounded text-sm sm:text-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '⏳' : 'Envoyer'}
        </button>
      </div>

      {/* Dashboard de Monitoring */}
      {showMonitoring && (
        <MonitoringDashboard
          monitoringStats={getMonitoringStats()}
          functionStats={getFunctionStats()}
          performanceTrends={getPerformanceTrends()}
          alerts={getPerformanceAlerts()}
          safetyStats={getSafetyStats()}
          onClose={() => setShowMonitoring(false)}
        />
      )}

      {/* Gestionnaire de Base de Connaissances RAG */}
      {showKnowledgeBase && (
        <KnowledgeBaseManager
          isOpen={showKnowledgeBase}
          onClose={() => setShowKnowledgeBase(false)}
          getKnowledgeBaseStats={getKnowledgeBaseStats}
          addCustomKnowledge={addCustomKnowledge}
          searchKnowledgeBase={searchKnowledgeBase}
          getKnowledgeByCategory={getKnowledgeByCategory}
        />
      )}
    </div>
  );
};

Chatbot.propTypes = {
  workouts: PropTypes.array.isRequired,
  user: PropTypes.object,
  setExercisesFromWorkout: PropTypes.func.isRequired,
  setShowAddExercise: PropTypes.func.isRequired,
  setActiveTab: PropTypes.func,
  messages: PropTypes.array,
  setMessages: PropTypes.func,
  onClose: PropTypes.func,
};

export default Chatbot;

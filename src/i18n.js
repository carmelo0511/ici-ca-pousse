import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      // Les clés seront ajoutées plus tard
      "new_workout": "🏋️ Nouvelle séance",
      "create_program": "Créez votre programme d'entraînement",
      "ready_to_train": "Prêt à vous entraîner ? 💪",
      "start_workout": "Commencez votre séance en ajoutant des exercices de musculation ou de cardio",
      "add_exercise": "Ajouter un exercice",
      "finish_workout": "Terminer la séance",
      "workout_duration": "Durée de la séance",
      "minutes": "minutes",
      "default_duration_hint": "💡 Laissez vide pour une durée par défaut de 30 minutes",
      "choose_muscle_group": "🏃‍♂️ Choisir un groupe musculaire",
      "search_exercise": "Rechercher un exercice...",
      "no_exercise_found": "Aucun exercice trouvé",
      "custom_exercise_name": "Nom de l'exercice personnalisé",
      "add": "Ajouter",
      "cardio": "Cardio",
      "strength": "Musculation",
      "series": "Série",
      "duration_min": "Durée (min)",
      "intensity": "Intensité",
      "calories": "Calories",
      "repetitions": "Répétitions",
      "weight_kg": "Poids (kg)",
      "total": "Total",
      "workout_done": "{{count}} séance effectuée{{count > 1 ? 's' : ''}}"
    }
  },
  en: {
    translation: {
      "new_workout": "🏋️ New Workout",
      "create_program": "Create your training program",
      "ready_to_train": "Ready to train? 💪",
      "start_workout": "Start your session by adding strength or cardio exercises",
      "add_exercise": "Add exercise",
      "finish_workout": "Finish workout",
      "workout_duration": "Workout duration",
      "minutes": "minutes",
      "default_duration_hint": "💡 Leave empty for a default duration of 30 minutes",
      "choose_muscle_group": "🏃‍♂️ Choose a muscle group",
      "search_exercise": "Search for an exercise...",
      "no_exercise_found": "No exercise found",
      "custom_exercise_name": "Custom exercise name",
      "add": "Add",
      "cardio": "Cardio",
      "strength": "Strength",
      "series": "Set",
      "duration_min": "Duration (min)",
      "intensity": "Intensity",
      "calories": "Calories",
      "repetitions": "Repetitions",
      "weight_kg": "Weight (kg)",
      "total": "Total",
      "workout_done": "{{count}} workout done{{count > 1 ? 's' : ''}}"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 
// Fonctions OpenAI spécialisées pour le fitness et l'entraînement
export const fitnessFunctions = [
  {
    name: 'analyze_workout_performance',
    description:
      "Analyse détaillée des performances d'entraînement de l'utilisateur",
    parameters: {
      type: 'object',
      properties: {
        workout_data: {
          type: 'array',
          description: "Données des séances d'entraînement",
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', description: 'Date de la séance' },
              exercises: { 
                type: 'array', 
                description: 'Exercices effectués',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Nom de l\'exercice' },
                    sets: { 
                      type: 'array', 
                      description: 'Séries effectuées',
                      items: {
                        type: 'object',
                        properties: {
                          weight: { type: 'number', description: 'Poids en kg' },
                          reps: { type: 'number', description: 'Nombre de répétitions' },
                          rest: { type: 'number', description: 'Temps de repos en secondes' }
                        }
                      }
                    }
                  }
                }
              },
              duration: { type: 'number', description: 'Durée en minutes' },
              feeling: {
                type: 'string',
                description: 'Ressenti après la séance',
              },
            },
          },
        },
        user_profile: {
          type: 'object',
          description: "Profil de l'utilisateur",
          properties: {
            goal: { type: 'string', description: 'Objectif principal' },
            level: { type: 'string', description: "Niveau d'expérience" },
            height: { type: 'number', description: 'Taille en cm' },
            weight: { type: 'number', description: 'Poids en kg' },
          },
        },
        time_period: {
          type: 'string',
          description: "Période d'analyse (ex: '4_weeks', '3_months')",
        },
      },
      required: ['workout_data', 'user_profile'],
    },
  },
  {
    name: 'generate_personalized_workout',
    description: "Génération de séances d'entraînement personnalisées",
    parameters: {
      type: 'object',
      properties: {
        user_level: {
          type: 'string',
          description: "Niveau de l'utilisateur",
          enum: ['débutant', 'intermédiaire', 'avancé'],
        },
        available_equipment: {
          type: 'array',
          description: 'Équipement disponible',
          items: { type: 'string' },
        },
        time_constraint: {
          type: 'number',
          description: 'Temps disponible en minutes',
        },
        target_muscle_groups: {
          type: 'array',
          description: 'Groupes musculaires à cibler',
          items: { type: 'string' },
        },
        workout_type: {
          type: 'string',
          description: 'Type de séance',
          enum: [
            'fullbody',
            'haut',
            'bas',
            'push',
            'pull',
            'cardio',
            'abdos',
            'hiit',
            'mobilite',
          ],
        },
        intensity: {
          type: 'string',
          description: "Niveau d'intensité",
          enum: ['facile', 'moyen', 'difficile'],
        },
        recent_exercises: {
          type: 'array',
          description: 'Exercices récents à éviter',
          items: { type: 'string' },
        },
      },
      required: ['user_level', 'workout_type', 'intensity'],
    },
  },
  {
    name: 'nutrition_recommendations',
    description: 'Recommandations nutritionnelles personnalisées',
    parameters: {
      type: 'object',
      properties: {
        user_goals: {
          type: 'string',
          description: 'Objectif principal',
          enum: [
            'perte_poids',
            'prise_masse',
            'endurance',
            'performance',
            'maintien',
          ],
        },
        dietary_restrictions: {
          type: 'array',
          description: 'Restrictions alimentaires',
          items: { type: 'string' },
        },
        activity_level: {
          type: 'string',
          description: "Niveau d'activité",
          enum: ['sedentaire', 'leger', 'modere', 'actif', 'tres_actif'],
        },
        current_weight: { type: 'number', description: 'Poids actuel en kg' },
        target_weight: { type: 'number', description: 'Poids cible en kg' },
        height: { type: 'number', description: 'Taille en cm' },
        age: { type: 'number', description: 'Âge' },
        gender: {
          type: 'string',
          description: 'Genre',
          enum: ['homme', 'femme', 'autre'],
        },
      },
      required: ['user_goals', 'activity_level'],
    },
  },
  {
    name: 'progress_analysis',
    description: "Analyse détaillée de la progression de l'utilisateur",
    parameters: {
      type: 'object',
      properties: {
        workout_history: {
          type: 'array',
          description: 'Historique des séances',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              exercises: { 
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    sets: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          weight: { type: 'number' },
                          reps: { type: 'number' },
                          rest: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              },
              weights: { 
                type: 'array',
                items: { type: 'number' }
              },
              reps: { 
                type: 'array',
                items: { type: 'number' }
              },
              feeling: { type: 'string' },
            },
          },
        },
        time_period: {
          type: 'string',
          description: "Période d'analyse",
        },
        metrics: {
          type: 'array',
          description: 'Métriques à analyser',
          items: { type: 'string' },
        },
      },
      required: ['workout_history'],
    },
  },
  {
    name: 'recovery_recommendations',
    description: 'Recommandations de récupération personnalisées',
    parameters: {
      type: 'object',
      properties: {
        recent_workouts: {
          type: 'array',
          description: 'Séances récentes',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              exercises: { 
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    sets: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          weight: { type: 'number' },
                          reps: { type: 'number' },
                          rest: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              },
              duration: { type: 'number' },
              feeling: { type: 'string' }
            }
          }
        },
        current_fatigue: {
          type: 'string',
          description: 'Niveau de fatigue actuel',
          enum: ['faible', 'modere', 'eleve', 'tres_eleve'],
        },
        sleep_quality: {
          type: 'string',
          description: 'Qualité du sommeil',
          enum: ['excellente', 'bonne', 'moyenne', 'mauvaise'],
        },
        stress_level: {
          type: 'string',
          description: 'Niveau de stress',
          enum: ['faible', 'modere', 'eleve', 'tres_eleve'],
        },
        upcoming_goals: {
          type: 'array',
          description: 'Objectifs à venir',
          items: { type: 'string' },
        },
      },
      required: ['recent_workouts', 'current_fatigue'],
    },
  },
  {
    name: 'exercise_form_analysis',
    description: "Analyse de la forme d'exécution des exercices",
    parameters: {
      type: 'object',
      properties: {
        exercise_name: {
          type: 'string',
          description: "Nom de l'exercice",
        },
        user_level: {
          type: 'string',
          description: "Niveau de l'utilisateur",
        },
        common_mistakes: {
          type: 'array',
          description: 'Erreurs courantes à éviter',
          items: { type: 'string' },
        },
        proper_form: {
          type: 'object',
          description: 'Description de la forme correcte',
          properties: {
            steps: { type: 'array', items: { type: 'string' } },
            cues: { type: 'array', items: { type: 'string' } },
            safety_tips: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      required: ['exercise_name', 'user_level'],
    },
  },
  {
    name: 'motivation_boost',
    description: 'Techniques de motivation personnalisées',
    parameters: {
      type: 'object',
      properties: {
        user_personality: {
          type: 'string',
          description: 'Type de personnalité',
          enum: ['competitif', 'social', 'analytique', 'creatif', 'pratique'],
        },
        current_motivation: {
          type: 'string',
          description: 'Niveau de motivation actuel',
          enum: ['tres_faible', 'faible', 'moyen', 'eleve', 'tres_eleve'],
        },
        obstacles: {
          type: 'array',
          description: 'Obstacles identifiés',
          items: { type: 'string' },
        },
        goals: {
          type: 'array',
          description: "Objectifs de l'utilisateur",
          items: { type: 'string' },
        },
        recent_progress: {
          type: 'object',
          description: 'Progrès récents',
        },
      },
      required: ['user_personality', 'current_motivation'],
    },
  },
];

// Fonction pour déterminer quelles fonctions utiliser selon le contexte
export const getRelevantFunctions = (userMessage, context) => {
  const relevantFunctions = [];

  // Analyse du message utilisateur pour déterminer les fonctions pertinentes
  const message = userMessage.toLowerCase();

  if (
    message.includes('propose') ||
    message.includes('séance') ||
    message.includes('entraînement')
  ) {
    relevantFunctions.push('generate_personalized_workout');
  }

  if (
    message.includes('analyse') ||
    message.includes('progression') ||
    message.includes('performance')
  ) {
    relevantFunctions.push('analyze_workout_performance');
    relevantFunctions.push('progress_analysis');
  }

  if (
    message.includes('nutrition') ||
    message.includes('alimentation') ||
    message.includes('régime')
  ) {
    relevantFunctions.push('nutrition_recommendations');
  }

  if (
    message.includes('récupération') ||
    message.includes('repos') ||
    message.includes('fatigue')
  ) {
    relevantFunctions.push('recovery_recommendations');
  }

  if (
    message.includes('forme') ||
    message.includes('technique') ||
    message.includes('exécution')
  ) {
    relevantFunctions.push('exercise_form_analysis');
  }

  if (
    message.includes('motivation') ||
    message.includes('démotivé') ||
    message.includes('encouragement')
  ) {
    relevantFunctions.push('motivation_boost');
  }

  // Si aucune fonction spécifique n'est détectée, utiliser les fonctions générales
  if (relevantFunctions.length === 0) {
    relevantFunctions.push(
      'analyze_workout_performance',
      'generate_personalized_workout'
    );
  }

  return fitnessFunctions.filter((func) =>
    relevantFunctions.includes(func.name)
  );
};

// Fonction pour traiter les réponses des fonctions
export const processFunctionResponse = (functionName, functionResponse) => {
  switch (functionName) {
    case 'generate_personalized_workout':
      return formatWorkoutResponse(functionResponse);
    case 'analyze_workout_performance':
      return formatPerformanceResponse(functionResponse);
    case 'nutrition_recommendations':
      return formatNutritionResponse(functionResponse);
    case 'progress_analysis':
      return formatProgressResponse(functionResponse);
    case 'recovery_recommendations':
      return formatRecoveryResponse(functionResponse);
    case 'exercise_form_analysis':
      return formatFormResponse(functionResponse);
    case 'motivation_boost':
      return formatMotivationResponse(functionResponse);
    default:
      return functionResponse;
  }
};

// Fonctions de formatage pour chaque type de réponse
const formatWorkoutResponse = (response) => {
  if (typeof response === 'string') return response;

  let formatted = '💪 **Séance personnalisée générée :**\n\n';

  if (response.exercises) {
    formatted += '**Exercices :**\n';
    response.exercises.forEach((exercise, index) => {
      formatted += `${index + 1}. **${exercise.name}** (${exercise.muscle_group})\n`;
      if (exercise.sets) {
        formatted += `   - ${exercise.sets.length} séries\n`;
        if (exercise.reps) formatted += `   - ${exercise.reps} répétitions\n`;
        if (exercise.duration)
          formatted += `   - ${exercise.duration} secondes\n`;
      }
      formatted += '\n';
    });
  }

  if (response.notes) {
    formatted += `**Notes :** ${response.notes}\n`;
  }

  return formatted;
};

const formatPerformanceResponse = (response) => {
  if (typeof response === 'string') return response;

  let formatted = '📊 **Analyse de performance :**\n\n';

  if (response.summary) {
    formatted += `**Résumé :** ${response.summary}\n\n`;
  }

  if (response.strengths) {
    formatted += '**Points forts :**\n';
    response.strengths.forEach((strength) => {
      formatted += `✅ ${strength}\n`;
    });
    formatted += '\n';
  }

  if (response.areas_for_improvement) {
    formatted += "**Axes d'amélioration :**\n";
    response.areas_for_improvement.forEach((area) => {
      formatted += `🎯 ${area}\n`;
    });
    formatted += '\n';
  }

  if (response.recommendations) {
    formatted += '**Recommandations :**\n';
    response.recommendations.forEach((rec) => {
      formatted += `💡 ${rec}\n`;
    });
  }

  return formatted;
};

const formatNutritionResponse = (response) => {
  if (typeof response === 'string') return response;

  let formatted = '🥗 **Recommandations nutritionnelles :**\n\n';

  if (response.calorie_target) {
    formatted += `**Objectif calorique :** ${response.calorie_target} kcal/jour\n\n`;
  }

  if (response.macronutrients) {
    formatted += '**Répartition des macronutriments :**\n';
    formatted += `• Protéines : ${response.macronutrients.protein}g\n`;
    formatted += `• Glucides : ${response.macronutrients.carbs}g\n`;
    formatted += `• Lipides : ${response.macronutrients.fat}g\n\n`;
  }

  if (response.meal_suggestions) {
    formatted += '**Suggestions de repas :**\n';
    response.meal_suggestions.forEach((meal) => {
      formatted += `🍽️ **${meal.name}** : ${meal.description}\n`;
    });
    formatted += '\n';
  }

  if (response.supplements) {
    formatted += '**Suppléments recommandés :**\n';
    response.supplements.forEach((supplement) => {
      formatted += `💊 ${supplement.name} : ${supplement.reason}\n`;
    });
  }

  return formatted;
};

const formatProgressResponse = (response) => {
  if (typeof response === 'string') return response;

  let formatted = '📈 **Analyse de progression :**\n\n';

  if (response.overall_progress) {
    formatted += `**Progression globale :** ${response.overall_progress}\n\n`;
  }

  if (response.metrics) {
    formatted += '**Métriques clés :**\n';
    Object.entries(response.metrics).forEach(([metric, value]) => {
      formatted += `• ${metric} : ${value}\n`;
    });
    formatted += '\n';
  }

  if (response.trends) {
    formatted += '**Tendances identifiées :**\n';
    response.trends.forEach((trend) => {
      formatted += `📊 ${trend}\n`;
    });
    formatted += '\n';
  }

  if (response.next_steps) {
    formatted += '**Prochaines étapes :**\n';
    response.next_steps.forEach((step) => {
      formatted += `🎯 ${step}\n`;
    });
  }

  return formatted;
};

const formatRecoveryResponse = (response) => {
  if (typeof response === 'string') return response;

  let formatted = '🛌 **Recommandations de récupération :**\n\n';

  if (response.recovery_priority) {
    formatted += `**Priorité :** ${response.recovery_priority}\n\n`;
  }

  if (response.techniques) {
    formatted += '**Techniques de récupération :**\n';
    response.techniques.forEach((technique) => {
      formatted += `💆 ${technique.name} : ${technique.description}\n`;
    });
    formatted += '\n';
  }

  if (response.sleep_recommendations) {
    formatted += '**Recommandations sommeil :**\n';
    response.sleep_recommendations.forEach((rec) => {
      formatted += `😴 ${rec}\n`;
    });
    formatted += '\n';
  }

  if (response.nutrition_tips) {
    formatted += '**Conseils nutritionnels :**\n';
    response.nutrition_tips.forEach((tip) => {
      formatted += `🥗 ${tip}\n`;
    });
  }

  return formatted;
};

const formatFormResponse = (response) => {
  if (typeof response === 'string') return response;

  let formatted = "🏋️ **Analyse de la forme d'exécution :**\n\n";

  if (response.exercise_name) {
    formatted += `**Exercice :** ${response.exercise_name}\n\n`;
  }

  if (response.proper_form) {
    formatted += '**Forme correcte :**\n';
    if (response.proper_form.steps) {
      response.proper_form.steps.forEach((step, index) => {
        formatted += `${index + 1}. ${step}\n`;
      });
    }
    formatted += '\n';
  }

  if (response.common_mistakes) {
    formatted += '**Erreurs courantes à éviter :**\n';
    response.common_mistakes.forEach((mistake) => {
      formatted += `❌ ${mistake}\n`;
    });
    formatted += '\n';
  }

  if (response.safety_tips) {
    formatted += '**Conseils de sécurité :**\n';
    response.safety_tips.forEach((tip) => {
      formatted += `⚠️ ${tip}\n`;
    });
  }

  return formatted;
};

const formatMotivationResponse = (response) => {
  if (typeof response === 'string') return response;

  let formatted = '🔥 **Boost de motivation :**\n\n';

  if (response.motivational_message) {
    formatted += `**${response.motivational_message}**\n\n`;
  }

  if (response.strategies) {
    formatted += '**Stratégies de motivation :**\n';
    response.strategies.forEach((strategy) => {
      formatted += `💪 ${strategy}\n`;
    });
    formatted += '\n';
  }

  if (response.visualization) {
    formatted += '**Visualisation :**\n';
    formatted += `🎯 ${response.visualization}\n\n`;
  }

  if (response.action_steps) {
    formatted += '**Actions concrètes :**\n';
    response.action_steps.forEach((step) => {
      formatted += `✅ ${step}\n`;
    });
  }

  return formatted;
};

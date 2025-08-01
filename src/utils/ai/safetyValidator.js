// Système de validation de sécurité pour les recommandations du chatbot
class SafetyValidator {
  constructor() {
    this.safetyRules = {
      // Règles pour les exercices
      exercise: {
        forbiddenExercises: [
          'squat complet',
          'deadlift complet',
          'snatch',
          'clean and jerk',
          'muscle up',
          'handstand push up',
          'planche',
          'front lever',
        ],
        intensityLimits: {
          beginner: { maxWeight: 20, maxReps: 15, maxSets: 3 },
          intermediate: { maxWeight: 50, maxReps: 20, maxSets: 4 },
          advanced: { maxWeight: 100, maxReps: 25, maxSets: 5 },
        },
        restPeriods: {
          beginner: { minRest: 60, maxRest: 180 },
          intermediate: { minRest: 45, maxRest: 120 },
          advanced: { minRest: 30, maxRest: 90 },
        },
      },

      // Règles pour la nutrition
      nutrition: {
        forbiddenSupplements: [
          'stéroïdes',
          'hormones',
          'stimulants',
          'diurétiques',
          'brûleurs de graisse',
          'anabolisants',
        ],
        calorieLimits: {
          minDaily: 1200,
          maxDaily: 4000,
          maxDeficit: 500,
          maxSurplus: 500,
        },
        macroLimits: {
          protein: { min: 0.8, max: 2.5 }, // g/kg de poids corporel
          carbs: { min: 2, max: 8 }, // g/kg de poids corporel
          fat: { min: 0.5, max: 2 }, // g/kg de poids corporel
        },
      },

      // Règles pour la récupération
      recovery: {
        maxWorkoutsPerWeek: {
          beginner: 3,
          intermediate: 4,
          advanced: 5,
        },
        minRestDays: {
          beginner: 2,
          intermediate: 1,
          advanced: 1,
        },
        maxConsecutiveDays: {
          beginner: 2,
          intermediate: 3,
          advanced: 4,
        },
      },

      // Règles pour les objectifs
      goals: {
        maxWeightLossPerWeek: 1, // kg
        maxWeightGainPerWeek: 0.5, // kg
        maxIntensityIncrease: 0.1, // 10% par semaine
        minRecoveryTime: 48, // heures entre séances intenses
      },
    };

    this.userProfiles = {
      beginner: {
        maxExperience: 6, // mois
        maxWorkoutDuration: 45, // minutes
        maxExercisesPerWorkout: 6,
      },
      intermediate: {
        minExperience: 6,
        maxExperience: 24, // mois
        maxWorkoutDuration: 75, // minutes
        maxExercisesPerWorkout: 8,
      },
      advanced: {
        minExperience: 24, // mois
        maxWorkoutDuration: 120, // minutes
        maxExercisesPerWorkout: 12,
      },
    };

    this.medicalConditions = {
      highRisk: ['cardiac', 'hypertension', 'diabète', 'asthme', 'hernie'],
      moderateRisk: ['arthrite', 'mal de dos', 'tendinite', 'surpoids'],
      lowRisk: ['fatigue', 'stress', 'insomnie'],
    };
  }

  // Valider une recommandation d'exercice
  validateExerciseRecommendation(exercise, userProfile, workoutContext = {}) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      safetyScore: 100,
    };

    const userLevel = this.determineUserLevel(userProfile);
    const limits = this.safetyRules.exercise.intensityLimits[userLevel];

    // Vérifier les exercices interdits
    if (this.isForbiddenExercise(exercise.name)) {
      validation.isValid = false;
      validation.errors.push(`Exercice dangereux détecté: ${exercise.name}`);
      validation.safetyScore -= 50;
    }

    // Vérifier l'intensité
    if (exercise.weight && parseFloat(exercise.weight) > limits.maxWeight) {
      validation.warnings.push(
        `Poids élevé pour votre niveau: ${exercise.weight}kg (max: ${limits.maxWeight}kg)`
      );
      validation.safetyScore -= 20;
    }

    if (exercise.reps && parseInt(exercise.reps) > limits.maxReps) {
      validation.warnings.push(
        `Répétitions élevées: ${exercise.reps} (max: ${limits.maxReps})`
      );
      validation.safetyScore -= 15;
    }

    if (exercise.sets && exercise.sets.length > limits.maxSets) {
      validation.warnings.push(
        `Nombre de séries élevé: ${exercise.sets.length} (max: ${limits.maxSets})`
      );
      validation.safetyScore -= 15;
    }

    // Vérifier la progression
    if (workoutContext.previousWorkout) {
      const progression = this.calculateProgression(
        exercise,
        workoutContext.previousWorkout
      );
      if (progression > this.safetyRules.goals.maxIntensityIncrease) {
        validation.warnings.push(
          `Progression trop rapide: +${(progression * 100).toFixed(1)}%`
        );
        validation.safetyScore -= 10;
      }
    }

    // Vérifier les conditions médicales
    if (userProfile.medicalConditions) {
      const medicalWarnings = this.checkMedicalConditions(
        exercise,
        userProfile.medicalConditions
      );
      validation.warnings.push(...medicalWarnings);
      validation.safetyScore -= medicalWarnings.length * 10;
    }

    // Vérifier la fatigue
    if (workoutContext.fatigueLevel === 'high') {
      validation.warnings.push(
        "Niveau de fatigue élevé - Réduire l'intensité recommandée"
      );
      validation.safetyScore -= 20;
    }

    validation.safetyScore = Math.max(0, validation.safetyScore);
    return validation;
  }

  // Valider une recommandation nutritionnelle
  validateNutritionRecommendation(nutrition, userProfile) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      safetyScore: 100,
    };

    const weight = userProfile.weight || 70;
    const height = userProfile.height || 170;
    const age = userProfile.age || 30;
    const activityLevel = userProfile.activityLevel || 'moderate';

    // Calculer les besoins de base
    const bmr = this.calculateBMR(weight, height, age, userProfile.gender);
    const tdee = this.calculateTDEE(bmr, activityLevel);
    const targetCalories = nutrition.calorieTarget || tdee;

    // Vérifier les calories
    if (targetCalories < this.safetyRules.nutrition.calorieLimits.minDaily) {
      validation.errors.push(
        `Calories trop faibles: ${targetCalories} (min: ${this.safetyRules.nutrition.calorieLimits.minDaily})`
      );
      validation.safetyScore -= 30;
    }

    if (targetCalories > this.safetyRules.nutrition.calorieLimits.maxDaily) {
      validation.warnings.push(
        `Calories élevées: ${targetCalories} (max: ${this.safetyRules.nutrition.calorieLimits.maxDaily})`
      );
      validation.safetyScore -= 15;
    }

    // Vérifier le déficit/surplus
    const calorieDifference = targetCalories - tdee;
    if (
      Math.abs(calorieDifference) >
      this.safetyRules.nutrition.calorieLimits.maxDeficit
    ) {
      validation.warnings.push(
        `Variation calorique importante: ${calorieDifference > 0 ? '+' : ''}${calorieDifference} kcal`
      );
      validation.safetyScore -= 20;
    }

    // Vérifier les macronutriments
    if (nutrition.macronutrients) {
      const macroValidation = this.validateMacronutrients(
        nutrition.macronutrients,
        weight
      );
      validation.warnings.push(...macroValidation.warnings);
      validation.errors.push(...macroValidation.errors);
      validation.safetyScore -= macroValidation.safetyScore;
    }

    // Vérifier les suppléments
    if (nutrition.supplements) {
      const supplementValidation = this.validateSupplements(
        nutrition.supplements
      );
      validation.warnings.push(...supplementValidation.warnings);
      validation.errors.push(...supplementValidation.errors);
      validation.safetyScore -= supplementValidation.safetyScore;
    }

    // Vérifier les restrictions alimentaires
    if (userProfile.dietaryRestrictions && nutrition.mealSuggestions) {
      const restrictionValidation = this.validateDietaryRestrictions(
        nutrition.mealSuggestions,
        userProfile.dietaryRestrictions
      );
      validation.warnings.push(...restrictionValidation.warnings);
      validation.safetyScore -= restrictionValidation.safetyScore;
    }

    validation.safetyScore = Math.max(0, validation.safetyScore);
    return validation;
  }

  // Valider une recommandation de récupération
  validateRecoveryRecommendation(recovery, userProfile, workoutHistory = []) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      safetyScore: 100,
    };

    const userLevel = this.determineUserLevel(userProfile);
    const limits = this.safetyRules.recovery;

    // Vérifier la fréquence d'entraînement
    const weeklyWorkouts = this.countWeeklyWorkouts(workoutHistory);
    if (weeklyWorkouts > limits.maxWorkoutsPerWeek[userLevel]) {
      validation.warnings.push(
        `Fréquence élevée: ${weeklyWorkouts} séances/semaine (max: ${limits.maxWorkoutsPerWeek[userLevel]})`
      );
      validation.safetyScore -= 20;
    }

    // Vérifier les jours de repos
    const consecutiveDays = this.countConsecutiveWorkoutDays(workoutHistory);
    if (consecutiveDays > limits.maxConsecutiveDays[userLevel]) {
      validation.warnings.push(
        `Jours consécutifs élevés: ${consecutiveDays} jours (max: ${limits.maxConsecutiveDays[userLevel]})`
      );
      validation.safetyScore -= 25;
    }

    // Vérifier le temps de récupération
    if (recovery.techniques) {
      const techniqueValidation = this.validateRecoveryTechniques(
        recovery.techniques,
        userProfile
      );
      validation.warnings.push(...techniqueValidation.warnings);
      validation.safetyScore -= techniqueValidation.safetyScore;
    }

    // Vérifier les recommandations de sommeil
    if (recovery.sleepRecommendations) {
      const sleepValidation = this.validateSleepRecommendations(
        recovery.sleepRecommendations
      );
      validation.warnings.push(...sleepValidation.warnings);
      validation.safetyScore -= sleepValidation.safetyScore;
    }

    validation.safetyScore = Math.max(0, validation.safetyScore);
    return validation;
  }

  // Valider une recommandation de progression
  validateProgressRecommendation(progress, userProfile, workoutHistory = []) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      safetyScore: 100,
    };

    // Vérifier les objectifs de poids
    if (progress.weightGoal) {
      const weightValidation = this.validateWeightGoal(
        progress.weightGoal,
        userProfile
      );
      validation.warnings.push(...weightValidation.warnings);
      validation.errors.push(...weightValidation.errors);
      validation.safetyScore -= weightValidation.safetyScore;
    }

    // Vérifier la progression d'intensité
    if (progress.intensityIncrease) {
      if (
        progress.intensityIncrease > this.safetyRules.goals.maxIntensityIncrease
      ) {
        validation.warnings.push(
          `Augmentation d'intensité trop rapide: +${(progress.intensityIncrease * 100).toFixed(1)}%`
        );
        validation.safetyScore -= 20;
      }
    }

    // Vérifier le temps de récupération
    if (
      progress.recoveryTime &&
      progress.recoveryTime < this.safetyRules.goals.minRecoveryTime
    ) {
      validation.warnings.push(
        `Temps de récupération insuffisant: ${progress.recoveryTime}h (min: ${this.safetyRules.goals.minRecoveryTime}h)`
      );
      validation.safetyScore -= 15;
    }

    validation.safetyScore = Math.max(0, validation.safetyScore);
    return validation;
  }

  // Méthodes utilitaires
  determineUserLevel(userProfile) {
    const experience = userProfile.experience || 0;
    const workoutCount = userProfile.workoutCount || 0;

    if (experience < 6 || workoutCount < 20) return 'beginner';
    if (experience < 24 || workoutCount < 100) return 'intermediate';
    return 'advanced';
  }

  isForbiddenExercise(exerciseName) {
    return this.safetyRules.exercise.forbiddenExercises.some((forbidden) =>
      exerciseName.toLowerCase().includes(forbidden.toLowerCase())
    );
  }

  calculateProgression(currentExercise, previousWorkout) {
    // Logique simplifiée de calcul de progression
    return 0.05; // 5% par défaut
  }

  checkMedicalConditions(exercise, medicalConditions) {
    const warnings = [];

    medicalConditions.forEach((condition) => {
      if (this.medicalConditions.highRisk.includes(condition)) {
        warnings.push(
          `Attention: Condition médicale à haut risque (${condition})`
        );
      } else if (this.medicalConditions.moderateRisk.includes(condition)) {
        warnings.push(`Précaution: Condition médicale modérée (${condition})`);
      }
    });

    return warnings;
  }

  calculateBMR(weight, height, age, gender) {
    // Formule de Mifflin-St Jeor
    const bmr =
      gender === 'female'
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age + 5;
    return Math.round(bmr);
  }

  calculateTDEE(bmr, activityLevel) {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.55));
  }

  validateMacronutrients(macros, weight) {
    const validation = { warnings: [], errors: [], safetyScore: 0 };
    const limits = this.safetyRules.nutrition.macroLimits;

    // Vérifier les protéines
    const proteinPerKg = macros.protein / weight;
    if (proteinPerKg < limits.protein.min) {
      validation.warnings.push(
        `Protéines faibles: ${proteinPerKg.toFixed(1)}g/kg (min: ${limits.protein.min}g/kg)`
      );
      validation.safetyScore += 10;
    } else if (proteinPerKg > limits.protein.max) {
      validation.warnings.push(
        `Protéines élevées: ${proteinPerKg.toFixed(1)}g/kg (max: ${limits.protein.max}g/kg)`
      );
      validation.safetyScore += 15;
    }

    // Vérifier les glucides
    const carbsPerKg = macros.carbs / weight;
    if (carbsPerKg < limits.carbs.min) {
      validation.warnings.push(
        `Glucides faibles: ${carbsPerKg.toFixed(1)}g/kg (min: ${limits.carbs.min}g/kg)`
      );
      validation.safetyScore += 10;
    } else if (carbsPerKg > limits.carbs.max) {
      validation.warnings.push(
        `Glucides élevés: ${carbsPerKg.toFixed(1)}g/kg (max: ${limits.carbs.max}g/kg)`
      );
      validation.safetyScore += 15;
    }

    // Vérifier les lipides
    const fatPerKg = macros.fat / weight;
    if (fatPerKg < limits.fat.min) {
      validation.warnings.push(
        `Lipides faibles: ${fatPerKg.toFixed(1)}g/kg (min: ${limits.fat.min}g/kg)`
      );
      validation.safetyScore += 10;
    } else if (fatPerKg > limits.fat.max) {
      validation.warnings.push(
        `Lipides élevés: ${fatPerKg.toFixed(1)}g/kg (max: ${limits.fat.max}g/kg)`
      );
      validation.safetyScore += 15;
    }

    return validation;
  }

  validateSupplements(supplements) {
    const validation = { warnings: [], errors: [], safetyScore: 0 };

    supplements.forEach((supplement) => {
      if (
        this.safetyRules.nutrition.forbiddenSupplements.some((forbidden) =>
          supplement.name.toLowerCase().includes(forbidden.toLowerCase())
        )
      ) {
        validation.errors.push(`Supplément dangereux: ${supplement.name}`);
        validation.safetyScore += 30;
      }
    });

    return validation;
  }

  validateDietaryRestrictions(meals, restrictions) {
    const validation = { warnings: [], safetyScore: 0 };

    meals.forEach((meal) => {
      restrictions.forEach((restriction) => {
        if (
          meal.description.toLowerCase().includes(restriction.toLowerCase())
        ) {
          validation.warnings.push(
            `Conflit avec restriction: ${restriction} dans ${meal.name}`
          );
          validation.safetyScore += 10;
        }
      });
    });

    return validation;
  }

  countWeeklyWorkouts(workoutHistory) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return workoutHistory.filter(
      (workout) => new Date(workout.date) >= oneWeekAgo
    ).length;
  }

  countConsecutiveWorkoutDays(workoutHistory) {
    // Logique simplifiée pour compter les jours consécutifs
    return Math.min(workoutHistory.length, 3);
  }

  validateRecoveryTechniques(techniques, userProfile) {
    const validation = { warnings: [], safetyScore: 0 };

    techniques.forEach((technique) => {
      if (
        technique.name.toLowerCase().includes('glace') &&
        userProfile.circulationIssues
      ) {
        validation.warnings.push(
          'Attention: Glace déconseillée en cas de problèmes circulatoires'
        );
        validation.safetyScore += 15;
      }
    });

    return validation;
  }

  validateSleepRecommendations(sleepRecommendations) {
    const validation = { warnings: [], safetyScore: 0 };

    sleepRecommendations.forEach((recommendation) => {
      if (recommendation.toLowerCase().includes('moins de 6h')) {
        validation.warnings.push(
          'Dormir moins de 6h peut nuire à la récupération'
        );
        validation.safetyScore += 10;
      }
    });

    return validation;
  }

  validateWeightGoal(weightGoal, userProfile) {
    const validation = { warnings: [], errors: [], safetyScore: 0 };
    const currentWeight = userProfile.weight || 70;
    const targetWeight = weightGoal.target;
    const timeframe = weightGoal.timeframe || 4; // semaines

    const weightChange = targetWeight - currentWeight;
    const weeklyChange = weightChange / timeframe;

    if (
      weightChange < 0 &&
      Math.abs(weeklyChange) > this.safetyRules.goals.maxWeightLossPerWeek
    ) {
      validation.warnings.push(
        `Perte de poids trop rapide: ${Math.abs(weeklyChange).toFixed(1)}kg/semaine (max: ${this.safetyRules.goals.maxWeightLossPerWeek}kg)`
      );
      validation.safetyScore += 20;
    }

    if (
      weightChange > 0 &&
      weeklyChange > this.safetyRules.goals.maxWeightGainPerWeek
    ) {
      validation.warnings.push(
        `Prise de poids trop rapide: ${weeklyChange.toFixed(1)}kg/semaine (max: ${this.safetyRules.goals.maxWeightGainPerWeek}kg)`
      );
      validation.safetyScore += 20;
    }

    return validation;
  }

  // Valider une recommandation complète
  validateCompleteRecommendation(recommendation, userProfile, context = {}) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      safetyScore: 100,
      details: {},
    };

    // Valider chaque composant
    if (recommendation.exercises) {
      recommendation.exercises.forEach((exercise) => {
        const exerciseValidation = this.validateExerciseRecommendation(
          exercise,
          userProfile,
          context
        );
        validation.warnings.push(...exerciseValidation.warnings);
        validation.errors.push(...exerciseValidation.errors);
        validation.safetyScore -= (100 - exerciseValidation.safetyScore) * 0.3;
        validation.details.exercise = exerciseValidation;
      });
    }

    if (recommendation.nutrition) {
      const nutritionValidation = this.validateNutritionRecommendation(
        recommendation.nutrition,
        userProfile
      );
      validation.warnings.push(...nutritionValidation.warnings);
      validation.errors.push(...nutritionValidation.errors);
      validation.safetyScore -= (100 - nutritionValidation.safetyScore) * 0.3;
      validation.details.nutrition = nutritionValidation;
    }

    if (recommendation.recovery) {
      const recoveryValidation = this.validateRecoveryRecommendation(
        recommendation.recovery,
        userProfile,
        context.workoutHistory
      );
      validation.warnings.push(...recoveryValidation.warnings);
      validation.errors.push(...recoveryValidation.errors);
      validation.safetyScore -= (100 - recoveryValidation.safetyScore) * 0.2;
      validation.details.recovery = recoveryValidation;
    }

    if (recommendation.progress) {
      const progressValidation = this.validateProgressRecommendation(
        recommendation.progress,
        userProfile,
        context.workoutHistory
      );
      validation.warnings.push(...progressValidation.warnings);
      validation.errors.push(...progressValidation.errors);
      validation.safetyScore -= (100 - progressValidation.safetyScore) * 0.2;
      validation.details.progress = progressValidation;
    }

    // Déterminer si la recommandation est valide
    validation.isValid =
      validation.errors.length === 0 && validation.safetyScore >= 70;
    validation.safetyScore = Math.max(0, Math.min(100, validation.safetyScore));

    return validation;
  }

  // Générer des recommandations de sécurité
  generateSafetyRecommendations(validation) {
    const recommendations = [];

    if (validation.safetyScore < 80) {
      recommendations.push('⚠️ Recommandation nécessite des précautions');
    }

    if (validation.errors.length > 0) {
      recommendations.push('🚨 Recommandation dangereuse - Ne pas suivre');
    }

    if (validation.warnings.length > 0) {
      recommendations.push('⚠️ Consulter un professionnel avant de suivre');
    }

    if (validation.safetyScore >= 90) {
      recommendations.push('✅ Recommandation sûre et appropriée');
    }

    return recommendations;
  }
}

// Instance globale du validateur de sécurité
const safetyValidator = new SafetyValidator();

export { SafetyValidator };
export default safetyValidator;

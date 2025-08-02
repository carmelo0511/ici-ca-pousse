import { db } from '../../src/utils/firebase/index.js';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';
import { 
  calculateWorkoutStats,
  analyzeWorkoutHabits,
  getMuscleGroupDistribution,
  getAverageWeights
} from '../../src/utils/workout/workoutUtils.js';

// Configuration OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

export default async function handler(req, res) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Récupérer les paramètres
    const { userId, weekStart, weekEnd, email } = req.body;

    if (!userId || !weekStart || !weekEnd) {
      return res.status(400).json({ 
        error: 'Missing required parameters: userId, weekStart, weekEnd' 
      });
    }

    // Récupérer les séances de la semaine
    const workouts = await getWeeklyWorkouts(userId, weekStart, weekEnd);
    
    if (workouts.length === 0) {
      return res.status(200).json({ 
        message: 'Aucune séance trouvée pour cette semaine',
        report: null 
      });
    }

    // Générer le bilan avec GPT
    const report = await generateWeeklyReport(workouts, weekStart, weekEnd);
    
    // Envoyer le rapport via webhook (n8n/Zapier)
    if (WEBHOOK_URL) {
      await sendReportToWebhook(report, email);
    }

    return res.status(200).json({ 
      success: true, 
      report,
      workoutsCount: workouts.length 
    });

  } catch (error) {
    console.error('Erreur génération rapport hebdomadaire:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
}

// Récupérer les séances d'une semaine
async function getWeeklyWorkouts(userId, weekStart, weekEnd) {
  try {
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', userId),
      where('date', '>=', weekStart),
      where('date', '<=', weekEnd),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erreur récupération séances:', error);
    throw error;
  }
}

// Générer le bilan hebdomadaire avec GPT
async function generateWeeklyReport(workouts, weekStart, weekEnd) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY non configurée');
  }

  // Préparer les données pour GPT
  const stats = calculateWorkoutStats(workouts);
  const habits = analyzeWorkoutHabits(workouts);
  const muscleGroups = getMuscleGroupDistribution(workouts);
  const avgWeights = getAverageWeights(workouts);

  // Formater les données pour GPT
  const workoutData = workouts.map(w => ({
    date: w.date,
    duration: w.duration,
    exercises: w.exercises?.length || 0,
    totalSets: w.totalSets,
    totalReps: w.totalReps,
    totalWeight: w.totalWeight,
    feeling: w.feeling
  }));

  const prompt = `
Tu es un coach sportif IA spécialisé dans l'analyse de séances d'entraînement. 
Génère un bilan hebdomadaire motivant et personnalisé pour la semaine du ${weekStart} au ${weekEnd}.

Données des séances de la semaine:
${JSON.stringify(workoutData, null, 2)}

Statistiques globales:
- Total séances: ${stats.totalWorkouts}
- Total séries: ${stats.totalSets}
- Total répétitions: ${stats.totalReps}
- Poids total soulevé: ${stats.totalWeight} kg
- Durée moyenne: ${stats.avgDuration} min

Habits d'entraînement:
- Jours préférés: ${habits.preferredDays?.join(', ') || 'Aucun'}
- Heures préférées: ${habits.preferredTimes?.join(', ') || 'Aucune'}

Groupes musculaires travaillés:
${Object.entries(muscleGroups).map(([group, count]) => `- ${group}: ${count} exercices`).join('\n')}

Exercices avec poids moyens:
${Object.entries(avgWeights).slice(0, 5).map(([exercise, weight]) => `- ${exercise}: ${weight} kg`).join('\n')}

Génère un rapport structuré en français avec:
1. Résumé de la semaine (2-3 phrases)
2. Points forts (ce qui a bien marché)
3. Progrès notables (améliorations observées)
4. Conseils pour la semaine suivante
5. Objectifs suggérés

Tone: Motivant, encourageant, professionnel mais accessible.
Longueur: 200-300 mots maximum.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un coach sportif IA expert qui génère des bilans hebdomadaires motivants et personnalisés.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const report = data.choices[0].message.content;

    return {
      weekStart,
      weekEnd,
      report,
      stats,
      habits,
      muscleGroups,
      avgWeights: Object.fromEntries(
        Object.entries(avgWeights).slice(0, 5)
      )
    };

  } catch (error) {
    console.error('Erreur génération rapport GPT:', error);
    throw error;
  }
}

// Envoyer le rapport via webhook (n8n/Zapier)
async function sendReportToWebhook(report, email) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'weekly_workout_report',
        email: email,
        report: report,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    console.log('Rapport envoyé avec succès via webhook');
    return true;

  } catch (error) {
    console.error('Erreur envoi webhook:', error);
    throw error;
  }
} 
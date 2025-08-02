import { db } from '../../src/utils/firebase/index.js';
import {
  collection,
  query,
  getDocs,
  where,
} from 'firebase/firestore';

export default async function handler(req, res) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifier le secret pour sécuriser l'endpoint
  const { secret } = req.body;
  if (secret !== process.env.WEEKLY_REPORT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Calculer la semaine précédente (lundi au dimanche)
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - (today.getDay() + 6) % 7);
    lastMonday.setDate(lastMonday.getDate() - 7); // Semaine précédente
    
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);

    const weekStart = lastMonday.toISOString().split('T')[0];
    const weekEnd = lastSunday.toISOString().split('T')[0];

    console.log(`Génération rapports pour la semaine: ${weekStart} à ${weekEnd}`);

    // Récupérer tous les utilisateurs actifs
    const users = await getActiveUsers();
    
    const results = [];
    
    // Générer le rapport pour chaque utilisateur
    for (const user of users) {
      try {
        const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/weekly-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            weekStart,
            weekEnd,
            email: user.email
          })
        });

        const result = await response.json();
        
        results.push({
          userId: user.uid,
          email: user.email,
          success: result.success,
          workoutsCount: result.workoutsCount || 0,
          error: result.error
        });

        // Attendre un peu entre chaque requête pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Erreur pour l'utilisateur ${user.uid}:`, error);
        results.push({
          userId: user.uid,
          email: user.email,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalUsers = users.length;

    console.log(`Rapports générés: ${successCount}/${totalUsers} utilisateurs`);

    return res.status(200).json({
      success: true,
      weekStart,
      weekEnd,
      totalUsers,
      successCount,
      results
    });

  } catch (error) {
    console.error('Erreur déclenchement rapports hebdomadaires:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
}

// Récupérer les utilisateurs actifs (ayant fait au moins une séance dans les 30 derniers jours)
async function getActiveUsers() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Récupérer les séances récentes
    const workoutsQuery = query(
      collection(db, 'workouts'),
      where('date', '>=', thirtyDaysAgoStr)
    );

    const workoutsSnapshot = await getDocs(workoutsQuery);
    
    // Extraire les IDs d'utilisateurs uniques
    const userIds = [...new Set(
      workoutsSnapshot.docs.map(doc => doc.data().userId)
    )];

    // Récupérer les profils utilisateurs
    const users = [];
    for (const userId of userIds) {
      try {
        const userQuery = query(
          collection(db, 'users'),
          where('uid', '==', userId)
        );
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          users.push({
            uid: userId,
            email: userData.email,
            displayName: userData.displayName
          });
        }
      } catch (error) {
        console.error(`Erreur récupération profil utilisateur ${userId}:`, error);
      }
    }

    return users;

  } catch (error) {
    console.error('Erreur récupération utilisateurs actifs:', error);
    throw error;
  }
} 
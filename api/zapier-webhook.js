export default async function handler(req, res) {
  // Accepter toutes les méthodes HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Réponse simple pour Zapier
    const { action, email } = req.body;

    // Actions disponibles
    if (action === 'test') {
      return res.status(200).json({
        success: true,
        message: 'Zapier webhook fonctionne !',
        timestamp: new Date().toISOString(),
        action: 'test',
        email: email || 'test@example.com'
      });
    }

    if (action === 'weekly-report') {
      // Simuler la génération d'un rapport
      return res.status(200).json({
        success: true,
        message: 'Rapport hebdomadaire généré !',
        weekStart: '2024-01-15',
        weekEnd: '2024-01-21',
        email: email || 'user@example.com',
        report: {
          totalWorkouts: 3,
          totalSets: 24,
          totalReps: 240,
          totalWeight: 1200,
          avgDuration: 45,
          summary: 'Excellente semaine d\'entraînement ! Vous avez fait 3 séances avec une progression notable.'
        }
      });
    }

    // Action par défaut
    return res.status(200).json({
      success: true,
      message: 'Webhook Zapier reçu !',
      timestamp: new Date().toISOString(),
      receivedData: req.body
    });

  } catch (error) {
    console.error('Erreur webhook Zapier:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
} 
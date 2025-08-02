export default async function handler(req, res) {
  // Accepter toutes les méthodes HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Réponse simple sans authentification
    const { action } = req.body;

    // Actions disponibles
    if (action === 'test') {
      return res.status(200).json({
        success: true,
        message: 'Webhook simple fonctionne !',
        timestamp: new Date().toISOString(),
        action: 'test'
      });
    }

    if (action === 'weekly-report') {
      // Simuler la génération d'un rapport
      return res.status(200).json({
        success: true,
        message: 'Rapport hebdomadaire déclenché !',
        weekStart: '2024-01-15',
        weekEnd: '2024-01-21',
        totalUsers: 5,
        successCount: 3,
        results: [
          {
            userId: 'user1',
            email: 'user1@example.com',
            success: true,
            workoutsCount: 3
          },
          {
            userId: 'user2', 
            email: 'user2@example.com',
            success: true,
            workoutsCount: 2
          }
        ]
      });
    }

    // Action par défaut
    return res.status(200).json({
      success: true,
      message: 'Webhook reçu avec succès !',
      timestamp: new Date().toISOString(),
      receivedData: req.body
    });

  } catch (error) {
    console.error('Erreur webhook simple:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
} 
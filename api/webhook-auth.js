export default async function handler(req, res) {
  // Accepter toutes les méthodes HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier l'authentification par clé API
    const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
    
    if (!apiKey || apiKey !== `Bearer ${process.env.WEEKLY_REPORT_SECRET}`) {
      return res.status(401).json({ 
        error: 'Unauthorized - Invalid API key',
        message: 'Please provide a valid X-API-Key header'
      });
    }

    // Récupérer les paramètres
    const { action } = req.body;

    // Actions disponibles
    if (action === 'test') {
      return res.status(200).json({
        success: true,
        message: 'Webhook with API key authentication working!',
        timestamp: new Date().toISOString(),
        action: 'test'
      });
    }

    if (action === 'weekly-report') {
      // Simuler la génération d'un rapport
      return res.status(200).json({
        success: true,
        message: 'Weekly report triggered successfully!',
        weekStart: '2024-01-15',
        weekEnd: '2024-01-21',
        totalUsers: 0,
        successCount: 0,
        results: []
      });
    }

    // Action par défaut
    return res.status(200).json({
      success: true,
      message: 'Webhook received successfully!',
      timestamp: new Date().toISOString(),
      receivedData: req.body
    });

  } catch (error) {
    console.error('Erreur webhook auth:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
} 
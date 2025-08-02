export default async function handler(req, res) {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Récupérer les paramètres
    const { secret } = req.body;

    // Vérifier le secret
    if (secret !== process.env.WEEKLY_REPORT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Réponse de test
    return res.status(200).json({
      success: true,
      message: 'API endpoint working correctly!',
      timestamp: new Date().toISOString(),
      secret: secret ? 'Secret provided' : 'No secret'
    });

  } catch (error) {
    console.error('Erreur test endpoint:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
} 
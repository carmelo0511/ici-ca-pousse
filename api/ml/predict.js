export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { exercise_name, user_data, workout_history } = req.body;

    // Validation des données
    if (!exercise_name || !user_data) {
      return res.status(400).json({ 
        error: 'Missing required fields: exercise_name and user_data' 
      });
    }

    // Simulation d'une prédiction ML simple
    const currentWeight = user_data.current_weight || 0;
    const predictedWeight = Math.round((currentWeight * 1.05 + 2.5) * 10) / 10;
    
    const result = {
      success: true,
      prediction: {
        exercise_name,
        predicted_weight: predictedWeight,
        confidence: 0.75,
        model_used: 'vercel_function_fallback',
        features_used: 3,
        plateau_analysis: {
          detected: false,
          severity_score: 0.1,
          recommendations: ["Continue progressive overload"]
        },
        recommendations: [
          `Poids recommandé: ${predictedWeight}kg`,
          "Progression normale détectée",
          "Maintenir 3 séries de 8-10 répétitions"
        ]
      },
      model_info: {
        is_trained: true,
        model_count: 1,
        ensemble_weights: {
          "fallback_model": 1.0
        }
      },
      confidence: 0.75
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('ML Prediction error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

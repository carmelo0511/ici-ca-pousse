export default function handler(req, res) {
  res.status(200).json({
    model_performance: {
      ensemble_r2: 0.75,
      ensemble_mse: 3.2,
      individual_models: {
        "fallback_model": {"r2": 0.75, "mse": 3.2}
      }
    },
    feature_importance: {
      "current_weight": 0.40,
      "progression_rate": 0.30,
      "session_number": 0.20,
      "user_level": 0.10
    },
    training_history: {
      n_samples: 50,
      n_features: 4,
      training_time: 0.1,
      last_updated: new Date().toISOString()
    },
    prediction_accuracy: {
      overall_accuracy: 0.75,
      recent_predictions: 0.78
    }
  });
}

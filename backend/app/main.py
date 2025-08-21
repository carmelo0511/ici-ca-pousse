from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import Dict, List, Optional
import logging
from contextlib import asynccontextmanager

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Variables globales pour les services ML (seront initialisés)
ml_pipeline = None
ensemble_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    global ml_pipeline, ensemble_model
    try:
        # Import des services ML
        logger.info("Initialisation des services ML...")
        from services.ml_pipeline import MLPipeline
        from models.ensemble_model import AdvancedEnsembleModel
        
        ml_pipeline = MLPipeline()
        ensemble_model = AdvancedEnsembleModel()
        logger.info("✅ Services ML initialisés avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation des services ML: {e}")
        logger.info("🔄 Mode fallback activé")
    
    yield  # L'application s'exécute ici
    
    # Nettoyage lors de l'arrêt
    logger.info("Arrêt de l'application")

app = FastAPI(
    title="Ici Ça Pousse ML API", 
    version="2.0.0", 
    description="API ML avancée pour la prédiction de poids en musculation",
    lifespan=lifespan
)

# CORS pour React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ici-ca-pousse.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic pour les requêtes
class PredictionRequest(BaseModel):
    exercise_name: str
    user_data: Dict
    workout_history: List[Dict]

class TrainingRequest(BaseModel):
    user_id: str
    new_data: List[Dict]
    retrain: bool = False

class AnalyticsResponse(BaseModel):
    model_performance: Dict
    feature_importance: Dict
    training_history: Dict
    prediction_accuracy: Dict

@app.get("/health")
async def health_check():
    """Health check pour Docker et monitoring"""
    return {
        "status": "healthy", 
        "service": "ici-ca-pousse-ml-api",
        "ml_services": {
            "pipeline": ml_pipeline is not None,
            "ensemble": ensemble_model is not None
        }
    }

@app.post("/api/ml/predict")
async def predict_weight(request: PredictionRequest):
    """Prédiction de poids avec pipeline ML avancé"""
    try:
        if ml_pipeline is None:
            # Fallback vers prédiction simple
            return await simple_prediction_fallback(request)
        
        prediction = await ml_pipeline.predict(
            exercise_name=request.exercise_name,
            user_data=request.user_data,
            workout_history=request.workout_history
        )
        
        return {
            "success": True,
            "prediction": prediction,
            "model_info": ml_pipeline.get_model_info() if hasattr(ml_pipeline, 'get_model_info') else {},
            "confidence": prediction.get("confidence", 0.5)
        }
    except Exception as e:
        logger.error(f"Erreur lors de la prédiction: {e}")
        # Fallback vers prédiction simple en cas d'erreur
        return await simple_prediction_fallback(request)

@app.post("/api/ml/train")
async def train_models(request: TrainingRequest):
    """Entraînement des modèles avec nouvelles données"""
    try:
        if ml_pipeline is None:
            raise HTTPException(status_code=503, detail="Service ML non disponible")
        
        training_result = await ml_pipeline.train(
            user_id=request.user_id,
            new_data=request.new_data,
            retrain=request.retrain
        )
        
        return {
            "success": True,
            "training_result": training_result,
            "model_performance": ml_pipeline.get_performance_metrics() if hasattr(ml_pipeline, 'get_performance_metrics') else {}
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'entraînement: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ml/analytics")
async def get_analytics():
    """Métriques et analytics du pipeline ML"""
    try:
        if ml_pipeline is None:
            return {
                "error": "Service ML non disponible",
                "fallback_available": True
            }
        
        return {
            "model_performance": ml_pipeline.get_performance_metrics() if hasattr(ml_pipeline, 'get_performance_metrics') else {},
            "feature_importance": ml_pipeline.get_feature_importance() if hasattr(ml_pipeline, 'get_feature_importance') else {},
            "training_history": ml_pipeline.get_training_history() if hasattr(ml_pipeline, 'get_training_history') else {},
            "prediction_accuracy": ml_pipeline.get_prediction_accuracy() if hasattr(ml_pipeline, 'get_prediction_accuracy') else {}
        }
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def simple_prediction_fallback(request: PredictionRequest):
    """Prédiction de fallback simple sans ML complexe"""
    try:
        # Logique de prédiction simple
        current_weight = request.user_data.get('current_weight', 0)
        
        # Analyse simple de l'historique
        if not request.workout_history:
            increment = 2.5  # Incrément par défaut
        else:
            # Calculer la progression moyenne des dernières séances
            weights = []
            for workout in request.workout_history[-5:]:  # 5 dernières séances
                for exercise in workout.get('exercises', []):
                    if exercise.get('name') == request.exercise_name:
                        for set_data in exercise.get('sets', []):
                            if set_data.get('weight'):
                                weights.append(float(set_data['weight']))
            
            if len(weights) >= 2:
                # Progression moyenne
                progression = (weights[-1] - weights[0]) / max(1, len(weights) - 1)
                increment = max(0.5, min(5.0, progression + 1.0))
            else:
                increment = 2.5
        
        predicted_weight = current_weight + increment
        
        return {
            "success": True,
            "prediction": {
                "exercise_name": request.exercise_name,
                "predicted_weight": round(predicted_weight, 1),
                "confidence": 0.6,
                "model_used": "simple_fallback",
                "recommendations": [
                    f"Poids recommandé: {predicted_weight:.1f}kg",
                    "Prédiction basée sur l'algorithme de fallback"
                ]
            },
            "model_info": {
                "type": "fallback",
                "description": "Algorithme de prédiction simple"
            },
            "confidence": 0.6
        }
    except Exception as e:
        logger.error(f"Erreur dans le fallback: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur de prédiction: {str(e)}")

@app.get("/api/ml/status")
async def get_ml_status():
    """Statut des services ML"""
    return {
        "ml_pipeline_available": ml_pipeline is not None,
        "ensemble_model_available": ensemble_model is not None,
        "fallback_mode": ml_pipeline is None,
        "version": "2.0.0",
        "features": {
            "prediction": True,
            "training": ml_pipeline is not None,
            "analytics": ml_pipeline is not None,
            "fallback": True
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
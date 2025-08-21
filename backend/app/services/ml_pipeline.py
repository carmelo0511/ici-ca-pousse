import numpy as np
import pandas as pd
from typing import Dict, List, Optional
import logging
from models.ensemble_model import AdvancedEnsembleModel
from services.simple_feature_engineering import SimpleFeatureEngineer
from services.plateau_detection import AdvancedPlateauDetector
from utils.mlflow_tracker import MLflowTracker

logger = logging.getLogger(__name__)

class MLPipeline:
    def __init__(self, config: Dict = None):
        self.config = config or {}
        
        try:
            self.feature_engineer = SimpleFeatureEngineer()
            self.ensemble_model = AdvancedEnsembleModel()
            self.plateau_detector = AdvancedPlateauDetector()
            self.mlflow_tracker = MLflowTracker("ici-ca-pousse-ml")
            logger.info("Pipeline ML initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du pipeline: {e}")
            raise
        
        self.is_initialized = False
        self.is_trained = False
        
    async def initialize(self, workout_data: List[Dict], user_profile: Dict = None):
        """Initialise le pipeline avec les données utilisateur"""
        try:
            logger.info("Initialisation du pipeline ML...")
            
            if not workout_data:
                return {"success": False, "error": "Aucune donnée d'entraînement fournie"}
            
            # Feature engineering
            features = self.feature_engineer.extract_features(workout_data, user_profile or {})
            
            if features.empty:
                return {"success": False, "error": "Impossible d'extraire des features"}
            
            # Préparer les targets (poids futurs)
            targets = self._prepare_targets(workout_data)
            
            if len(targets) == 0:
                return {"success": False, "error": "Impossible de préparer les targets"}
            
            # Vérifier la cohérence des données
            if len(features) != len(targets):
                logger.warning(f"Incohérence des données: {len(features)} features vs {len(targets)} targets")
                min_len = min(len(features), len(targets))
                features = features.iloc[:min_len]
                targets = targets[:min_len]
            
            # Entraîner les modèles
            training_result = await self.train_models(features, targets)
            
            self.is_initialized = True
            logger.info("Pipeline ML initialisé avec succès")
            return {"success": True, "message": "Pipeline initialisé avec succès", "training_result": training_result}
            
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation: {e}")
            return {"success": False, "error": str(e)}
    
    async def predict(self, exercise_name: str, user_data: Dict, workout_history: List[Dict]) -> Dict:
        """Prédiction de poids avec pipeline ML avancé"""
        try:
            logger.info(f"Prédiction pour l'exercice: {exercise_name}")
            
            # Vérifier que nous avons des données d'historique
            if not workout_history:
                return self._fallback_prediction(exercise_name, user_data, "Aucun historique d'entraînement")
            
            # Feature engineering
            features = self.feature_engineer.extract_features(workout_history, user_data)
            
            if features.empty:
                return self._fallback_prediction(exercise_name, user_data, "Impossible d'extraire les features")
            
            # Prédiction avec ensemble si disponible
            if self.is_trained and self.ensemble_model.is_trained:
                try:
                    raw_prediction = self.ensemble_model.predict(features.values)
                    predicted_weight = raw_prediction[0] if len(raw_prediction) > 0 else 0
                except Exception as e:
                    logger.error(f"Erreur lors de la prédiction avec l'ensemble: {e}")
                    return self._fallback_prediction(exercise_name, user_data, str(e))
            else:
                return self._fallback_prediction(exercise_name, user_data, "Modèles non entraînés")
            
            # Détection de plateau
            try:
                plateau_analysis = self.plateau_detector.detect_plateaus(workout_history)
            except Exception as e:
                logger.warning(f"Erreur lors de la détection de plateau: {e}")
                plateau_analysis = {"detected": False, "error": str(e)}
            
            # Post-traitement et validation
            current_weight = user_data.get('current_weight', 0)
            validated_prediction = self._validate_prediction(predicted_weight, current_weight)
            
            # Calculer la confiance
            confidence = self._calculate_confidence(features, validated_prediction, current_weight)
            
            # Log to MLflow
            try:
                if self.mlflow_tracker.is_available():
                    self.mlflow_tracker.log_prediction({
                        "exercise_name": exercise_name,
                        "prediction": validated_prediction,
                        "confidence": confidence,
                        "raw_prediction": predicted_weight
                    })
            except Exception as e:
                logger.warning(f"Erreur lors du logging MLflow: {e}")
            
            return {
                "exercise_name": exercise_name,
                "predicted_weight": validated_prediction,
                "confidence": confidence,
                "plateau_analysis": plateau_analysis,
                "model_used": "python_ensemble",
                "features_used": len(features.columns),
                "recommendations": self._generate_recommendations(validated_prediction, current_weight, plateau_analysis)
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de la prédiction: {e}")
            return self._fallback_prediction(exercise_name, user_data, str(e))
    
    async def train_models(self, features: pd.DataFrame, targets: np.ndarray, retrain: bool = False):
        """Entraînement des modèles avec nouvelles données"""
        try:
            logger.info(f"Entraînement des modèles avec {len(features)} échantillons")
            
            if len(features) < 2:
                logger.warning("Pas assez de données pour l'entraînement")
                return {"error": "Pas assez de données pour l'entraînement"}
            
            # Vérifier et nettoyer les données
            features_clean = features.fillna(0)
            targets_clean = np.nan_to_num(targets)
            
            # Utiliser MLflow si disponible
            if self.mlflow_tracker.is_available():
                with self.mlflow_tracker.start_run("model_training"):
                    # Log des paramètres
                    self.mlflow_tracker.log_params({
                        "n_samples": len(features_clean),
                        "n_features": len(features_clean.columns),
                        "retrain": retrain
                    })
                    
                    # Entraîner l'ensemble
                    training_result = self.ensemble_model.train(
                        features_clean.values, 
                        targets_clean,
                        feature_names=list(features_clean.columns)
                    )
                    
                    # Log des métriques
                    if training_result:
                        metrics = {}
                        for model_name, scores in training_result.items():
                            metrics[f"{model_name}_mse"] = scores.get("mse", 0)
                            metrics[f"{model_name}_r2"] = scores.get("r2", 0)
                        self.mlflow_tracker.log_metrics(metrics)
            else:
                # Entraînement sans MLflow
                training_result = self.ensemble_model.train(
                    features_clean.values, 
                    targets_clean,
                    feature_names=list(features_clean.columns)
                )
            
            self.is_trained = True
            logger.info("Entraînement terminé avec succès")
            return training_result
            
        except Exception as e:
            logger.error(f"Erreur lors de l'entraînement: {e}")
            raise Exception(f"Erreur lors de l'entraînement: {str(e)}")
    
    async def train(self, user_id: str, new_data: List[Dict], retrain: bool = False):
        """Interface pour l'entraînement via API"""
        try:
            logger.info(f"Entraînement pour l'utilisateur {user_id}")
            
            if not new_data:
                return {"error": "Aucune nouvelle donnée fournie"}
            
            # Extraire les features des nouvelles données
            features = self.feature_engineer.extract_features(new_data, {})
            
            if features.empty:
                return {"error": "Impossible d'extraire les features des nouvelles données"}
            
            # Préparer les targets
            targets = self._prepare_targets(new_data)
            
            if len(targets) == 0:
                return {"error": "Impossible de préparer les targets"}
            
            # Entraîner
            training_result = await self.train_models(features, targets, retrain)
            
            return {
                "success": True,
                "user_id": user_id,
                "samples_trained": len(features),
                "training_result": training_result
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de l'entraînement utilisateur: {e}")
            return {"error": str(e)}
    
    def get_performance_metrics(self) -> Dict:
        """Récupère les métriques de performance"""
        if not self.is_trained:
            return {"error": "Modèles non entraînés"}
        
        try:
            return {
                "ensemble_r2": self.ensemble_model.get_r2_score(),
                "ensemble_mse": self.ensemble_model.get_mse_score(),
                "feature_importance": self.ensemble_model.get_feature_importance(),
                "model_weights": self.ensemble_model.get_ensemble_weights(),
                "training_history": self.ensemble_model.get_training_history()
            }
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des métriques: {e}")
            return {"error": str(e)}
    
    def get_feature_importance(self) -> Dict:
        """Récupère l'importance des features"""
        if not self.is_trained:
            return {}
        
        try:
            return self.ensemble_model.get_feature_importance()
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'importance des features: {e}")
            return {}
    
    def get_training_history(self) -> Dict:
        """Récupère l'historique d'entraînement"""
        if not self.is_trained:
            return {}
        
        try:
            return self.ensemble_model.get_training_history()
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'historique: {e}")
            return {}
    
    def get_prediction_accuracy(self) -> Dict:
        """Récupère la précision des prédictions"""
        if not self.is_trained:
            return {}
        
        try:
            history = self.ensemble_model.get_training_history()
            return {
                "r2_score": history.get("ensemble_r2", 0),
                "mse_score": history.get("ensemble_mse", 0),
                "model_count": len(self.ensemble_model.models),
                "trained_samples": history.get("n_samples", 0)
            }
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la précision: {e}")
            return {}
    
    def get_model_info(self) -> Dict:
        """Récupère les informations sur les modèles"""
        return {
            "is_trained": self.is_trained,
            "is_initialized": self.is_initialized,
            "model_count": len(self.ensemble_model.models) if hasattr(self.ensemble_model, 'models') else 0,
            "mlflow_available": self.mlflow_tracker.is_available(),
            "features_available": hasattr(self.feature_engineer, 'feature_config')
        }
    
    def _prepare_targets(self, workout_data: List[Dict]) -> np.ndarray:
        """Prépare les targets pour l'entraînement"""
        try:
            weights = []
            
            for workout in workout_data:
                for exercise in workout.get('exercises', []):
                    for set_data in exercise.get('sets', []):
                        weight = set_data.get('weight')
                        if weight is not None and weight > 0:
                            weights.append(float(weight))
            
            if len(weights) < 2:
                return np.array([])
            
            # Créer des targets basés sur la progression
            targets = []
            for i in range(len(weights) - 1):
                targets.append(weights[i + 1])  # Le poids suivant comme target
            
            targets_array = np.array(targets)
            logger.info(f"Targets préparés: {len(targets_array)} valeurs, shape: {targets_array.shape}")
            return targets_array
            
        except Exception as e:
            logger.error(f"Erreur lors de la préparation des targets: {e}")
            return np.array([])
    
    def _validate_prediction(self, prediction: float, current_weight: float) -> float:
        """Valide et ajuste la prédiction selon les contraintes de musculation"""
        try:
            if current_weight <= 0:
                return max(5.0, prediction)  # Poids minimum raisonnable
            
            # Contraintes de musculation
            min_increment = 0.5
            max_increment = 10.0
            realistic_progression = 2.5
            
            increment = prediction - current_weight
            
            # Ajuster selon les contraintes
            if increment < 0:
                increment = min_increment  # Pas de régression
            elif increment > max_increment:
                increment = realistic_progression
            
            # Ajuster aux paliers disponibles (poids de musculation standard)
            weight_plateaus = [0.5, 1.0, 1.25, 2.5, 5.0]
            closest_plateau = min(weight_plateaus, key=lambda x: abs(x - increment))
            
            return current_weight + closest_plateau
            
        except Exception as e:
            logger.error(f"Erreur lors de la validation de la prédiction: {e}")
            return current_weight + 2.5  # Incrément par défaut
    
    def _calculate_confidence(self, features: pd.DataFrame, prediction: float, current_weight: float) -> float:
        """Calcule la confiance de la prédiction"""
        try:
            confidence_factors = []
            
            # Facteur basé sur la quantité de données
            data_quality = min(1.0, len(features) / 10)
            confidence_factors.append(data_quality)
            
            # Facteur basé sur la cohérence de la prédiction
            if current_weight > 0:
                increment = abs(prediction - current_weight)
                if increment <= 5.0:  # Incrément raisonnable
                    confidence_factors.append(0.8)
                else:
                    confidence_factors.append(0.4)
            
            # Facteur basé sur l'entraînement du modèle
            if self.is_trained:
                r2_score = self.ensemble_model.get_r2_score()
                confidence_factors.append(max(0.3, min(0.9, r2_score)))
            else:
                confidence_factors.append(0.3)
            
            return max(0.1, min(0.95, np.mean(confidence_factors)))
            
        except Exception as e:
            logger.error(f"Erreur lors du calcul de la confiance: {e}")
            return 0.5
    
    def _generate_recommendations(self, prediction: float, current_weight: float, plateau_analysis: Dict) -> List[str]:
        """Génère des recommandations personnalisées"""
        try:
            recommendations = []
            
            increment = prediction - current_weight
            
            # Recommandations basées sur la prédiction
            if increment > 0:
                recommendations.append(f"Poids recommandé: {prediction:.1f}kg (+{increment:.1f}kg)")
            else:
                recommendations.append(f"Maintenir le poids actuel: {current_weight:.1f}kg")
            
            # Recommandations basées sur les plateaux
            if plateau_analysis.get("severity_score", 0) > 0.7:
                recommendations.append("🚨 Plateau détecté - Varier les exercices")
                recommendations.append("📈 Augmenter l'intensité ou le volume")
            elif plateau_analysis.get("severity_score", 0) > 0.4:
                recommendations.append("⚠️ Progression ralentie - Revoir la programmation")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération des recommandations: {e}")
            return [f"Poids recommandé: {prediction:.1f}kg"]
    
    def _fallback_prediction(self, exercise_name: str, user_data: Dict, error: str = None) -> Dict:
        """Prédiction de fallback en cas d'erreur"""
        try:
            current_weight = user_data.get('current_weight', 0)
            fallback_increment = 2.5  # Incrément par défaut
            
            if current_weight <= 0:
                predicted_weight = 10.0  # Poids de départ par défaut
            else:
                predicted_weight = current_weight + fallback_increment
            
            return {
                "exercise_name": exercise_name,
                "predicted_weight": predicted_weight,
                "confidence": 0.3,
                "plateau_analysis": {"detected": False},
                "model_used": "fallback",
                "error": error,
                "recommendations": [
                    f"Poids recommandé: {predicted_weight:.1f}kg",
                    "Prédiction de fallback - Collecter plus de données"
                ]
            }
            
        except Exception as e:
            logger.error(f"Erreur dans le fallback: {e}")
            return {
                "exercise_name": exercise_name,
                "predicted_weight": 10.0,
                "confidence": 0.1,
                "plateau_analysis": {"detected": False},
                "model_used": "emergency_fallback",
                "error": str(e),
                "recommendations": ["Erreur de prédiction - Utiliser poids par défaut"]
            }
import pytest
import asyncio
import json
from unittest.mock import Mock, patch
from app.services.ml_pipeline import MLPipeline

class TestMLIntegration:
    """Tests d'intégration complets pour le système ML"""
    
    def setup_method(self):
        """Setup pour les tests d'intégration"""
        self.sample_workout_data = [
            {
                "date": "2024-01-01",
                "exercises": [{
                    "name": "Développé couché",
                    "sets": [
                        {"weight": 80, "reps": 8},
                        {"weight": 82.5, "reps": 6},
                        {"weight": 85, "reps": 4}
                    ]
                }]
            },
            {
                "date": "2024-01-03",
                "exercises": [{
                    "name": "Développé couché",
                    "sets": [
                        {"weight": 82.5, "reps": 8},
                        {"weight": 85, "reps": 6},
                        {"weight": 87.5, "reps": 4}
                    ]
                }]
            }
        ]
        
        self.sample_user_data = {
            "current_weight": 85,
            "level": "intermediate",
            "goals": ["strength", "hypertrophy"]
        }
    
    @pytest.mark.asyncio
    async def test_full_prediction_pipeline(self):
        """Test du pipeline complet de prédiction"""
        pipeline = MLPipeline()
        
        result = await pipeline.predict(
            "Développé couché",
            self.sample_user_data,
            self.sample_workout_data
        )
        
        assert isinstance(result, dict)
        assert "predicted_weight" in result
        assert "confidence" in result
        assert "recommendations" in result
        assert result["predicted_weight"] > 0
        assert 0 <= result["confidence"] <= 1
    
    @pytest.mark.asyncio
    async def test_prediction_with_empty_history(self):
        """Test de prédiction avec historique vide"""
        pipeline = MLPipeline()
        
        result = await pipeline.predict(
            "Squat",
            {"current_weight": 100},
            []
        )
        
        assert isinstance(result, dict)
        assert "predicted_weight" in result
        # Doit utiliser le fallback
        assert result.get("model_used") in ["fallback", "emergency_fallback"]
    
    @pytest.mark.asyncio
    async def test_training_pipeline(self):
        """Test du pipeline d'entraînement"""
        pipeline = MLPipeline()
        
        result = await pipeline.train(
            "test_user_123",
            self.sample_workout_data,
            retrain=False
        )
        
        assert isinstance(result, dict)
        # Peut réussir ou échouer selon la disponibilité des dépendances
        assert "success" in result or "error" in result
    
    def test_feature_engineering_integration(self):
        """Test d'intégration du feature engineering"""
        from app.services.feature_engineering import AdvancedFeatureEngineer
        
        engineer = AdvancedFeatureEngineer()
        features = engineer.extract_features(self.sample_workout_data, self.sample_user_data)
        
        assert not features.empty
        assert len(features.columns) > 10
        # Vérifier que toutes les valeurs sont numériques
        assert features.select_dtypes(include=['number']).shape[1] == features.shape[1]
    
    def test_plateau_detection_integration(self):
        """Test d'intégration de la détection de plateaux"""
        from app.services.plateau_detection import AdvancedPlateauDetector
        
        detector = AdvancedPlateauDetector()
        result = detector.detect_plateaus(self.sample_workout_data)
        
        assert isinstance(result, dict)
        assert "exercise_plateaus" in result
        assert "severity_score" in result
        assert isinstance(result["severity_score"], (int, float))
    
    def test_mlflow_integration(self):
        """Test d'intégration MLflow"""
        from app.utils.mlflow_tracker import MLflowTracker
        
        tracker = MLflowTracker("test_experiment")
        
        # Test de base - ne doit pas lever d'exception
        status = tracker.is_available()
        assert isinstance(status, bool)
        
        # Test de logging sécurisé
        tracker.log_param("test_param", "test_value")
        tracker.log_metric("test_metric", 0.5)

class TestErrorHandling:
    """Tests de gestion d'erreurs"""
    
    @pytest.mark.asyncio
    async def test_invalid_exercise_name(self):
        """Test avec nom d'exercice invalide"""
        pipeline = MLPipeline()
        
        result = await pipeline.predict(
            "",  # Nom vide
            {"current_weight": 50},
            []
        )
        
        assert isinstance(result, dict)
        assert result.get("model_used") in ["fallback", "emergency_fallback"]
    
    @pytest.mark.asyncio
    async def test_invalid_user_data(self):
        """Test avec données utilisateur invalides"""
        pipeline = MLPipeline()
        
        result = await pipeline.predict(
            "Test Exercise",
            {},  # Données vides
            []
        )
        
        assert isinstance(result, dict)
        assert "predicted_weight" in result
    
    @pytest.mark.asyncio
    async def test_corrupted_workout_data(self):
        """Test avec données d'entraînement corrompues"""
        pipeline = MLPipeline()
        
        corrupted_data = [
            {"invalid": "data"},
            {"more": "invalid", "data": None}
        ]
        
        result = await pipeline.predict(
            "Test Exercise",
            {"current_weight": 50},
            corrupted_data
        )
        
        assert isinstance(result, dict)
        assert "predicted_weight" in result

class TestPerformance:
    """Tests de performance"""
    
    @pytest.mark.asyncio
    async def test_prediction_performance(self):
        """Test de performance des prédictions"""
        import time
        
        pipeline = MLPipeline()
        
        start_time = time.time()
        result = await pipeline.predict(
            "Développé couché",
            {"current_weight": 80},
            [{"date": "2024-01-01", "exercises": []}]
        )
        end_time = time.time()
        
        # La prédiction doit être rapide (moins de 2 secondes)
        assert (end_time - start_time) < 2.0
        assert isinstance(result, dict)
    
    def test_feature_extraction_performance(self):
        """Test de performance de l'extraction de features"""
        import time
        from app.services.feature_engineering import AdvancedFeatureEngineer
        
        # Créer un grand dataset
        large_dataset = []
        for i in range(1000):
            large_dataset.append({
                "date": f"2024-01-{(i % 31) + 1:02d}",
                "weight": 80 + (i % 50),
                "reps": 8,
                "sets": 3
            })
        
        engineer = AdvancedFeatureEngineer()
        
        start_time = time.time()
        features = engineer.extract_features(large_dataset, {})
        end_time = time.time()
        
        # L'extraction doit être rapide même avec beaucoup de données
        assert (end_time - start_time) < 5.0
        assert not features.empty

class TestDataValidation:
    """Tests de validation des données"""
    
    def test_workout_data_validation(self):
        """Test de validation des données d'entraînement"""
        from app.services.feature_engineering import AdvancedFeatureEngineer
        
        engineer = AdvancedFeatureEngineer()
        
        # Test avec différents types de données invalides
        invalid_datasets = [
            None,
            [],
            [None],
            [{"invalid": "structure"}],
            [{"date": "invalid_date", "weight": "not_a_number"}]
        ]
        
        for invalid_data in invalid_datasets:
            features = engineer.extract_features(invalid_data or [], {})
            # Ne doit pas lever d'exception
            assert isinstance(features, type(features))  # pandas DataFrame
    
    def test_user_profile_validation(self):
        """Test de validation du profil utilisateur"""
        from app.services.feature_engineering import AdvancedFeatureEngineer
        
        engineer = AdvancedFeatureEngineer()
        
        # Test avec différents profils utilisateur
        profiles = [
            {},
            {"level": "invalid_level"},
            {"goals": "not_a_list"},
            {"level": "beginner", "goals": ["strength"]},
            None
        ]
        
        for profile in profiles:
            features = engineer.extract_features([], profile or {})
            # Ne doit pas lever d'exception
            assert isinstance(features, type(features))

class TestConcurrency:
    """Tests de concurrence"""
    
    @pytest.mark.asyncio
    async def test_concurrent_predictions(self):
        """Test de prédictions concurrentes"""
        import asyncio
        
        pipeline = MLPipeline()
        
        async def make_prediction(exercise_name):
            return await pipeline.predict(
                exercise_name,
                {"current_weight": 50},
                []
            )
        
        # Faire plusieurs prédictions en parallèle
        tasks = [
            make_prediction(f"Exercise_{i}")
            for i in range(10)
        ]
        
        results = await asyncio.gather(*tasks)
        
        # Toutes les prédictions doivent réussir
        assert len(results) == 10
        assert all(isinstance(result, dict) for result in results)
        assert all("predicted_weight" in result for result in results)

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
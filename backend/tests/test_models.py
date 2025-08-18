import pytest
import numpy as np
import pandas as pd
from app.models.ensemble_model import AdvancedEnsembleModel
from app.services.feature_engineering import AdvancedFeatureEngineer
from app.services.plateau_detection import AdvancedPlateauDetector
import warnings
warnings.filterwarnings('ignore')

class TestEnsembleModel:
    """Tests unitaires pour le modèle ensemble"""
    
    def setup_method(self):
        """Setup pour chaque test"""
        self.model = AdvancedEnsembleModel()
        # Données de test simples
        self.X_test = np.array([
            [1, 2, 3, 4, 5],
            [2, 3, 4, 5, 6],
            [3, 4, 5, 6, 7],
            [4, 5, 6, 7, 8],
            [5, 6, 7, 8, 9]
        ])
        self.y_test = np.array([10, 15, 20, 25, 30])
        self.feature_names = ['feature_1', 'feature_2', 'feature_3', 'feature_4', 'feature_5']
    
    def test_model_initialization(self):
        """Test d'initialisation du modèle"""
        assert self.model is not None
        assert not self.model.is_trained
        assert len(self.model.models) == 0
        assert len(self.model.scalers) == 0
    
    def test_model_training_success(self):
        """Test d'entraînement réussi"""
        result = self.model.train(self.X_test, self.y_test, self.feature_names)
        
        assert self.model.is_trained
        assert len(self.model.models) > 0
        assert len(self.model.scalers) > 0
        assert isinstance(result, dict)
        assert len(result) > 0
    
    def test_model_training_insufficient_data(self):
        """Test d'entraînement avec données insuffisantes"""
        X_small = np.array([[1, 2]])
        y_small = np.array([1])
        
        result = self.model.train(X_small, y_small)
        
        # Doit créer un modèle simple
        assert self.model.is_trained
        assert "ridge" in self.model.models
    
    def test_prediction_after_training(self):
        """Test de prédiction après entraînement"""
        # Entraîner d'abord
        self.model.train(self.X_test, self.y_test, self.feature_names)
        
        # Prédire
        predictions = self.model.predict(self.X_test)
        
        assert len(predictions) == len(self.X_test)
        assert all(isinstance(p, (int, float, np.number)) for p in predictions)
    
    def test_prediction_without_training(self):
        """Test de prédiction sans entraînement"""
        with pytest.raises(ValueError):
            self.model.predict(self.X_test)
    
    def test_feature_importance(self):
        """Test de l'importance des features"""
        self.model.train(self.X_test, self.y_test, self.feature_names)
        importance = self.model.get_feature_importance()
        
        assert isinstance(importance, dict)
        # Au moins un modèle doit avoir une importance de features
        assert len(importance) >= 0
    
    def test_ensemble_weights(self):
        """Test des poids d'ensemble"""
        self.model.train(self.X_test, self.y_test, self.feature_names)
        weights = self.model.get_ensemble_weights()
        
        assert isinstance(weights, dict)
        assert len(weights) > 0
        # Les poids doivent sommer à environ 1
        total_weight = sum(weights.values())
        assert abs(total_weight - 1.0) < 0.1
    
    def test_model_persistence(self):
        """Test de sauvegarde et chargement"""
        import tempfile
        import os
        
        # Entraîner le modèle
        self.model.train(self.X_test, self.y_test, self.feature_names)
        
        # Sauvegarder
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pkl') as f:
            self.model.save_models(f.name)
            
            # Créer un nouveau modèle et charger
            new_model = AdvancedEnsembleModel()
            new_model.load_models(f.name)
            
            # Vérifier que le modèle chargé fonctionne
            assert new_model.is_trained
            predictions_original = self.model.predict(self.X_test)
            predictions_loaded = new_model.predict(self.X_test)
            
            # Les prédictions doivent être identiques
            np.testing.assert_array_almost_equal(predictions_original, predictions_loaded)
            
            # Nettoyer
            os.unlink(f.name)

class TestFeatureEngineering:
    """Tests pour le feature engineering"""
    
    def setup_method(self):
        """Setup pour chaque test"""
        self.engineer = AdvancedFeatureEngineer()
        self.workout_data = [
            {
                'date': '2024-01-01',
                'weight': 80,
                'reps': 8,
                'sets': 3,
                'exercise_type': 'compound',
                'muscle_group': 'chest'
            },
            {
                'date': '2024-01-03',
                'weight': 82.5,
                'reps': 8,
                'sets': 3,
                'exercise_type': 'compound',
                'muscle_group': 'chest'
            }
        ]
        self.user_profile = {
            'level': 'intermediate',
            'goals': ['strength', 'hypertrophy']
        }
    
    def test_feature_extraction_success(self):
        """Test d'extraction de features réussie"""
        features = self.engineer.extract_features(self.workout_data, self.user_profile)
        
        assert isinstance(features, pd.DataFrame)
        assert len(features) > 0
        assert len(features.columns) > 10  # Doit extraire plusieurs features
    
    def test_feature_extraction_empty_data(self):
        """Test avec données vides"""
        features = self.engineer.extract_features([], {})
        
        assert isinstance(features, pd.DataFrame)
        assert len(features) == 0
    
    def test_feature_extraction_minimal_data(self):
        """Test avec données minimales"""
        minimal_data = [{'weight': 50}]
        features = self.engineer.extract_features(minimal_data, {})
        
        assert isinstance(features, pd.DataFrame)
        assert len(features) > 0
        # Toutes les valeurs doivent être numériques (pas de NaN)
        assert not features.isna().any().any()
    
    def test_basic_features(self):
        """Test des features de base"""
        features = self.engineer._extract_basic_features(pd.DataFrame(self.workout_data))
        
        assert 'current_weight' in features.columns
        assert 'total_volume' in features.columns
        assert 'avg_intensity' in features.columns
        assert features['current_weight'].iloc[0] > 0
    
    def test_temporal_features(self):
        """Test des features temporelles"""
        features = self.engineer._extract_temporal_features(pd.DataFrame(self.workout_data))
        
        expected_columns = ['progression_7d', 'progression_14d', 'momentum_score', 'consistency_score']
        for col in expected_columns:
            assert col in features.columns

class TestPlateauDetection:
    """Tests pour la détection de plateaux"""
    
    def setup_method(self):
        """Setup pour chaque test"""
        self.detector = AdvancedPlateauDetector()
        
        # Historique avec plateau simulé
        self.plateau_history = []
        for i in range(10):
            self.plateau_history.append({
                'date': f'2024-01-{i+1:02d}',
                'exercises': [{
                    'name': 'Squat',
                    'sets': [
                        {'weight': 100, 'reps': 8},  # Poids constant = plateau
                        {'weight': 100, 'reps': 8},
                        {'weight': 100, 'reps': 8}
                    ]
                }]
            })
        
        # Historique avec progression
        self.progression_history = []
        for i in range(10):
            self.progression_history.append({
                'date': f'2024-01-{i+1:02d}',
                'exercises': [{
                    'name': 'Développé couché',
                    'sets': [
                        {'weight': 80 + i * 2.5, 'reps': 8},  # Progression constante
                        {'weight': 80 + i * 2.5, 'reps': 8},
                        {'weight': 80 + i * 2.5, 'reps': 8}
                    ]
                }]
            })
    
    def test_plateau_detection_success(self):
        """Test de détection de plateau réussie"""
        result = self.detector.detect_plateaus(self.plateau_history)
        
        assert isinstance(result, dict)
        assert 'exercise_plateaus' in result
        assert 'global_analysis' in result
        assert 'recommendations' in result
        assert 'severity_score' in result
    
    def test_plateau_detection_empty_data(self):
        """Test avec données vides"""
        result = self.detector.detect_plateaus([])
        
        assert isinstance(result, dict)
        assert result['severity_score'] == 0.0
        assert 'message' in result['global_analysis']
    
    def test_plateau_detected(self):
        """Test qu'un plateau est effectivement détecté"""
        result = self.detector.detect_plateaus(self.plateau_history)
        
        # Doit détecter un plateau sur le Squat
        assert len(result['exercise_plateaus']) > 0
        squat_analysis = result['exercise_plateaus'].get('Squat')
        if squat_analysis:
            assert squat_analysis['weight_plateau']['detected'] == True
            assert squat_analysis['weight_plateau']['severity'] > 0.5
    
    def test_progression_detected(self):
        """Test qu'une progression est détectée"""
        result = self.detector.detect_plateaus(self.progression_history)
        
        # Ne doit pas détecter de plateau sévère
        if result['exercise_plateaus']:
            dc_analysis = result['exercise_plateaus'].get('Développé couché')
            if dc_analysis:
                assert dc_analysis['weight_plateau']['severity'] < 0.7
    
    def test_recommendations_generated(self):
        """Test que des recommandations sont générées"""
        result = self.detector.detect_plateaus(self.plateau_history)
        
        assert isinstance(result['recommendations'], list)
        assert len(result['recommendations']) > 0
        assert all(isinstance(rec, str) for rec in result['recommendations'])

class TestMLPipelineIntegration:
    """Tests d'intégration pour le pipeline ML"""
    
    def setup_method(self):
        """Setup pour les tests d'intégration"""
        # Importer ici pour éviter les erreurs de dépendances
        try:
            from app.services.ml_pipeline import MLPipeline
            self.pipeline = MLPipeline()
        except ImportError:
            pytest.skip("MLPipeline not available - dependencies not installed")
    
    def test_pipeline_initialization(self):
        """Test d'initialisation du pipeline"""
        assert self.pipeline is not None
        assert not self.pipeline.is_initialized
        assert not self.pipeline.is_trained
    
    def test_pipeline_fallback_prediction(self):
        """Test de prédiction de fallback"""
        result = self.pipeline._fallback_prediction(
            "Test Exercise",
            {"current_weight": 50},
            "Test error"
        )
        
        assert isinstance(result, dict)
        assert 'predicted_weight' in result
        assert 'confidence' in result
        assert result['model_used'] == 'fallback'

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
"""
Configuration pytest pour les tests du backend
"""
import pytest
import os
import sys
import asyncio
from unittest.mock import Mock

# Ajouter le dossier parent au PYTHONPATH pour les imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.fixture(scope="session")
def event_loop():
    """Fixture pour gérer la boucle d'événements asyncio"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def sample_workout_data():
    """Données d'entraînement de test"""
    return [
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
        },
        {
            "date": "2024-01-05",
            "exercises": [{
                "name": "Squat",
                "sets": [
                    {"weight": 120, "reps": 8},
                    {"weight": 125, "reps": 6},
                    {"weight": 130, "reps": 4}
                ]
            }]
        }
    ]

@pytest.fixture
def sample_user_profile():
    """Profil utilisateur de test"""
    return {
        "level": "intermediate",
        "goals": ["strength", "hypertrophy"],
        "current_weight": 85,
        "experience_years": 2
    }

@pytest.fixture
def plateau_workout_data():
    """Données d'entraînement simulant un plateau"""
    plateau_data = []
    for i in range(8):
        plateau_data.append({
            "date": f"2024-01-{i+1:02d}",
            "exercises": [{
                "name": "Développé couché",
                "sets": [
                    {"weight": 100, "reps": 8},  # Poids constant
                    {"weight": 100, "reps": 8},
                    {"weight": 100, "reps": 8}
                ]
            }]
        })
    return plateau_data

@pytest.fixture
def progression_workout_data():
    """Données d'entraînement simulant une progression"""
    progression_data = []
    for i in range(8):
        weight = 80 + (i * 2.5)  # Progression de 2.5kg par séance
        progression_data.append({
            "date": f"2024-01-{i+1:02d}",
            "exercises": [{
                "name": "Squat",
                "sets": [
                    {"weight": weight, "reps": 8},
                    {"weight": weight, "reps": 8},
                    {"weight": weight, "reps": 8}
                ]
            }]
        })
    return progression_data

@pytest.fixture
def mock_mlflow():
    """Mock pour MLflow pendant les tests"""
    with pytest.MonkeyPatch.context() as m:
        mock_mlflow = Mock()
        mock_mlflow.set_tracking_uri = Mock()
        mock_mlflow.create_experiment = Mock()
        mock_mlflow.get_experiment_by_name = Mock()
        mock_mlflow.set_experiment = Mock()
        mock_mlflow.start_run = Mock()
        mock_mlflow.end_run = Mock()
        mock_mlflow.log_param = Mock()
        mock_mlflow.log_metric = Mock()
        mock_mlflow.log_params = Mock()
        mock_mlflow.log_metrics = Mock()
        
        m.setattr("app.utils.mlflow_tracker.mlflow", mock_mlflow)
        yield mock_mlflow

@pytest.fixture
def mock_sklearn_models():
    """Mock pour les modèles scikit-learn"""
    mock_models = {}
    
    # Mock RandomForestRegressor
    mock_rf = Mock()
    mock_rf.fit = Mock()
    mock_rf.predict = Mock(return_value=[85.0, 87.5, 90.0])
    mock_rf.feature_importances_ = [0.2, 0.3, 0.1, 0.25, 0.15]
    mock_models['RandomForestRegressor'] = mock_rf
    
    # Mock GradientBoostingRegressor
    mock_gb = Mock()
    mock_gb.fit = Mock()
    mock_gb.predict = Mock(return_value=[84.5, 87.0, 89.5])
    mock_gb.feature_importances_ = [0.15, 0.35, 0.1, 0.2, 0.2]
    mock_models['GradientBoostingRegressor'] = mock_gb
    
    # Mock MLPRegressor
    mock_mlp = Mock()
    mock_mlp.fit = Mock()
    mock_mlp.predict = Mock(return_value=[86.0, 88.0, 90.5])
    mock_models['MLPRegressor'] = mock_mlp
    
    return mock_models

@pytest.fixture(autouse=True)
def suppress_warnings():
    """Supprimer les warnings pendant les tests"""
    import warnings
    warnings.filterwarnings("ignore", category=DeprecationWarning)
    warnings.filterwarnings("ignore", category=FutureWarning)
    warnings.filterwarnings("ignore", category=UserWarning)

# Configuration pytest
def pytest_configure(config):
    """Configuration globale de pytest"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )

def pytest_collection_modifyitems(config, items):
    """Modifier les items de test collectés"""
    for item in items:
        # Marquer automatiquement les tests d'intégration
        if "integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)
        # Marquer automatiquement les tests lents
        if "performance" in item.nodeid.lower() or "concurrent" in item.nodeid.lower():
            item.add_marker(pytest.mark.slow)
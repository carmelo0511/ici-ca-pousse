import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

class TestAPI:
    """Tests d'intégration pour l'API FastAPI"""
    
    def test_health_check(self):
        """Test du health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ici-ca-pousse-ml-api"
        assert "ml_services" in data
    
    def test_ml_status(self):
        """Test du statut ML endpoint"""
        response = client.get("/api/ml/status")
        assert response.status_code == 200
        data = response.json()
        assert "ml_pipeline_available" in data
        assert "ensemble_model_available" in data
        assert "features" in data
    
    def test_predict_valid_data(self):
        """Test de prédiction avec données valides"""
        payload = {
            "exercise_name": "Développé couché",
            "user_data": {
                "current_weight": 80,
                "level": "intermediate",
                "goals": ["strength"]
            },
            "workout_history": [
                {
                    "date": "2024-01-01",
                    "exercises": [{
                        "name": "Développé couché",
                        "sets": [
                            {"weight": 75, "reps": 8},
                            {"weight": 77.5, "reps": 6}
                        ]
                    }]
                }
            ]
        }
        
        response = client.post("/api/ml/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "prediction" in data
        assert "confidence" in data
    
    def test_predict_empty_data(self):
        """Test de prédiction avec données vides"""
        payload = {
            "exercise_name": "",
            "user_data": {},
            "workout_history": []
        }
        
        response = client.post("/api/ml/predict", json=payload)
        assert response.status_code == 200  # Doit fonctionner avec fallback
        data = response.json()
        assert data["success"] == True
    
    def test_predict_invalid_json(self):
        """Test de prédiction avec JSON invalide"""
        response = client.post("/api/ml/predict", json={})
        assert response.status_code == 422  # Validation error
    
    def test_train_valid_data(self):
        """Test d'entraînement avec données valides"""
        payload = {
            "user_id": "test_user_123",
            "new_data": [
                {
                    "date": "2024-01-01",
                    "weight": 80,
                    "reps": 8,
                    "sets": 3
                }
            ],
            "retrain": False
        }
        
        response = client.post("/api/ml/train", json=payload)
        # Peut retourner 503 si ML pipeline non disponible, ce qui est normal
        assert response.status_code in [200, 503]
    
    def test_analytics_endpoint(self):
        """Test de l'endpoint analytics"""
        response = client.get("/api/ml/analytics")
        assert response.status_code == 200
        data = response.json()
        # Peut retourner une erreur si pipeline non disponible
        assert "model_performance" in data or "error" in data
    
    def test_cors_headers(self):
        """Test des headers CORS"""
        response = client.options("/api/ml/predict")
        assert response.status_code == 200
        # Les headers CORS sont gérés par FastAPI middleware
    
    def test_predict_large_payload(self):
        """Test avec un payload volumineux"""
        # Créer un historique volumineux
        large_history = []
        for i in range(100):
            large_history.append({
                "date": f"2024-01-{i+1:02d}",
                "exercises": [{
                    "name": "Squat",
                    "sets": [{"weight": 100 + i, "reps": 8}]
                }]
            })
        
        payload = {
            "exercise_name": "Squat",
            "user_data": {"current_weight": 150},
            "workout_history": large_history
        }
        
        response = client.post("/api/ml/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True

class TestAPIPerformance:
    """Tests de performance pour l'API"""
    
    def test_prediction_response_time(self):
        """Test du temps de réponse pour les prédictions"""
        import time
        
        payload = {
            "exercise_name": "Développé couché",
            "user_data": {"current_weight": 80},
            "workout_history": [
                {
                    "date": "2024-01-01",
                    "exercises": [{
                        "name": "Développé couché",
                        "sets": [{"weight": 75, "reps": 8}]
                    }]
                }
            ]
        }
        
        start_time = time.time()
        response = client.post("/api/ml/predict", json=payload)
        end_time = time.time()
        
        assert response.status_code == 200
        # La réponse doit être rapide (moins de 5 secondes)
        assert (end_time - start_time) < 5.0
    
    def test_concurrent_requests(self):
        """Test de requêtes concurrentes"""
        import concurrent.futures
        import threading
        
        def make_request():
            payload = {
                "exercise_name": "Test",
                "user_data": {"current_weight": 50},
                "workout_history": []
            }
            response = client.post("/api/ml/predict", json=payload)
            return response.status_code
        
        # Faire 10 requêtes concurrentes
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # Toutes les requêtes doivent réussir
        assert all(status == 200 for status in results)

if __name__ == "__main__":
    pytest.main([__file__])